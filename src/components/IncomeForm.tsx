import { useState } from "react";

type IncomeFormProps = {
  onSubmit: (amount: number, memo: string) => void;
  onCancel: () => void;
};

const IncomeForm = ({ onSubmit, onCancel }: IncomeFormProps) => {
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    const num = Number(amount);
    if (isNaN(num) || num <= 0) {
      setError("金額は1以上の数値を入力してください");
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
        placeholder="例：30000"
        min={1}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <label style={styles.label}>メモ（任意）</label>
      <input
        style={styles.input}
        type="text"
        placeholder="例：給与"
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
    backgroundColor: "#4CAF50",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
  },
};

export default IncomeForm;