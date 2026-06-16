import { useState } from "react";
import type { Envelope } from "../types";
import { formatAmount } from "../utils";

type TransferFormProps = {
  envelopes: Envelope[];
  onSubmit: (fromId: string, toId: string, amount: number, memo: string) => void;
  onCancel: () => void;
};

const TransferForm = ({ envelopes, onSubmit, onCancel }: TransferFormProps) => {
  const [fromId, setFromId] = useState(envelopes[0]?.id ?? "");
  const [toId, setToId] = useState(envelopes[1]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!fromId || !toId) {
      setError("封筒を選択してください");
      return;
    }
    if (fromId === toId) {
      setError("送金元と送金先に同じ封筒は選べません");
      return;
    }
    const num = Number(amount);
    if (isNaN(num) || num <= 0) {
      setError("金額は1以上の数値を入力してください");
      return;
    }
    const fromEnvelope = envelopes.find((e) => e.id === fromId);
    if (fromEnvelope && fromEnvelope.balance < num) {
      setError(`残高が不足しています（残高：${formatAmount(fromEnvelope.balance)}）`);
      return;
    }
    onSubmit(fromId, toId, num, memo);
  };

  return (
    <div style={styles.form}>
      <label style={styles.label}>送金元</label>
      <select
        style={styles.select}
        value={fromId}
        onChange={(e) => setFromId(e.target.value)}
      >
        {envelopes.map((e) => (
          <option key={e.id} value={e.id}>
            {e.name}（{formatAmount(e.balance)}）
          </option>
        ))}
      </select>

      <label style={styles.label}>送金先</label>
      <select
        style={styles.select}
        value={toId}
        onChange={(e) => setToId(e.target.value)}
      >
        {envelopes.map((e) => (
          <option key={e.id} value={e.id}>
            {e.name}（{formatAmount(e.balance)}）
          </option>
        ))}
      </select>

      <label style={styles.label}>金額（円）</label>
      <input
        style={styles.input}
        type="number"
        placeholder="例：5000"
        min={1}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <label style={styles.label}>メモ（任意）</label>
      <input
        style={styles.input}
        type="text"
        placeholder="例：今月分"
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
      />

      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.buttons}>
        <button style={styles.cancelButton} onClick={onCancel}>
          キャンセル
        </button>
        <button style={styles.submitButton} onClick={handleSubmit}>
          送金する
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
  select: {
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "15px",
    outline: "none",
    backgroundColor: "#fff",
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

export default TransferForm;