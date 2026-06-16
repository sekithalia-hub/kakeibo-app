import { useState } from "react";
import type{ Envelope } from "../types";
import { formatAmount } from "../utils";

type SavingsDepositFormProps = {
  envelopes: Envelope[];
  onSubmit: (fromEnvelopeId: string, amount: number) => void;
  onCancel: () => void;
};

const SavingsDepositForm = ({
  envelopes,
  onSubmit,
  onCancel,
}: SavingsDepositFormProps) => {
  const [fromEnvelopeId, setFromEnvelopeId] = useState(
    envelopes[0]?.id ?? ""
  );
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  const selectedEnvelope = envelopes.find((e) => e.id === fromEnvelopeId);

  const handleSubmit = () => {
    if (!fromEnvelopeId) {
      setError("引き出し元の封筒を選択してください");
      return;
    }
    const num = Number(amount);
    if (isNaN(num) || num <= 0) {
      setError("金額は1以上の数値を入力してください");
      return;
    }
    if (selectedEnvelope && selectedEnvelope.balance < num) {
      setError(
        `残高が不足しています（残高：${formatAmount(selectedEnvelope.balance)}）`
      );
      return;
    }
    onSubmit(fromEnvelopeId, num);
  };

  return (
    <div style={styles.form}>
      <label style={styles.label}>引き出し元の封筒</label>
      {envelopes.length === 0 ? (
        <p style={styles.empty}>封筒がありません。先に封筒を作成してください。</p>
      ) : (
        <select
          style={styles.select}
          value={fromEnvelopeId}
          onChange={(e) => setFromEnvelopeId(e.target.value)}
        >
          {envelopes.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}（{formatAmount(e.balance)}）
            </option>
          ))}
        </select>
      )}

      <label style={styles.label}>金額（円）</label>
      <input
        style={styles.input}
        type="number"
        placeholder="例：10000"
        min={1}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.buttons}>
        <button style={styles.cancelButton} onClick={onCancel}>
          キャンセル
        </button>
        <button
          style={styles.submitButton}
          onClick={handleSubmit}
          disabled={envelopes.length === 0}
        >
          入金する
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
  empty: {
    color: "#aaa",
    fontSize: "13px",
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
    backgroundColor: "#9C27B0",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
  },
};

export default SavingsDepositForm;