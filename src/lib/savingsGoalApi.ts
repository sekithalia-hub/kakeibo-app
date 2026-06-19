import { supabase } from "./supabase";
import type { SavingsGoal } from "../types";

// ── DB行 ↔ SavingsGoal型の変換 ───────────────────────────────

// DB（スネークケース）→ アプリ（キャメルケース）
const fromRow = (row: Record<string, unknown>): SavingsGoal => ({
  id:            row.id as string,
  name:          row.name as string,
  targetAmount:  row.target_amount as number,
  currentAmount: row.current_amount as number,
  deadline:      (row.deadline as string) ?? null,
  createdAt:     row.created_at as string,
});

// アプリ（キャメルケース）→ DB（スネークケース）
const toRow = (goal: SavingsGoal, userId: string) => ({
  id:             goal.id,
  user_id:        userId,
  name:           goal.name,
  target_amount:  goal.targetAmount,
  current_amount: goal.currentAmount,
  deadline:       goal.deadline,
  created_at:     goal.createdAt,
});

// ── CRUD ─────────────────────────────────────────────────────

/** 自分の目的貯金を全件取得（作成日時の昇順） */
export const fetchSavingsGoals = async (): Promise<SavingsGoal[]> => {
  const { data, error } = await supabase
    .from("savings_goals")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("fetchSavingsGoals error:", error.message);
    return [];
  }
  return (data ?? []).map(fromRow);
};

/** 目的貯金を1件追加 */
export const insertSavingsGoal = async (
  goal: SavingsGoal,
  userId: string
): Promise<void> => {
  const { error } = await supabase
    .from("savings_goals")
    .insert(toRow(goal, userId));

  if (error) console.error("insertSavingsGoal error:", error.message);
};

/** 目的貯金の現在金額を更新 */
export const updateSavingsGoalAmount = async (
  id: string,
  currentAmount: number
): Promise<void> => {
  const { error } = await supabase
    .from("savings_goals")
    .update({ current_amount: currentAmount })
    .eq("id", id);

  if (error) console.error("updateSavingsGoalAmount error:", error.message);
};

/** 目的貯金を削除 */
export const deleteSavingsGoalById = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("savings_goals")
    .delete()
    .eq("id", id);

  if (error) console.error("deleteSavingsGoalById error:", error.message);
};