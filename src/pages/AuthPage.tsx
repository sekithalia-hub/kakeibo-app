import { useState } from "react";

type AuthPageProps = {
  onSignIn: (email: string, password: string) => Promise<boolean>;
  onSignUp: (email: string, password: string) => Promise<boolean>;
  errorMessage: string;
};

// タブの種類
type AuthTab = "signIn" | "signUp";

const AuthPage = ({ onSignIn, onSignUp, errorMessage }: AuthPageProps) => {
  const [tab, setTab] = useState<AuthTab>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // タブを切り替えるときに入力内容・メッセージをリセット
  const handleTabChange = (nextTab: AuthTab) => {
    setTab(nextTab);
    setEmail("");
    setPassword("");
    setSuccessMessage("");
  };

  // ログイン・新規登録のボタン押下時
  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    setSuccessMessage("");

    if (tab === "signIn") {
      await onSignIn(email, password);
      // 成功時は App.tsx 側で画面が切り替わるためここでは何もしない
    } else {
      const success = await onSignUp(email, password);
      if (success) {
        setSuccessMessage(
          "確認メールを送信しました。\n認証後にログインしてください。"
        );
      }
    }
    setLoading(false);
  };

  // Enter キーで送信できるようにする
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  const isSignIn = tab === "signIn";

  return (
    <div style={styles.container}>
      {/* ヘッダー */}
      <div style={styles.header}>
        <p style={styles.headerEmoji}>💰</p>
        <h1 style={styles.headerTitle}>封筒かんたん家計簿</h1>
        <p style={styles.headerSubtitle}>家計管理をシンプルに</p>
      </div>

      {/* カード */}
      <div style={styles.card}>
        {/* タブ切り替え */}
        <div style={styles.tabRow}>
          <button
            style={{
              ...styles.tab,
              borderBottom: isSignIn
                ? "2px solid #4A90E2"
                : "2px solid transparent",
              color: isSignIn ? "#4A90E2" : "#aaa",
            }}
            onClick={() => handleTabChange("signIn")}
          >
            ログイン
          </button>
          <button
            style={{
              ...styles.tab,
              borderBottom: !isSignIn
                ? "2px solid #4A90E2"
                : "2px solid transparent",
              color: !isSignIn ? "#4A90E2" : "#aaa",
            }}
            onClick={() => handleTabChange("signUp")}
          >
            新規登録
          </button>
        </div>

        {/* フォーム */}
        <div style={styles.form}>
          {/* メールアドレス */}
          <label style={styles.label}>メールアドレス</label>
          <input
            style={styles.input}
            type="email"
            placeholder="example@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="email"
          />

          {/* パスワード */}
          <label style={styles.label}>
            パスワード
            <span style={styles.labelNote}>（6文字以上）</span>
          </label>
          <input
            style={styles.input}
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete={isSignIn ? "current-password" : "new-password"}
          />

          {/* エラーメッセージ */}
          {errorMessage !== "" && (
            <div style={styles.errorBox}>
              <span style={styles.errorIcon}>⚠️</span>
              <span style={styles.errorText}>{errorMessage}</span>
            </div>
          )}

          {/* 成功メッセージ（新規登録後） */}
          {successMessage !== "" && (
            <div style={styles.successBox}>
              <span style={styles.successIcon}>✅</span>
              <span style={styles.successText}>{successMessage}</span>
            </div>
          )}

          {/* 送信ボタン */}
          <button
            style={{
              ...styles.submitButton,
              opacity: loading ? 0.7 : 1,
            }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? "処理中..."
              : isSignIn
              ? "ログインする"
              : "アカウントを作成する"}
          </button>

          {/* タブ切り替えの補助テキスト */}
          <p style={styles.switchText}>
            {isSignIn ? (
              <>
                アカウントをお持ちでない方は
                <button
                  style={styles.switchButton}
                  onClick={() => handleTabChange("signUp")}
                >
                  新規登録
                </button>
              </>
            ) : (
              <>
                すでにアカウントをお持ちの方は
                <button
                  style={styles.switchButton}
                  onClick={() => handleTabChange("signIn")}
                >
                  ログイン
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: "480px",
    margin: "0 auto",
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#4A90E2",
    padding: "40px 24px 32px",
    textAlign: "center",
  },
  headerEmoji: {
    fontSize: "48px",
    marginBottom: "12px",
  },
  headerTitle: {
    color: "#fff",
    fontSize: "22px",
    fontWeight: "bold",
    marginBottom: "8px",
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: "14px",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "16px",
    margin: "20px 16px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.10)",
    overflow: "hidden",
  },
  tabRow: {
    display: "flex",
    borderBottom: "1px solid #eee",
  },
  tab: {
    flex: 1,
    padding: "14px",
    background: "none",
    border: "none",
    fontSize: "15px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "color 0.2s",
  },
  form: {
    padding: "24px 20px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "bold",
    color: "#555",
    marginTop: "8px",
  },
  labelNote: {
    fontSize: "12px",
    fontWeight: "normal",
    color: "#aaa",
    marginLeft: "6px",
  },
  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "15px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#FFF3F3",
    border: "1px solid #FFCDD2",
    borderRadius: "8px",
    padding: "10px 12px",
    marginTop: "4px",
  },
  errorIcon: {
    fontSize: "16px",
    flexShrink: 0,
  },
  errorText: {
    fontSize: "13px",
    color: "#C62828",
    lineHeight: 1.4,
  },
  successBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#F1F8E9",
    border: "1px solid #DCEDC8",
    borderRadius: "8px",
    padding: "10px 12px",
    marginTop: "4px",
  },
  successIcon: {
    fontSize: "16px",
    flexShrink: 0,
  },
  successText: {
  fontSize: "13px",
  color: "#2E7D32",
  lineHeight: 1.4,
  whiteSpace: "pre-line",
},
  submitButton: {
    marginTop: "16px",
    padding: "14px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#4A90E2",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    width: "100%",
  },
  switchText: {
    textAlign: "center",
    fontSize: "13px",
    color: "#aaa",
    marginTop: "12px",
  },
  switchButton: {
    background: "none",
    border: "none",
    color: "#4A90E2",
    fontSize: "13px",
    fontWeight: "bold",
    cursor: "pointer",
    marginLeft: "4px",
    textDecoration: "underline",
    padding: 0,
  },
};

export default AuthPage;