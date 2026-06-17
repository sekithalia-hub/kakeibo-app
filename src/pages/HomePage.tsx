import { useState } from "react";
import type { Envelope, SavingsGoal, Transaction } from "../types";
import { formatAmount, isCurrentMonth } from "../utils";
import EnvelopeCard from "../components/EnvelopeCard";
import SavingsGoalCard from "../components/SavingsGoalCard";
import TransactionItem from "../components/TransactionItem";
import Modal from "../components/Modal";
import EnvelopeForm from "../components/EnvelopeForm";
import SavingsGoalForm from "../components/SavingsGoalForm";
import TransferForm from "../components/TransferForm";

type HomePageProps = {
  envelopes: Envelope[];
  savingsGoals: SavingsGoal[];
  transactions: Transaction[];
  onEnvelopeClick: (id: string) => void;
  onSavingsGoalClick: (id: string) => void;
  onCalendarClick: () => void;
  onAnalyticsClick: () => void;
  onTransactionClick: (id: string) => void;
  onAddEnvelope: (name: string, balance: number, color: string) => void;
  onAddSavingsGoal: (
    name: string,
    targetAmount: number,
    currentAmount: number,
    deadline: string | null
  ) => void;
  onTransfer: (fromId: string, toId: string, amount: number, memo: string) => void;
  onSignOut: () => void;  // ✅ 追加
};type ModalType = "addEnvelope" | "addSavingsGoal" | "transfer" | null;

const HomePage = ({
  envelopes,
  savingsGoals,
  transactions,
  onEnvelopeClick,
  onSavingsGoalClick,
  onCalendarClick,
  onAnalyticsClick,
  onTransactionClick,
  onAddEnvelope,
  onAddSavingsGoal,
  onTransfer,
  onSignOut,  // ✅ 追加
}: HomePageProps) => {  const [modal, setModal] = useState<ModalType>(null);

  // 全封筒の合計残高
  const totalBalance = envelopes.reduce((sum, e) => sum + e.balance, 0);

  // 今月の収入・支出サマリー
  const currentMonthTransactions = transactions.filter((tx) =>
    isCurrentMonth(tx.date)
  );
  const monthlyIncome = currentMonthTransactions
    .filter((tx) => tx.type === "income")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const monthlyExpense = currentMonthTransactions
    .filter((tx) => tx.type === "expense")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const monthlyBalance = monthlyIncome - monthlyExpense;

  // 最近の取引（最新5件）
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div style={styles.container}>
      {/* ヘッダー */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>💰 封筒かんたん家計簿</h1>
        <div style={styles.headerButtons}>
          <button style={styles.headerIconButton} onClick={onAnalyticsClick}>
            📊
          </button>
          <button style={styles.headerIconButton} onClick={onCalendarClick}>
            🗓
          </button>
          <button
  style={styles.headerIconButton}
  onClick={() => {
    if (window.confirm("ログアウトしてもよろしいですか？")) {
      onSignOut();
    }
  }}
>
  🚪
</button>
        </div>
      </div>

      {/* 総残高 */}
      <div style={styles.totalCard}>
        <p style={styles.totalLabel}>総残高</p>
        <p style={styles.totalAmount}>{formatAmount(totalBalance)}</p>
      </div>

      {/* 今月のサマリー */}
      <div style={styles.summaryRow}>
        {/* 収入 */}
        <div style={styles.summaryCard}>
          <p style={styles.summaryLabel}>収入</p>
          <p style={{ ...styles.summaryAmount, color: "#4CAF50" }}>
            {formatAmount(monthlyIncome)}
          </p>
        </div>
        {/* 支出 */}
        <div style={styles.summaryCard}>
          <p style={styles.summaryLabel}>支出</p>
          <p style={{ ...styles.summaryAmount, color: "#F44336" }}>
            {formatAmount(monthlyExpense)}
          </p>
        </div>
        {/* 収支 */}
        <div style={styles.summaryCard}>
          <p style={styles.summaryLabel}>残高</p>
          <p
            style={{
              ...styles.summaryAmount,
              color: monthlyBalance >= 0 ? "#4A90E2" : "#F44336",
            }}
          >
            {monthlyBalance >= 0
              ? formatAmount(monthlyBalance)
              : `- ${formatAmount(Math.abs(monthlyBalance))}`}
          </p>
        </div>
      </div>

      {/* 封筒一覧 */}
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>📁 封筒一覧</h2>
          <button style={styles.addButton} onClick={() => setModal("addEnvelope")}>
            ＋ 追加
          </button>
        </div>
        {envelopes.length === 0 ? (
          <p style={styles.empty}>封筒がまだありません</p>
        ) : (
          envelopes.map((e) => (
            <EnvelopeCard
              key={e.id}
              envelope={e}
              onClick={() => onEnvelopeClick(e.id)}
            />
          ))
        )}
        {envelopes.length >= 2 && (
          <button style={styles.transferButton} onClick={() => setModal("transfer")}>
            ↔ 封筒間送金
          </button>
        )}
      </section>

      {/* 目的貯金 */}
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>🎯 目的貯金</h2>
          <button
            style={styles.addButton}
            onClick={() => setModal("addSavingsGoal")}
          >
            ＋ 追加
          </button>
        </div>
        {savingsGoals.length === 0 ? (
          <p style={styles.empty}>目的貯金がまだありません</p>
        ) : (
          savingsGoals.map((g) => (
            <SavingsGoalCard
              key={g.id}
              goal={g}
              onClick={() => onSavingsGoalClick(g.id)}
            />
          ))
        )}
      </section>

      {/* 最近の取引 */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>🕐 最近の取引</h2>
        {recentTransactions.length === 0 ? (
          <p style={styles.empty}>取引がまだありません</p>
        ) : (
          recentTransactions.map((tx) => (
            <TransactionItem
              key={tx.id}
              transaction={tx}
              onClick={
                tx.type === "income" || tx.type === "expense"
                  ? () => onTransactionClick(tx.id)
                  : undefined
              }
            />
          ))
        )}
      </section>

      {/* モーダル：封筒作成 */}
      {modal === "addEnvelope" && (
        <Modal title="封筒を作成" onClose={() => setModal(null)}>
          <EnvelopeForm
            onSubmit={(name, balance, color) => {
              onAddEnvelope(name, balance, color);
              setModal(null);
            }}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}

      {/* モーダル：目的貯金作成 */}
      {modal === "addSavingsGoal" && (
        <Modal title="目的貯金を作成" onClose={() => setModal(null)}>
          <SavingsGoalForm
            onSubmit={(name, targetAmount, currentAmount, deadline) => {
              onAddSavingsGoal(name, targetAmount, currentAmount, deadline);
              setModal(null);
            }}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}

      {/* モーダル：封筒間送金 */}
      {modal === "transfer" && (
        <Modal title="封筒間送金" onClose={() => setModal(null)}>
          <TransferForm
            envelopes={envelopes}
            onSubmit={(fromId, toId, amount, memo) => {
              onTransfer(fromId, toId, amount, memo);
              setModal(null);
            }}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: "480px",
    margin: "0 auto",
    paddingBottom: "40px",
  },
  header: {
    backgroundColor: "#4A90E2",
    padding: "16px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: "18px",
  },
  totalCard: {
    backgroundColor: "#4A90E2",
    padding: "16px 20px 24px",
    textAlign: "center",
  },
  totalLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: "13px",
    marginBottom: "4px",
  },
  totalAmount: {
    color: "#fff",
    fontSize: "32px",
    fontWeight: "bold",
  },
  summaryRow: {
    display: "flex",
    gap: "8px",
    padding: "12px 16px 4px",
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: "10px",
    padding: "10px 8px",
    textAlign: "center",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
  },
  summaryLabel: {
    fontSize: "10px",
    color: "#aaa",
    marginBottom: "4px",
    whiteSpace: "nowrap",
  },
  summaryAmount: {
    fontSize: "13px",
    fontWeight: "bold",
  },
  section: {
    padding: "16px",
    marginBottom: "4px",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "bold",
  },
  addButton: {
    padding: "6px 12px",
    borderRadius: "20px",
    border: "none",
    backgroundColor: "#4A90E2",
    color: "#fff",
    fontSize: "13px",
    cursor: "pointer",
  },
  transferButton: {
    width: "100%",
    marginTop: "8px",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #4A90E2",
    backgroundColor: "#fff",
    color: "#4A90E2",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  empty: {
    color: "#aaa",
    fontSize: "14px",
    textAlign: "center",
    padding: "20px 0",
  },
  headerButtons: {
    display: "flex",
    gap: "8px",
  },
  headerIconButton: {
    background: "rgba(255,255,255,0.25)",
    border: "none",
    fontSize: "20px",
    borderRadius: "8px",
    padding: "4px 8px",
    cursor: "pointer",
    lineHeight: 1.4,
  },
};



export default HomePage;