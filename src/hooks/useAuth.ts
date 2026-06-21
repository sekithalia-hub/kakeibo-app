import { useState, useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

type UseAuthReturn = {
  user: User | null;
  loading: boolean;
  errorMessage: string;
  signUp: (email: string, password: string) => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
};

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

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // ── 修正ポイント ──────────────────────────────────────────
    // 変更前：getSession + onAuthStateChange の2つが走っていた
    //         → 初回に setUser・setLoading が2回呼ばれ二重レンダリング発生
    // 変更後：onAuthStateChange のみに統一
    //         → INITIAL_SESSION イベントで初回セッションも取得できるため
    //            getSession は不要
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (
    email: string,
    password: string
  ): Promise<boolean> => {
    setErrorMessage("");
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setErrorMessage(toJapaneseError(error.message));
      return false;
    }
    return true;
  };

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
      return false;
    }
    return true;
  };

  const signOut = async (): Promise<void> => {
    setErrorMessage("");
    await supabase.auth.signOut();
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