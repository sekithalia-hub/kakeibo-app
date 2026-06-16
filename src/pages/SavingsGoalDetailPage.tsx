import { useState } from "react";
import type { Envelope, SavingsGoal, Transaction } from "../types";
import { formatAmount, formatDate } from "../utils";
import ProgressBar from "../components/ProgressBar";
import Modal from "../components/Modal";
import SavingsDepositForm from "../components/SavingsDepositForm";
import TransactionItem from "../components/TransactionItem";

type SavingsGoalDetailPageProps = {
  goal: SavingsGoal;
  envelopes: Envelope[];
  transactions: Transaction[];
  onBack: () => void;
  onDeposit: (goalId: string, fromEnvelopeId: string, amount: number) => void;
  onDeleteSavingsGoal: (id: string) => void;
};

const SavingsGoalDetailPage = ({
  goal,
  envelopes,
  transactions,
  onBack,
  onDeposit,
  onDeleteSavingsGoal,
}: SavingsGoalDetailPageProps) => {
  const [showModal, setShowModal] = useState(false);

  // この目的貯金に関係する取引だけ絞り込む
  const goalTransactions = transactions.filter(
    (tx) => tx.savingsGoalId === goal.id
  );

  const handleDelete = () => {
    if (confirm(`「${goal.name}」を削除しますか？`)) {
      onDeleteSavingsGoal(goal.id);
      onBack();
    }
  };

  return (
    <div style={styles.container}>
      {/* ヘッダー */}
      <div style={styles.header}>
        <button style={styles.backButton} onClick={onBack}>
          ← 戻る
        </button>
        <h1 style={styles.headerTitle}>{goal.name}</h1>
        <div style={{ width: "48px" }} /> {/* 右側の余白調整 */}
      </div>

      {/* 達成状況カード */}
      <div style={styles.progressCard}>
        <div style={styles.amountRow}>
          <span style={styles.currentAmount}>
            {formatAmount(goal.currentAmount)}
          </span>
          <span style={styles.targetAmount}>
            / {formatAmount(goal.targetAmount)}
          </span>
        </div>
        <div style={{ margin: "12px 0" }}>
          <ProgressBar
            current={goal.currentAmount}
            target={goal.targetAmount}
          />
        </div>
        {goal.deadline && (
          <p style={styles.deadline}>
            🗓 目標期限：{formatDate(goal.deadline)}
          </p>
        )}
      </div>

      {/* 入金ボタン */}
      <div style={styles.actionArea}>
        <button
          style={styles.depositButton}
          onClick={() => setShowModal(true)}
          disabled={goal.currentAmount >= goal.targetAmount}
        >
          💰 入金する
        </button>
        {goal.currentAmount >= goal.targetAmount && (
          <p style={styles.completedNote}>🎉 目標達成済みです！</p>
        )}
      </div>

      {/* 目的貯金取引履歴 */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>目的貯金取引履歴</h2>
        {goalTransactions.length === 0 ? (
          <p style={styles.empty}>取引がまだありません</p>
        ) : (
          goalTransactions.map((tx) => (
            <TransactionItem key={tx.id} transaction={tx} />
          ))
        )}
      </section>

      {/* 削除ボタン */}
      <div style={styles.deleteSection}>
        <button style={styles.deleteButton} onClick={handleDelete}>
          🗑 この目的貯金を削除する
        </button>
      </div>

      {/* モーダル：入金 */}
      {showModal && (
        <Modal title="入金する" onClose={() => setShowModal(false)}>
          <SavingsDepositForm
            envelopes={envelopes}
            onSubmit={(fromEnvelopeId, amount) => {
              onDeposit(goal.id, fromEnvelopeId, amount);
              setShowModal(false);
            }}
            onCancel={() => setShowModal(false)}
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
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    backgroundColor: "#9C27B0",
  },
  backButton: {
    background: "none",
    border: "none",
    color: "#fff",
    fontSize: "14px",
    cursor: "pointer",
  },
  headerTitle: {
    color: "#fff",
    fontSize: "17px",
    fontWeight: "bold",
  },
  progressCard: {
    backgroundColor: "#fff",
    padding: "20px 16px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
  },
  amountRow: {
    display: "flex",
    alignItems: "baseline",
    gap: "6px",
  },
  currentAmount: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#333",
  },
  targetAmount: {
    fontSize: "16px",
    color: "#aaa",
  },
  deadline: {
    fontSize: "13px",
    color: "#888",
    marginTop: "8px",
  },
  actionArea: {
    padding: "16px",
    textAlign: "center",
  },
  depositButton: {
    width: "100%",
    padding: "14px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#9C27B0",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  completedNote: {
    marginTop: "8px",
    fontSize: "14px",
    color: "#4CAF50",
    fontWeight: "bold",
  },
  section: {
    padding: "0 16px",
  },
  sectionTitle: {
    fontSize: "15px",
    fontWeight: "bold",
    marginBottom: "8px",
  },
  empty: {
    color: "#aaa",
    fontSize: "14px",
    textAlign: "center",
    padding: "20px 0",
  },
  deleteSection: {
    padding: "32px 16px 0",
    textAlign: "center",
  },
  deleteButton: {
    background: "none",
    border: "none",
    color: "#aaa",
    fontSize: "13px",
    cursor: "pointer",
    textDecoration: "underline",
  },
};

export default SavingsGoalDetailPage;