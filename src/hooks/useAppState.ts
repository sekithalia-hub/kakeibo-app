import { useState, useEffect, useRef } from "react";
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
import {
  fetchSavingsGoals,
  insertSavingsGoal,
  updateSavingsGoalAmount,
  deleteSavingsGoalById,
} from "../lib/savingsGoalApi";
import {
  fetchTransactions,
  insertTransaction,
  updateTransaction,
  deleteTransactionById,
} from "../lib/transactionApi";

export const useAppState = () => {
  const [envelopes, setEnvelopes] = useState<Envelope[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [envLoading, setEnvLoading] = useState(true);
  const [goalsLoading, setGoalsLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(true);

  // ── 修正ポイント①：userId を useRef でキャッシュ ─────────────
  // 変更前：操作のたびに supabase.auth.getSession() を毎回呼んでいた
  //         → 非同期処理が毎回走りパフォーマンスが低下
  // 変更後：初回取得した userId を useRef に保持して使い回す
  const userIdRef = useRef<string | null>(null);

  // ── 初回データ取得 ────────────────────────────────────────────
  useEffect(() => {
    const loadAll = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user.id ?? null;

      // userId を ref にキャッシュ
      userIdRef.current = userId;

      if (!userId) {
        setEnvLoading(false);
        setGoalsLoading(false);
        setTxLoading(false);
        return;
      }

      // ── 修正ポイント②：3つを並行取得（変更なし・維持） ────────
      const [envData, goalsData, txData] = await Promise.all([
        fetchEnvelopes(),
        fetchSavingsGoals(),
        // ── 修正ポイント③：最新100件のみ取得 ──────────────────
        // 変更前：件数無制限で全件取得していた
        // 変更後：最新100件に制限することで初回取得を高速化
        fetchTransactions(100),
      ]);

      setEnvelopes(envData);
      setSavingsGoals(goalsData);
      setTransactions(txData);
      setEnvLoading(false);
      setGoalsLoading(false);
      setTxLoading(false);
    };

    loadAll();
  }, []);

  // ── 取引追加の内部ヘルパー ────────────────────────────────────
  const addTransaction = async (
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
    // ── 修正ポイント①の適用：ref からキャッシュを取得 ──────────
    const userId = userIdRef.current;
    if (!userId) return;

    const newTransaction: Transaction = {
      id: generateId("tx"),
      type,
      amount,
      memo,
      date: new Date().toISOString(),
      relatedName,
      envelopeId:     ids.envelopeId     ?? null,
      fromEnvelopeId: ids.fromEnvelopeId ?? null,
      toEnvelopeId:   ids.toEnvelopeId   ?? null,
      savingsGoalId:  ids.savingsGoalId  ?? null,
    };

    await insertTransaction(newTransaction, userId);
    setTransactions((prev) => [newTransaction, ...prev]);
  };

  // ── 封筒 ──────────────────────────────────────────────────────

  const addEnvelope = async (
    name: string,
    balance: number,
    color: string
  ) => {
    const userId = userIdRef.current; // ← ref から取得
    if (!userId) return;

    const newEnvelope: Envelope = {
      id: generateId("env"),
      name,
      balance,
      color,
      createdAt: new Date().toISOString(),
    };

    await insertEnvelope(newEnvelope, userId);
    setEnvelopes((prev) => [...prev, newEnvelope]);
  };

  const editEnvelope = async (id: string, name: string, color: string) => {
    await updateEnvelopeMeta(id, name, color);
    setEnvelopes((prev) =>
      prev.map((e) => (e.id === id ? { ...e, name, color } : e))
    );
  };

  const deleteEnvelope = async (id: string) => {
    await deleteEnvelopeById(id);
    setEnvelopes((prev) => prev.filter((e) => e.id !== id));
  };

  // ── 収入・支出 ────────────────────────────────────────────────

  const addIncome = async (
    envelopeId: string,
    amount: number,
    memo: string
  ) => {
    const envelope = envelopes.find((e) => e.id === envelopeId);
    if (!envelope) return;

    const newBalance = envelope.balance + amount;
    await updateEnvelopeBalance(envelopeId, newBalance);
    setEnvelopes((prev) =>
      prev.map((e) =>
        e.id === envelopeId ? { ...e, balance: newBalance } : e
      )
    );
    await addTransaction("income", amount, memo, envelope.name, { envelopeId });
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
    await updateEnvelopeBalance(envelopeId, newBalance);
    setEnvelopes((prev) =>
      prev.map((e) =>
        e.id === envelopeId ? { ...e, balance: newBalance } : e
      )
    );
    await addTransaction("expense", amount, memo, envelope.name, { envelopeId });
  };

  // ── 封筒間送金 ────────────────────────────────────────────────

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

  // ── 目的貯金 ──────────────────────────────────────────────────

  const addSavingsGoal = async (
    name: string,
    targetAmount: number,
    currentAmount: number,
    deadline: string | null
  ) => {
    const userId = userIdRef.current; // ← ref から取得
    if (!userId) return;

    const newGoal: SavingsGoal = {
      id: generateId("goal"),
      name,
      targetAmount,
      currentAmount,
      deadline,
      createdAt: new Date().toISOString(),
    };

    await insertSavingsGoal(newGoal, userId);
    setSavingsGoals((prev) => [...prev, newGoal]);
  };

  const deleteSavingsGoal = async (id: string) => {
    await deleteSavingsGoalById(id);
    setSavingsGoals((prev) => prev.filter((g) => g.id !== id));
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
    const newCurrentAmount = goal.currentAmount + amount;

    await updateEnvelopeBalance(fromEnvelopeId, newBalance);
    await updateSavingsGoalAmount(goalId, newCurrentAmount);

    setEnvelopes((prev) =>
      prev.map((e) =>
        e.id === fromEnvelopeId ? { ...e, balance: newBalance } : e
      )
    );
    setSavingsGoals((prev) =>
      prev.map((g) =>
        g.id === goalId ? { ...g, currentAmount: newCurrentAmount } : g
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

  // ── 取引編集・削除 ────────────────────────────────────────────

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

    let newBalance = envelope.balance;
    if (tx.type === "income")  newBalance -= tx.amount;
    if (tx.type === "expense") newBalance += tx.amount;
    if (newType === "income")  newBalance += newAmount;
    if (newType === "expense") newBalance -= newAmount;

    await updateEnvelopeBalance(tx.envelopeId, newBalance);
    await updateTransaction(id, newType, newAmount, newMemo, newDate);

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

    let newBalance = envelope.balance;
    if (tx.type === "income")  newBalance -= tx.amount;
    if (tx.type === "expense") newBalance += tx.amount;

    await updateEnvelopeBalance(tx.envelopeId, newBalance);
    await deleteTransactionById(id);

    setEnvelopes((prev) =>
      prev.map((e) =>
        e.id === tx.envelopeId ? { ...e, balance: newBalance } : e
      )
    );
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  return {
    envelopes,
    savingsGoals,
    transactions,
    envLoading,
    goalsLoading,
    txLoading,
    addEnvelope,
    editEnvelope,
    deleteEnvelope,
    addIncome,
    addExpense,
    transferBetweenEnvelopes,
    addSavingsGoal,
    deleteSavingsGoal,
    depositToSavingsGoal,
    editTransaction,
    deleteTransaction,
  };
};