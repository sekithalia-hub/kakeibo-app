import { useState } from "react";
import { formatAmount } from "../utils";

type ExpenseFormProps = {
  balance: number; // 残高不足チェック用
  onSubmit: (amount: number, memo: string) => void;
  onCancel: () => void;
};

const ExpenseForm = ({ balance, onSubmit, onCancel }: ExpenseFormProps) => {
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    const num = Number(amount);
    if (isNaN(num) || num <= 0) {
      setError("金額は1以上の数値を入力してください");
      return;
    }
    if (num > balance) {
      setError(`残高が不足しています（残高：${formatAmount(balance)}）`);
      return;
    }
    onSubmit(num, memo);
  };

  return (
    <div style={styles.form}>
      <label style={styles.label}>金額（円）</label>
      <input
        style={styles.input}
        type="number"
        placeholder="例：3000"
        min={1}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <label style={styles.label}>メモ（任意）</label>
      <input
        style={styles.input}
        type="text"
        placeholder="例：スーパー"
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
      />

      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.buttons}>
        <button style={styles.cancelButton} onClick={onCancel}>
          キャンセル
        </button>
        <button style={styles.submitButton} onClick={handleSubmit}>
          登録する
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  form: {
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
  input: {
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "15px",
    outline: "none",
  },
  error: {
    color: "#F44336",
    fontSize: "13px",
  },
  buttons: {
    display: "flex",
    gap: "8px",
    marginTop: "16px",
  },
  cancelButton: {
    flex: 1,
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    backgroundColor: "#fff",
    fontSize: "14px",
    cursor: "pointer",
  },
  submitButton: {
    flex: 1,
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#F44336",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
  },
};

export default ExpenseForm;