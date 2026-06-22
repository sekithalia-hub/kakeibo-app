import { useState, useCallback } from "react";
import { useAppState } from "./hooks/useAppState";
import { useAuth } from "./hooks/useAuth";
import AuthPage from "./pages/AuthPage";
import SetupPage from "./pages/SetupPage";
import HomePage from "./pages/HomePage";
import EnvelopeDetailPage from "./pages/EnvelopeDetailPage";
import SavingsGoalDetailPage from "./pages/SavingsGoalDetailPage";
import CalendarPage from "./pages/CalendarPage";
import TransactionEditPage from "./pages/TransactionEditPage";
import AnalyticsPage from "./pages/AnalyticsPage";

type Page =
  | { name: "home" }
  | { name: "envelopeDetail"; envelopeId: string }
  | { name: "savingsGoalDetail"; savingsGoalId: string }
  | { name: "calendar" }
  | { name: "transactionEdit"; transactionId: string }
  | { name: "analytics" };

const SETUP_KEY = "setupCompleted";

function App() {
  const {
    envelopes,
    savingsGoals,
    transactions,
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
  } = useAppState();

  const { user, loading, errorMessage, signIn, signUp, signOut } = useAuth();

  const [currentPage, setCurrentPage] = useState<Page>({ name: "home" });

  // ── useCallback はすべての return より前に定義する ────────────
  const goToHome = useCallback(
    () => setCurrentPage({ name: "home" }), []
  );
  const goToEnvelopeDetail = useCallback(
    (envelopeId: string) =>
      setCurrentPage({ name: "envelopeDetail", envelopeId }), []
  );
  const goToSavingsGoalDetail = useCallback(
    (savingsGoalId: string) =>
      setCurrentPage({ name: "savingsGoalDetail", savingsGoalId }), []
  );
  const goToCalendar = useCallback(
    () => setCurrentPage({ name: "calendar" }), []
  );
  const goToAnalytics = useCallback(
    () => setCurrentPage({ name: "analytics" }), []
  );
  const goToTransactionEdit = useCallback(
    (transactionId: string) =>
      setCurrentPage({ name: "transactionEdit", transactionId }), []
  );

  // ── セットアップ完了ハンドラー ────────────────────────────────
  const handleSetupComplete = (
    templateEnvelopes: { name: string; color: string }[]
  ) => {
    templateEnvelopes.forEach(({ name, color }) => {
      addEnvelope(name, 0, color);
    });
    localStorage.setItem(SETUP_KEY, "true");
  };

  // ── ① 認証確認中 ─────────────────────────────────────────────
  if (loading) {
    return (
      <div style={loadingStyles.container}>
        <p style={loadingStyles.emoji}>💰</p>
        <p style={loadingStyles.text}>読み込み中...</p>
      </div>
    );
  }

  // ── ② 未ログイン ─────────────────────────────────────────────
  if (user === null) {
    return (
      <AuthPage
        onSignIn={signIn}
        onSignUp={signUp}
        errorMessage={errorMessage}
      />
    );
  }

  // ── ③ 初回セットアップ ───────────────────────────────────────
  const isSetupCompleted = localStorage.getItem(SETUP_KEY) === "true";
  const isFirstVisit =
    !isSetupCompleted &&
    envelopes.length === 0 &&
    savingsGoals.length === 0;

  if (isFirstVisit) {
    return <SetupPage onComplete={handleSetupComplete} />;
  }

  // ── ページ表示 ────────────────────────────────────────────────
  if (currentPage.name === "home") {
    return (
      <HomePage
        envelopes={envelopes}
        savingsGoals={savingsGoals}
        transactions={transactions}
        onEnvelopeClick={goToEnvelopeDetail}
        onSavingsGoalClick={goToSavingsGoalDetail}
        onCalendarClick={goToCalendar}
        onAnalyticsClick={goToAnalytics}
        onTransactionClick={goToTransactionEdit}
        onAddEnvelope={addEnvelope}
        onAddSavingsGoal={addSavingsGoal}
        onTransfer={transferBetweenEnvelopes}
        onSignOut={signOut}
      />
    );
  }

  if (currentPage.name === "envelopeDetail") {
    const envelope = envelopes.find((e) => e.id === currentPage.envelopeId);
    if (!envelope) { goToHome(); return null; }
    return (
      <EnvelopeDetailPage
  envelope={envelope}
  transactions={transactions}
  onBack={goToHome}
  onAddIncome={addIncome}
  onAddExpense={addExpense}
  onEditEnvelope={editEnvelope}
  onDeleteEnvelope={deleteEnvelope}
  onTransfer={transferBetweenEnvelopes} // 追加
  envelopes={envelopes}                 // 追加
/>
    );
  }

  if (currentPage.name === "savingsGoalDetail") {
    const goal = savingsGoals.find((g) => g.id === currentPage.savingsGoalId);
    if (!goal) { goToHome(); return null; }
    return (
      <SavingsGoalDetailPage
        goal={goal}
        envelopes={envelopes}
        transactions={transactions}
        onBack={goToHome}
        onDeposit={depositToSavingsGoal}
        onDeleteSavingsGoal={deleteSavingsGoal}
      />
    );
  }

  if (currentPage.name === "calendar") {
    return (
      <CalendarPage
        transactions={transactions}
        onBack={goToHome}
        onTransactionClick={goToTransactionEdit}
      />
    );
  }

  if (currentPage.name === "transactionEdit") {
    const transaction = transactions.find(
      (t) => t.id === currentPage.transactionId
    );
    if (!transaction) { goToHome(); return null; }
    return (
      <TransactionEditPage
        transaction={transaction}
        onSave={(id, newType, newAmount, newMemo, newDate) => {
          editTransaction(id, newType, newAmount, newMemo, newDate);
          goToHome();
        }}
        onDelete={(id) => {
          deleteTransaction(id);
          goToHome();
        }}
        onBack={goToHome}
      />
    );
  }

  if (currentPage.name === "analytics") {
    return (
      <AnalyticsPage
        transactions={transactions}
        onBack={goToHome}
      />
    );
  }
}

// ── ローディング画面のスタイル ────────────────────────────────
const loadingStyles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: "480px",
    margin: "0 auto",
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
  },
  emoji: {
    fontSize: "48px",
  },
  text: {
    fontSize: "16px",
    color: "#aaa",
  },
};

export default App;