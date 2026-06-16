import { useState } from "react";

type SavingsGoalFormProps = {
  onSubmit: (
    name: string,
    targetAmount: number,
    currentAmount: number,
    deadline: string | null
  ) => void;
  onCancel: () => void;
};

const SavingsGoalForm = ({ onSubmit, onCancel }: SavingsGoalFormProps) => {
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) {
      setError("目的貯金名を入力してください");
      return;
    }
    const target = Number(targetAmount);
    if (isNaN(target) || target <= 0) {
      setError("目標金額は1以上の数値を入力してください");
      return;
    }
    const current = Number(currentAmount || "0");
    if (isNaN(current) || current < 0) {
      setError("現在金額は0以上の数値を入力してください");
      return;
    }
    if (current > target) {
      setError("現在金額は目標金額以下にしてください");
      return;
    }
    onSubmit(
      name.trim(),
      target,
      current,
      deadline ? new Date(deadline).toISOString() : null
    );
  };

  return (
    <div style={styles.form}>
      <label style={styles.label}>目的貯金名</label>
      <input
        style={styles.input}
        type="text"
        placeholder="例：旅行貯金"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <label style={styles.label}>目標金額（円）</label>
      <input
        style={styles.input}
        type="number"
        placeholder="例：100000"
        min={1}
        value={targetAmount}
        onChange={(e) => setTargetAmount(e.target.value)}
      />

      <label style={styles.label}>現在金額（円）</label>
      <input
        style={styles.input}
        type="number"
        placeholder="例：0"
        min={0}
        value={currentAmount}
        onChange={(e) => setCurrentAmount(e.target.value)}
      />

      <label style={styles.label}>目標期限（任意）</label>
      <input
        style={styles.input}
        type="date"
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
      />

      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.buttons}>
        <button style={styles.cancelButton} onClick={onCancel}>
          キャンセル
        </button>
        <button style={styles.submitButton} onClick={handleSubmit}>
          作成する
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
    backgroundColor: "#4A90E2",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
  },
};

export default SavingsGoalForm;