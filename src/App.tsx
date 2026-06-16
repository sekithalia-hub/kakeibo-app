import { useState } from "react";
import { useAppState } from "./hooks/useAppState";
import SetupPage from "./pages/SetupPage";
import HomePage from "./pages/HomePage";
import EnvelopeDetailPage from "./pages/EnvelopeDetailPage";
import SavingsGoalDetailPage from "./pages/SavingsGoalDetailPage";
import CalendarPage from "./pages/CalendarPage";
import TransactionEditPage from "./pages/TransactionEditPage";
import AnalyticsPage from "./pages/AnalyticsPage"; // ✅ 追加
type Page =
  | { name: "home" }
  | { name: "envelopeDetail"; envelopeId: string }
  | { name: "savingsGoalDetail"; savingsGoalId: string }
  | { name: "calendar" }
  | { name: "transactionEdit"; transactionId: string }
  | { name: "analytics" }; // ✅ 追加
// セットアップ完了フラグの LocalStorage キー
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
    editTransaction,    // ✅ 追加
    deleteTransaction,  // ✅ 追加
  } = useAppState();

  const [currentPage, setCurrentPage] = useState<Page>({ name: "home" });

  // ── 初回セットアップ判定 ──────────────────────────────────
  // setupCompleted が未保存 かつ 封筒・目的貯金が両方0件のときだけ表示
  const isSetupCompleted = localStorage.getItem(SETUP_KEY) === "true";
  const isFirstVisit =
    !isSetupCompleted &&
    envelopes.length === 0 &&
    savingsGoals.length === 0;

  // セットアップ完了ハンドラー
  const handleSetupComplete = (
    templateEnvelopes: { name: string; color: string }[]
  ) => {
    // テンプレートの封筒を一括作成（自分で作る場合は空配列なのでスキップ）
    templateEnvelopes.forEach(({ name, color }) => {
      addEnvelope(name, 0, color);
    });
    // セットアップ完了フラグを保存
    localStorage.setItem(SETUP_KEY, "true");
  };

  // ── セットアップ画面 ──────────────────────────────────────
  if (isFirstVisit) {
    return <SetupPage onComplete={handleSetupComplete} />;
  }

  const goToHome = () => setCurrentPage({ name: "home" });

const goToEnvelopeDetail = (envelopeId: string) =>
  setCurrentPage({ name: "envelopeDetail", envelopeId });

const goToSavingsGoalDetail = (savingsGoalId: string) =>
  setCurrentPage({ name: "savingsGoalDetail", savingsGoalId });

const goToCalendar = () =>
  setCurrentPage({ name: "calendar" });

const goToAnalytics = () =>
  setCurrentPage({ name: "analytics" });

const goToTransactionEdit = (transactionId: string) =>
  setCurrentPage({ name: "transactionEdit", transactionId });

  // ── ホーム画面 ────────────────────────────────────────────
  if (currentPage.name === "home") {
    return (
      <HomePage
        envelopes={envelopes}
        savingsGoals={savingsGoals}
        transactions={transactions}
        onEnvelopeClick={goToEnvelopeDetail}
        onSavingsGoalClick={goToSavingsGoalDetail}
        onCalendarClick={goToCalendar}
        onAnalyticsClick={goToAnalytics}      // ✅ 追加
        onTransactionClick={goToTransactionEdit}
        onAddEnvelope={addEnvelope}
        onAddSavingsGoal={addSavingsGoal}
        onTransfer={transferBetweenEnvelopes}
      />
    );
  }

  // ── 封筒詳細画面 ──────────────────────────────────────────
  if (currentPage.name === "envelopeDetail") {
    const envelope = envelopes.find((e) => e.id === currentPage.envelopeId);
    if (!envelope) {
      goToHome();
      return null;
    }
    return (
      <EnvelopeDetailPage
        envelope={envelope}
        transactions={transactions}
        onBack={goToHome}
        onAddIncome={addIncome}
        onAddExpense={addExpense}
        onEditEnvelope={editEnvelope}
        onDeleteEnvelope={deleteEnvelope}
      />
    );
  }

  // ── 目的貯金詳細画面 ──────────────────────────────────────
  if (currentPage.name === "savingsGoalDetail") {
    const goal = savingsGoals.find(
      (g) => g.id === currentPage.savingsGoalId
    );
    if (!goal) {
      goToHome();
      return null;
    }
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

// ── カレンダー画面 ✅ 追加 ────────────────────────────────
  if (currentPage.name === "calendar") {
    return (
      <CalendarPage
        transactions={transactions}  // ✅ 追加
        onBack={goToHome}
        onTransactionClick={goToTransactionEdit}  // ✅ 追加
      />
    );
  }
  // ── 取引編集画面 ✅ 追加 ──────────────────────────────────
  if (currentPage.name === "transactionEdit") {
    const transaction = transactions.find(
      (t) => t.id === currentPage.transactionId
    );
    if (!transaction) {
      goToHome();
      return null;
    }
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
  // ── 支出分析画面 ✅ 追加 ──────────────────────────────────
  if (currentPage.name === "analytics") {
    return (
      <AnalyticsPage
        transactions={transactions}
        onBack={goToHome}
      />
    );
  }
}
export default App;