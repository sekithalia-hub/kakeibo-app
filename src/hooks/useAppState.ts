import { useState, useEffect } from "react";
import type { Envelope, SavingsGoal, Transaction, TransactionType } from "../types";
import { generateId } from "../utils";
import { supabase } from "../lib/supabase";
import {
  fetchEnvelopes,
  insertEnvelope,
  updateEnvelopeMeta,
  updateEnvelopeBalance,
  deleteEnvelopeById,
} from "../lib/envelopeApi";

// ────────────────────────────────────────
// LocalStorage のキー定数
// ────────────────────────────────────────
const KEYS = {
  envelopes: "envelopes",
  savingsGoals: "savingsGoals",
  transactions: "transactions",
} as const;

// ────────────────────────────────────────
// LocalStorage の読み書きヘルパー
// ────────────────────────────────────────
const load = <T>(key: string): T[] => {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "[]");
  } catch {
    return [];
  }
};

const save = <T>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};
export const useAppState = () => {
  const [envelopes, setEnvelopes] = useState<Envelope[]>([]);
  const [envLoading, setEnvLoading] = useState(true); // ロード中フラグ
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() =>
    load<SavingsGoal>(KEYS.savingsGoals)
  );
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    load<Transaction>(KEYS.transactions)
  );

  // 状態が変わるたびに LocalStorage へ保存
  useEffect(() => {
    // ログイン中のユーザーIDを取得してから封筒を読み込む
    const loadEnvelopes = async () => {
      setEnvLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setEnvLoading(false);
        return;
      }
      const data = await fetchEnvelopes();
      setEnvelopes(data);
      setEnvLoading(false);
    };
    loadEnvelopes();
  }, []); // 初回のみ実行
  useEffect(() => { save(KEYS.savingsGoals, savingsGoals); }, [savingsGoals]);
  useEffect(() => { save(KEYS.transactions, transactions); }, [transactions]);
  // 取引を1件追加する内部ヘルパー
  const addTransaction = (
    type: TransactionType,
    amount: number,
    memo: string,
    relatedName: string,
    ids: {
      envelopeId?: string;
      fromEnvelopeId?: string;
      toEnvelopeId?: string;
      savingsGoalId?: string;
    }
  ) => {
    const newTransaction: Transaction = {
      id: generateId("tx"),
      type,
      amount,
      memo,
      date: new Date().toISOString(),
      relatedName,
      envelopeId: ids.envelopeId ?? null,
      fromEnvelopeId: ids.fromEnvelopeId ?? null,
      toEnvelopeId: ids.toEnvelopeId ?? null,
      savingsGoalId: ids.savingsGoalId ?? null,
    };
    setTransactions((prev) => [newTransaction, ...prev]);
  };
  // ── 封筒 ──────────────────────────────────────────────────

  const addEnvelope = async (
    name: string,
    balance: number,
    color: string
  ) => {
    // ログイン中のユーザーIDを取得
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const newEnvelope: Envelope = {
      id: generateId("env"),
      name,
      balance,
      color,
      createdAt: new Date().toISOString(),
    };

    // Supabase に保存してからローカルに反映
    await insertEnvelope(newEnvelope, session.user.id);
    setEnvelopes((prev) => [...prev, newEnvelope]);
  };

  const editEnvelope = async (
    id: string,
    name: string,
    color: string
  ) => {
    await updateEnvelopeMeta(id, name, color);
    setEnvelopes((prev) =>
      prev.map((e) => (e.id === id ? { ...e, name, color } : e))
    );
  };

  
  const deleteEnvelope = async (id: string) => {
  await deleteEnvelopeById(id);

  setEnvelopes((prev) =>
    prev.filter((e) => e.id !== id)
  );
};
  // ── 収入・支出 ────────────────────────────────────────────

  const addIncome = async (
    envelopeId: string,
    amount: number,
    memo: string
  ) => {
    const envelope = envelopes.find((e) => e.id === envelopeId);
    if (!envelope) return;

    const newBalance = envelope.balance + amount;

    // Supabase の残高を更新
    await updateEnvelopeBalance(envelopeId, newBalance);

    setEnvelopes((prev) =>
      prev.map((e) =>
        e.id === envelopeId ? { ...e, balance: newBalance } : e
      )
    );
    await addTransaction("income", amount, memo, envelope.name, {
      envelopeId,
    });
  };

  const addExpense = async (
    envelopeId: string,
    amount: number,
    memo: string
  ) => {
    const envelope = envelopes.find((e) => e.id === envelopeId);
    if (!envelope) return;
    if (envelope.balance < amount) return;

    const newBalance = envelope.balance - amount;

    // Supabase の残高を更新
    await updateEnvelopeBalance(envelopeId, newBalance);

    setEnvelopes((prev) =>
      prev.map((e) =>
        e.id === envelopeId ? { ...e, balance: newBalance } : e
      )
    );
    await addTransaction("expense", amount, memo, envelope.name, {
      envelopeId,
    });
  };

  // ── 封筒間送金 ────────────────────────────────────────────

  const transferBetweenEnvelopes = async (
    fromId: string,
    toId: string,
    amount: number,
    memo: string
  ) => {
    const fromEnvelope = envelopes.find((e) => e.id === fromId);
    const toEnvelope = envelopes.find((e) => e.id === toId);
    if (!fromEnvelope || !toEnvelope) return;
    if (fromEnvelope.balance < amount) return;

    const newFromBalance = fromEnvelope.balance - amount;
    const newToBalance = toEnvelope.balance + amount;

    // Supabase の残高を更新（送金元・送金先それぞれ）
    await updateEnvelopeBalance(fromId, newFromBalance);
    await updateEnvelopeBalance(toId, newToBalance);

    setEnvelopes((prev) =>
      prev.map((e) => {
        if (e.id === fromId) return { ...e, balance: newFromBalance };
        if (e.id === toId)   return { ...e, balance: newToBalance };
        return e;
      })
    );
    await addTransaction(
      "transfer",
      amount,
      memo,
      `${fromEnvelope.name} → ${toEnvelope.name}`,
      { fromEnvelopeId: fromId, toEnvelopeId: toId }
    );
  };

  // ── 目的貯金 ──────────────────────────────────────────────
  
  const addSavingsGoal = (
  name: string,
  targetAmount: number
) => {
  const newGoal: SavingsGoal = {
  id: generateId("goal"),
  name,
  targetAmount,
  currentAmount: 0,
  deadline: null,
  createdAt: new Date().toISOString(),
};

  setSavingsGoals((prev) => [...prev, newGoal]);
};

const deleteSavingsGoal = (id: string) => {
  setSavingsGoals((prev) =>
    prev.filter((g) => g.id !== id)
  );
};
  const depositToSavingsGoal = async (
    goalId: string,
    fromEnvelopeId: string,
    amount: number
  ) => {
    const goal = savingsGoals.find((g) => g.id === goalId);
    const envelope = envelopes.find((e) => e.id === fromEnvelopeId);
    if (!goal || !envelope) return;
    if (envelope.balance < amount) return;

    const newBalance = envelope.balance - amount;

    // Supabase の残高を更新
    await updateEnvelopeBalance(fromEnvelopeId, newBalance);

    setEnvelopes((prev) =>
      prev.map((e) =>
        e.id === fromEnvelopeId ? { ...e, balance: newBalance } : e
      )
    );
    setSavingsGoals((prev) =>
      prev.map((g) =>
        g.id === goalId
          ? { ...g, currentAmount: g.currentAmount + amount }
          : g
      )
    );
    await addTransaction(
      "savings_deposit",
      amount,
      "",
      goal.name,
      { fromEnvelopeId, savingsGoalId: goalId }
    );
  };
    // ── 取引編集・削除 ────────────────────────────────────────

  /**
   * 収入・支出の取引を編集する
   * 旧取引の残高効果を打ち消してから、新取引の効果を適用する
   */
  const editTransaction = async (
    id: string,
    newType: "income" | "expense",
    newAmount: number,
    newMemo: string,
    newDate: string
  ) => {
    const tx = transactions.find((t) => t.id === id);
    if (!tx) return;
    if (tx.type !== "income" && tx.type !== "expense") return;
    if (!tx.envelopeId) return;

    const envelope = envelopes.find((e) => e.id === tx.envelopeId);
    if (!envelope) return;

    // 旧取引の効果を打ち消して新取引の効果を適用
    let newBalance = envelope.balance;
    if (tx.type === "income")   newBalance -= tx.amount;
    if (tx.type === "expense")  newBalance += tx.amount;
    if (newType === "income")   newBalance += newAmount;
    if (newType === "expense")  newBalance -= newAmount;

    // Supabase の残高を更新
    await updateEnvelopeBalance(tx.envelopeId, newBalance);

    setEnvelopes((prev) =>
      prev.map((e) =>
        e.id === tx.envelopeId ? { ...e, balance: newBalance } : e
      )
    );
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, type: newType, amount: newAmount, memo: newMemo, date: newDate }
          : t
      )
    );
  };

  const deleteTransaction = async (id: string) => {
    const tx = transactions.find((t) => t.id === id);
    if (!tx) return;
    if (tx.type !== "income" && tx.type !== "expense") return;
    if (!tx.envelopeId) return;

    const envelope = envelopes.find((e) => e.id === tx.envelopeId);
    if (!envelope) return;

    // 取引の効果を打ち消す
    let newBalance = envelope.balance;
    if (tx.type === "income")  newBalance -= tx.amount;
    if (tx.type === "expense") newBalance += tx.amount;

    // Supabase の残高を更新
    await updateEnvelopeBalance(tx.envelopeId, newBalance);

    setEnvelopes((prev) =>
      prev.map((e) =>
        e.id === tx.envelopeId ? { ...e, balance: newBalance } : e
      )
    );
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };
  
  // ── return ────────────────────────────────────────────────
  return {
    // 状態
    envelopes,
    savingsGoals,
    transactions,
    envLoading,   // ✅ 追加
    // 封筒
    addEnvelope,
    editEnvelope,
    deleteEnvelope,
    // 収支
    addIncome,
    addExpense,
    // 送金
    transferBetweenEnvelopes,
    // 目的貯金
    addSavingsGoal,
    deleteSavingsGoal,
    depositToSavingsGoal,
    // 取引編集・削除
    editTransaction,
    deleteTransaction,
  };
  
};// ← useAppState の閉じカッコ