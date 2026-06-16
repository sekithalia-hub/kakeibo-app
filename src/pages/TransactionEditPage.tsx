import { useState } from "react";
import type { Transaction } from "../types";

type TransactionEditPageProps = {
  transaction: Transaction;
  onSave: (
    id: string,
    newType: "income" | "expense",
    newAmount: number,
    newMemo: string,
    newDate: string
  ) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
};

// 取引種別の日本語ラベル
const TYPE_LABELS: Record<Transaction["type"], string> = {
  income: "収入",
  expense: "支出",
  transfer: "封筒間送金",
  savings_deposit: "目的貯金入金",
};

// ISO文字列 → date input 用 (YYYY-MM-DD) に変換
const toDateInput = (iso: string): string => {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const TransactionEditPage = ({
  transaction,
  onSave,
  onDelete,
  onBack,
}: TransactionEditPageProps) => {
  const isEditable =
    transaction.type === "income" || transaction.type === "expense";

  const [type, setType] = useState<"income" | "expense">(
    isEditable ? (transaction.type as "income" | "expense") : "income"
  );
  const [amount, setAmount] = useState(String(transaction.amount));
  const [memo, setMemo] = useState(transaction.memo);
  const [date, setDate] = useState(toDateInput(transaction.date));
  const [error, setError] = useState("");

  const handleSave = () => {
    const num = Number(amount);
    if (isNaN(num) || num <= 0) {
      setError("金額は1以上の数値を入力してください");
      return;
    }
    if (!date) {
      setError("日付を入力してください");
      return;
    }
    onSave(transaction.id, type, num, memo, new Date(date).toISOString());
  };

  const handleDelete = () => {
    if (confirm("この取引を削除しますか？")) {
      onDelete(transaction.id);
    }
  };

  const headerColor = type === "income" ? "#4CAF50" : "#F44336";

  return (
    <div style={styles.container}>
      {/* ヘッダー */}
      <div style={{ ...styles.header, backgroundColor: headerColor }}>
        <button style={styles.backButton} onClick={onBack}>
          ← 戻る
        </button>
        <h1 style={styles.headerTitle}>取引を編集</h1>
        <div style={{ width: "48px" }} />
      </div>

      <div style={styles.content}>
        {/* 編集不可の場合 */}
        {!isEditable ? (
          <div style={styles.card}>
            <p style={styles.notEditableIcon}>🔒</p>
            <p style={styles.notEditableText}>
              「{TYPE_LABELS[transaction.type]}」は編集できません
            </p>
            <p style={styles.notEditableSubText}>
              編集・削除できるのは収入・支出のみです
            </p>
          </div>
        ) : (
          <div style={styles.card}>
            {/* 種別トグル */}
            <p style={styles.label}>種別</p>
            <div style={styles.typeRow}>
              <button
                style={{
                  ...styles.typeButton,
                  backgroundColor:
                    type === "income" ? "#4CAF50" : "#f0f0f0",
                  color: type === "income" ? "#fff" : "#555",
                }}
                onClick={() => setType("income")}
              >
                📥 収入
              </button>
              <button
                style={{
                  ...styles.typeButton,
                  backgroundColor:
                    type === "expense" ? "#F44336" : "#f0f0f0",
                  color: type === "expense" ? "#fff" : "#555",
                }}
                onClick={() => setType("expense")}
              >
                📤 支出
              </button>
            </div>

            {/* 封筒（変更不可） */}
            <p style={styles.label}>封筒</p>
            <div style={styles.readOnlyField}>
              <span style={styles.readOnlyValue}>
                {transaction.relatedName}
              </span>
              <span style={styles.readOnlyBadge}>変更不可</span>
            </div>

            {/* 金額 */}
            <p style={styles.label}>金額（円）</p>
            <input
              style={styles.input}
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            {/* メモ */}
            <p style={styles.label}>メモ（任意）</p>
            <input
              style={styles.input}
              type="text"
              placeholder="例：スーパー"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />

            {/* 日付 */}
            <p style={styles.label}>日付</p>
            <input
              style={styles.input}
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

            {/* エラー */}
            {error && <p style={styles.error}>{error}</p>}

            {/* 保存・キャンセルボタン */}
            <div style={styles.buttonRow}>
              <button style={styles.cancelButton} onClick={onBack}>
                キャンセル
              </button>
              <button
                style={{
                  ...styles.saveButton,
                  backgroundColor: headerColor,
                }}
                onClick={handleSave}
              >
                保存する
              </button>
            </div>
          </div>
        )}

        {/* 削除ボタン（収入・支出のみ表示） */}
        {isEditable && (
          <div style={styles.deleteSection}>
            <button style={styles.deleteButton} onClick={handleDelete}>
              🗑 この取引を削除する
            </button>
          </div>
        )}
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
  },
  headerTitle: {
    color: "#fff",
    fontSize: "17px",
    fontWeight: "bold",
  },
  content: {
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  notEditableIcon: {
    fontSize: "40px",
    textAlign: "center",
    marginBottom: "8px",
  },
  notEditableText: {
    fontSize: "15px",
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  notEditableSubText: {
    fontSize: "13px",
    color: "#aaa",
    textAlign: "center",
  },
  label: {
    fontSize: "13px",
    fontWeight: "bold",
    color: "#555",
    marginTop: "8px",
  },
  typeRow: {
    display: "flex",
    gap: "8px",
  },
  typeButton: {
    flex: 1,
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  readOnlyField: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 12px",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    border: "1px solid #eee",
  },
  readOnlyValue: {
    fontSize: "15px",
    color: "#333",
  },
  readOnlyBadge: {
    fontSize: "11px",
    color: "#aaa",
    backgroundColor: "#eee",
    padding: "2px 8px",
    borderRadius: "10px",
  },
  input: {
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "15px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  error: {
    color: "#F44336",
    fontSize: "13px",
    marginTop: "4px",
  },
  buttonRow: {
    display: "flex",
    gap: "8px",
    marginTop: "16px",
  },
  cancelButton: {
    flex: 1,
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    backgroundColor: "#fff",
    fontSize: "14px",
    cursor: "pointer",
  },
  saveButton: {
    flex: 1,
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  deleteSection: {
    textAlign: "center",
    paddingTop: "8px",
  },
  deleteButton: {
    background: "none",
    border: "none",
    color: "#F44336",
    fontSize: "14px",
    cursor: "pointer",
    textDecoration: "underline",
    padding: "8px",
  },
};

export default TransactionEditPage;