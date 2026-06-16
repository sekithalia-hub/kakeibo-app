import { useState, useEffect } from "react";
import type { Envelope, SavingsGoal, Transaction, TransactionType } from "../types";
import { generateId } from "../utils";

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
  const [envelopes, setEnvelopes] = useState<Envelope[]>(() =>
    load<Envelope>(KEYS.envelopes)
  );
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() =>
    load<SavingsGoal>(KEYS.savingsGoals)
  );
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    load<Transaction>(KEYS.transactions)
  );

  // 状態が変わるたびに LocalStorage へ保存
  useEffect(() => { save(KEYS.envelopes, envelopes); }, [envelopes]);
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

  const addEnvelope = (
    name: string,
    balance: number,
    color: string
  ) => {
    const newEnvelope: Envelope = {
      id: generateId("env"),
      name,
      balance,
      color,
      createdAt: new Date().toISOString(),
    };
    setEnvelopes((prev) => [...prev, newEnvelope]);
  };

  const editEnvelope = (id: string, name: string, color: string) => {
    setEnvelopes((prev) =>
      prev.map((e) => (e.id === id ? { ...e, name, color } : e))
    );
  };

  const deleteEnvelope = (id: string) => {
    setEnvelopes((prev) => prev.filter((e) => e.id !== id));
  };
  // ── 収入・支出 ────────────────────────────────────────────

  const addIncome = (envelopeId: string, amount: number, memo: string) => {
    const envelope = envelopes.find((e) => e.id === envelopeId);
    if (!envelope) return;

    setEnvelopes((prev) =>
      prev.map((e) =>
        e.id === envelopeId ? { ...e, balance: e.balance + amount } : e
      )
    );
    addTransaction("income", amount, memo, envelope.name, { envelopeId });
  };

  const addExpense = (envelopeId: string, amount: number, memo: string) => {
    const envelope = envelopes.find((e) => e.id === envelopeId);
    if (!envelope) return;
    if (envelope.balance < amount) return; // 残高不足は登録しない

    setEnvelopes((prev) =>
      prev.map((e) =>
        e.id === envelopeId ? { ...e, balance: e.balance - amount } : e
      )
    );
    addTransaction("expense", amount, memo, envelope.name, { envelopeId });
  };
  // ── 封筒間送金 ────────────────────────────────────────────

  const transferBetweenEnvelopes = (
    fromId: string,
    toId: string,
    amount: number,
    memo: string
  ) => {
    const fromEnvelope = envelopes.find((e) => e.id === fromId);
    const toEnvelope = envelopes.find((e) => e.id === toId);
    if (!fromEnvelope || !toEnvelope) return;
    if (fromEnvelope.balance < amount) return; // 残高不足は登録しない

    // 送金元と送金先を1回の setEnvelopes でまとめて更新
    setEnvelopes((prev) =>
      prev.map((e) => {
        if (e.id === fromId) return { ...e, balance: e.balance - amount };
        if (e.id === toId)   return { ...e, balance: e.balance + amount };
        return e;
      })
    );
    addTransaction(
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
    targetAmount: number,
    currentAmount: number,
    deadline: string | null
  ) => {
    const newGoal: SavingsGoal = {
      id: generateId("goal"),
      name,
      targetAmount,
      currentAmount,
      deadline,
      createdAt: new Date().toISOString(),
    };
    setSavingsGoals((prev) => [...prev, newGoal]);
  };

  const deleteSavingsGoal = (id: string) => {
    setSavingsGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const depositToSavingsGoal = (
    goalId: string,
    fromEnvelopeId: string,
    amount: number
  ) => {
    const goal = savingsGoals.find((g) => g.id === goalId);
    const envelope = envelopes.find((e) => e.id === fromEnvelopeId);
    if (!goal || !envelope) return;
    if (envelope.balance < amount) return; // 残高不足は登録しない

    setEnvelopes((prev) =>
      prev.map((e) =>
        e.id === fromEnvelopeId ? { ...e, balance: e.balance - amount } : e
      )
    );
    setSavingsGoals((prev) =>
      prev.map((g) =>
        g.id === goalId
          ? { ...g, currentAmount: g.currentAmount + amount }
          : g
      )
    );
    addTransaction(
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
  const editTransaction = (
    id: string,
    newType: "income" | "expense",
    newAmount: number,
    newMemo: string,
    newDate: string
  ) => {
    const tx = transactions.find((t) => t.id === id);
    if (!tx) return;
    // 収入・支出以外は編集しない
    if (tx.type !== "income" && tx.type !== "expense") return;
    if (!tx.envelopeId) return;

    setEnvelopes((prev) =>
      prev.map((e) => {
        if (e.id !== tx.envelopeId) return e;
        let balance = e.balance;
        // 旧取引の効果を打ち消す
        if (tx.type === "income") balance -= tx.amount;
        if (tx.type === "expense") balance += tx.amount;
        // 新取引の効果を適用する
        if (newType === "income") balance += newAmount;
        if (newType === "expense") balance -= newAmount;
        return { ...e, balance };
      })
    );

    setTransactions((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, type: newType, amount: newAmount, memo: newMemo, date: newDate }
          : t
      )
    );
  };

  /**
   * 収入・支出の取引を削除する
   * 取引の残高効果を打ち消してからリストから削除する
   */
  const deleteTransaction = (id: string) => {
    const tx = transactions.find((t) => t.id === id);
    if (!tx) return;
    if (tx.type !== "income" && tx.type !== "expense") return;
    if (!tx.envelopeId) return;

    setEnvelopes((prev) =>
      prev.map((e) => {
        if (e.id !== tx.envelopeId) return e;
        let balance = e.balance;
        // 取引の効果を打ち消す
        if (tx.type === "income") balance -= tx.amount;
        if (tx.type === "expense") balance += tx.amount;
        return { ...e, balance };
      })
    );

    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };
  
  // ── return ────────────────────────────────────────────────
  return {
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

  // 状態
  envelopes,
  savingsGoals,
  transactions,
 };
}; // ← useAppState の閉じカッコ