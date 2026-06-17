import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// ── 環境変数チェック ──────────────────────────────────────────
// 未設定の場合は開発時に気づけるようにエラーを出す
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "[Supabase] 環境変数が設定されていません。\n" +
    ".env.local に VITE_SUPABASE_URL と VITE_SUPABASE_ANON_KEY を設定してください。"
  );
}

// ── クライアント作成 ──────────────────────────────────────────
// アプリ全体でこの1つのインスタンスを使い回す
export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey
);

// ── 後方互換メモ ──────────────────────────────────────────────
// 現在：認証のみ使用
// 次フェーズ（12D）：envelopes テーブルへの CRUD に使用
// 次フェーズ（12E）：transactions テーブルへの CRUD に使用