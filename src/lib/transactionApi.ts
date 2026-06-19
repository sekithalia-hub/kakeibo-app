import { supabase } from "./supabase";
import type { Transaction } from "../types";

// ── DB行 ↔ Transaction型の変換 ───────────────────────────────

// DB（スネークケース）→ アプリ（キャメルケース）
const fromRow = (row: Record<string, unknown>): Transaction => ({
  id:             row.id as string,
  type:           row.type as Transaction["type"],
  amount:         row.amount as number,
  memo:           row.memo as string,
  date:           row.date as string,
  relatedName:    row.related_name as string,
  envelopeId:     (row.envelope_id as string) ?? null,
  fromEnvelopeId: (row.from_envelope_id as string) ?? null,
  toEnvelopeId:   (row.to_envelope_id as string) ?? null,
  savingsGoalId:  (row.savings_goal_id as string) ?? null,
});

// アプリ（キャメルケース）→ DB（スネークケース）
const toRow = (tx: Transaction, userId: string) => ({
  id:               tx.id,
  user_id:          userId,
  type:             tx.type,
  amount:           tx.amount,
  memo:             tx.memo,
  date:             tx.date,
  related_name:     tx.relatedName,
  envelope_id:      tx.envelopeId,
  from_envelope_id: tx.fromEnvelopeId,
  to_envelope_id:   tx.toEnvelopeId,
  savings_goal_id:  tx.savingsGoalId,
});

// ── CRUD ─────────────────────────────────────────────────────

/** 自分の取引を全件取得（新しい順） */
export const fetchTransactions = async (): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .order("date", { ascending: false });

  if (error) {
    console.error("fetchTransactions error:", error.message);
    return [];
  }
  return (data ?? []).map(fromRow);
};

/** 取引を1件追加 */
export const insertTransaction = async (
  tx: Transaction,
  userId: string
): Promise<void> => {
  const { error } = await supabase
    .from("transactions")
    .insert(toRow(tx, userId));

  if (error) console.error("insertTransaction error:", error.message);
};

/** 取引を1件更新（収入・支出のみ） */
export const updateTransaction = async (
  id: string,
  newType: "income" | "expense",
  newAmount: number,
  newMemo: string,
  newDate: string
): Promise<void> => {
  const { error } = await supabase
    .from("transactions")
    .update({
      type:   newType,
      amount: newAmount,
      memo:   newMemo,
      date:   newDate,
    })
    .eq("id", id);

  if (error) console.error("updateTransaction error:", error.message);
};

/** 取引を1件削除 */
export const deleteTransactionById = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id);

  if (error) console.error("deleteTransactionById error:", error.message);
};