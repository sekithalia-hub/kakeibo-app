import { useState, useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

type UseAuthReturn = {
  user: User | null;        // ログイン中のユーザー（未ログインはnull）
  loading: boolean;         // 認証状態の確認中フラグ
  errorMessage: string;     // エラーメッセージ（日本語）
  signUp: (email: string, password: string) => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
};

// ── Supabase のエラーコードを日本語に変換 ────────────────────
// 後フェーズで envelopes・transactions を追加しても
// このファイルだけ修正すれば日本語化できる
const toJapaneseError = (message: string): string => {
  if (message.includes("Invalid login credentials")) {
    return "メールアドレスまたはパスワードが間違っています";
  }
  if (message.includes("User already registered")) {
    return "このメールアドレスはすでに登録されています";
  }
  if (message.includes("Password should be at least")) {
    return "パスワードは6文字以上で入力してください";
  }
  if (message.includes("Unable to validate email")) {
    return "メールアドレスの形式が正しくありません";
  }
  if (message.includes("Email not confirmed")) {
    return "メールアドレスの確認が完了していません";
  }
  return "エラーが発生しました。もう一度お試しください";
};

// ── フック本体 ────────────────────────────────────────────────
export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // 初回確認中はtrue
  const [errorMessage, setErrorMessage] = useState("");

  // ── 初回：現在のログイン状態を確認 ──────────────────────────
  // ページをリロードしてもログイン状態を保持するために必要
  useEffect(() => {
    // 現在のセッションを取得
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // ログイン・ログアウトの変化を監視
    // 別タブでログアウトしたときにも自動で反映される
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // コンポーネントが消えたとき（アンマウント時）に監視を解除
    return () => subscription.unsubscribe();
  }, []);

  // ── 新規登録 ───────────────────────────────
const signUp = async (
  email: string,
  password: string
): Promise<boolean> => {

  // エラー表示をリセット
  setErrorMessage("");

  // Supabaseで新規登録
  const result = await supabase.auth.signUp({
    email,
    password,
  });

  // エラーがある場合
  if (result.error) {
    setErrorMessage(
      toJapaneseError(result.error.message)
    );
    return false;
  }

  // ユーザー情報が無い場合
  if (!result.data.user) {
    setErrorMessage(
      "このメールアドレスはすでに登録されています"
    );
    return false;
  }

  // 登録成功
  return true;
};

  // ── ログイン ─────────────────────────────────────────────────
  const signIn = async (
    email: string,
    password: string
  ): Promise<boolean> => {
    setErrorMessage("");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setErrorMessage(toJapaneseError(error.message));
      return false; // 失敗
    }
    return true; // 成功
  };

  // ── ログアウト ───────────────────────────────────────────────
  const signOut = async (): Promise<void> => {
    setErrorMessage("");
    await supabase.auth.signOut();
    // onAuthStateChange が自動で user を null にする
  };

  return {
    user,
    loading,
    errorMessage,
    signUp,
    signIn,
    signOut,
  };
};