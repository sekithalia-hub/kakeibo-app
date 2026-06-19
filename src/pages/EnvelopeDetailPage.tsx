import { useState } from "react";
import type { Envelope, Transaction } from "../types";
import { formatAmount } from "../utils";
import Modal from "../components/Modal";
import IncomeForm from "../components/IncomeForm";
import ExpenseForm from "../components/ExpenseForm";
import EnvelopeForm from "../components/EnvelopeForm";
import TransactionItem from "../components/TransactionItem";
import TransferForm from "../components/TransferForm";

type EnvelopeDetailPageProps = {
  envelope: Envelope;
  transactions: Transaction[];
  onBack: () => void;
  onAddIncome: (envelopeId: string, amount: number, memo: string) => void;
  onAddExpense: (envelopeId: string, amount: number, memo: string) => void;
  onEditEnvelope: (id: string, name: string, color: string) => void;
  onDeleteEnvelope: (id: string) => void;
  onTransfer: (
  fromId: string,
  toId: string,
  amount: number,
  memo: string
) => void;
envelopes: Envelope[];
};

type ModalType =
  | "income"
  | "expense"
  | "edit"
  | "transfer"
  | null;
const EnvelopeDetailPage = ({
  envelope,
  transactions,
  onBack,
  onAddIncome,
  onAddExpense,
  onEditEnvelope,
  onDeleteEnvelope,
  onTransfer,
  envelopes,
}: EnvelopeDetailPageProps) => {
  const [modal, setModal] = useState<ModalType>(null);

  // この封筒に関係する取引だけ絞り込む
  const envelopeTransactions = transactions.filter(
    (tx) =>
      tx.envelopeId === envelope.id ||
      tx.fromEnvelopeId === envelope.id ||
      tx.toEnvelopeId === envelope.id
  );

  const handleDelete = () => {
    if (confirm(`「${envelope.name}」を削除しますか？`)) {
      onDeleteEnvelope(envelope.id);
      onBack();
    }
  };

  return (
    <div style={styles.container}>
      {/* ヘッダー */}
      <div
        style={{ ...styles.header, backgroundColor: envelope.color }}
      >
        <button style={styles.backButton} onClick={onBack}>
          ← 戻る
        </button>
        <h1 style={styles.headerTitle}>{envelope.name}</h1>
        <button style={styles.editButton} onClick={() => setModal("edit")}>
          編集
        </button>
      </div>

      {/* 残高 */}
      <div
        style={{ ...styles.balanceCard, backgroundColor: envelope.color }}
      >
        <p style={styles.balanceLabel}>残高</p>
        <p style={styles.balanceAmount}>{formatAmount(envelope.balance)}</p>
      </div>

      {/* 収入・支出ボタン */}
      <div style={styles.actionRow}>
        <button
          style={styles.incomeButton}
          onClick={() => setModal("income")}
        >
          📥 収入を追加
        </button>
        <button
          style={styles.expenseButton}
          onClick={() => setModal("expense")}
        >
          📤 支出を追加
        </button>
      </div>

      {/* 取引履歴 */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>取引履歴</h2>
        {envelopeTransactions.length === 0 ? (
          <p style={styles.empty}>取引がまだありません</p>
        ) : (
          envelopeTransactions.map((tx) => (
            <TransactionItem key={tx.id} transaction={tx} />
          ))
        )}
      </section>

      {/* 削除ボタン */}
      <div style={styles.deleteSection}>
        <button style={styles.deleteButton} onClick={handleDelete}>
          🗑 この封筒を削除する
        </button>
      </div>

      {/* モーダル：収入登録 */}
      {modal === "income" && (
        <Modal title="収入を追加" onClose={() => setModal(null)}>
          <IncomeForm
            onSubmit={(amount, memo) => {
              onAddIncome(envelope.id, amount, memo);
              setModal(null);
            }}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}

      {/* モーダル：支出登録 */}
      {modal === "expense" && (
        <Modal title="支出を追加" onClose={() => setModal(null)}>
          <ExpenseForm
            balance={envelope.balance}
            onSubmit={(amount, memo) => {
              onAddExpense(envelope.id, amount, memo);
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
               onTransfer(
                 fromId,
                 toId,
                 amount,
                 memo
          );
             setModal(null);
           }}
          onCancel={() => setModal(null)}
         />
        </Modal>
      )}

      {/* モーダル：封筒編集 */}
      {modal === "edit" && (
       <Modal title="封筒を編集" onClose={() => setModal(null)}>
        <EnvelopeForm
         initial={envelope}
         onSubmit={(name, _balance, color) => {
           onEditEnvelope(envelope.id, name, color);
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
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
  },
  backButton: {
    background: "none",
    border: "none",
    color: "#fff",
    fontSize: "14px",
    cursor: "pointer",
    padding: "4px 0",
  },
  headerTitle: {
    color: "#fff",
    fontSize: "17px",
    fontWeight: "bold",
  },
  editButton: {
    background: "rgba(255,255,255,0.25)",
    border: "none",
    color: "#fff",
    fontSize: "13px",
    padding: "4px 10px",
    borderRadius: "12px",
    cursor: "pointer",
  },
  balanceCard: {
    padding: "16px 20px 28px",
    textAlign: "center",
  },
  balanceLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: "13px",
    marginBottom: "4px",
  },
  balanceAmount: {
    color: "#fff",
    fontSize: "36px",
    fontWeight: "bold",
  },
  actionRow: {
    display: "flex",
    gap: "12px",
    padding: "16px",
  },
  incomeButton: {
    flex: 1,
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#4CAF50",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  expenseButton: {
    flex: 1,
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#F44336",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
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

export default EnvelopeDetailPage;