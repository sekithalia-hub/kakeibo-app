import { supabase } from "./supabase";
import type { Envelope } from "../types";

// ── DB行 ↔ Envelope型の変換 ──────────────────────────────────

// DB（スネークケース）→ アプリ（キャメルケース）
const fromRow = (row: Record<string, unknown>): Envelope => ({
  id:        row.id as string,
  name:      row.name as string,
  balance:   row.balance as number,
  color:     row.color as string,
  createdAt: row.created_at as string,
});

// アプリ（キャメルケース）→ DB（スネークケース）
const toRow = (envelope: Envelope, userId: string) => ({
  id:         envelope.id,
  user_id:    userId,
  name:       envelope.name,
  balance:    envelope.balance,
  color:      envelope.color,
  created_at: envelope.createdAt,
});

// ── CRUD ─────────────────────────────────────────────────────

/** 自分の封筒を全件取得（作成日時の昇順） */
export const fetchEnvelopes = async (): Promise<Envelope[]> => {
  const { data, error } = await supabase
    .from("envelopes")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("fetchEnvelopes error:", error.message);
    return [];
  }
  return (data ?? []).map(fromRow);
};

/** 封筒を1件追加 */
export const insertEnvelope = async (
  envelope: Envelope,
  userId: string
): Promise<void> => {
  const { error } = await supabase
    .from("envelopes")
    .insert(toRow(envelope, userId));

  if (error) console.error("insertEnvelope error:", error.message);
};

/** 封筒の名前・カラーを更新 */
export const updateEnvelopeMeta = async (
  id: string,
  name: string,
  color: string
): Promise<void> => {
  const { error } = await supabase
    .from("envelopes")
    .update({ name, color })
    .eq("id", id);

  if (error) console.error("updateEnvelopeMeta error:", error.message);
};

/** 封筒の残高を更新 */
export const updateEnvelopeBalance = async (
  id: string,
  balance: number
): Promise<void> => {
  const { error } = await supabase
    .from("envelopes")
    .update({ balance })
    .eq("id", id);

  if (error) console.error("updateEnvelopeBalance error:", error.message);
};

/** 封筒を削除 */
export const deleteEnvelopeById = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("envelopes")
    .delete()
    .eq("id", id);

  if (error) console.error("deleteEnvelopeById error:", error.message);
};