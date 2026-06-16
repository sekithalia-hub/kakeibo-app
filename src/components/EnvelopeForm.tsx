import { useState } from "react";
import type { Envelope } from "../types";

// 封筒カラーのプリセット
const PRESET_COLORS = [
  "#4A90E2", // 青
  "#E25C5C", // 赤
  "#4CAF50", // 緑
  "#FF9800", // オレンジ
  "#9C27B0", // 紫
  "#00BCD4", // シアン
  "#FF5722", // 深オレンジ
  "#607D8B", // グレー
];

type EnvelopeFormProps = {
  // 編集時は既存データを渡す。作成時は undefined
  initial?: Envelope;
  onSubmit: (name: string, balance: number, color: string) => void;
  onCancel: () => void;
};

const EnvelopeForm = ({ initial, onSubmit, onCancel }: EnvelopeFormProps) => {
  const [name, setName] = useState(initial?.name ?? "");
  const [balance, setBalance] = useState(
    initial?.balance !== undefined ? String(initial.balance) : ""
  );
  const [color, setColor] = useState(initial?.color ?? PRESET_COLORS[0]);
  const [error, setError] = useState("");

  const isEditing = !!initial;

  const handleSubmit = () => {
    // バリデーション
    if (!name.trim()) {
      setError("封筒名を入力してください");
      return;
    }
    const amount = Number(balance);
    if (isNaN(amount) || amount < 0) {
      setError("金額は0以上の数値を入力してください");
      return;
    }
    onSubmit(name.trim(), amount, color);
  };

  return (
    <div style={styles.form}>
      {/* 封筒名 */}
      <label style={styles.label}>封筒名</label>
      <input
        style={styles.input}
        type="text"
        placeholder="例：食費"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      {/* 初期金額（編集時は非表示） */}
      {!isEditing && (
        <>
          <label style={styles.label}>初期金額（円）</label>
          <input
            style={styles.input}
            type="number"
            placeholder="例：20000"
            min={0}
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
          />
        </>
      )}

      {/* カラー選択 */}
      <label style={styles.label}>カラー</label>
      <div style={styles.colorGrid}>
        {PRESET_COLORS.map((c) => (
          <div
            key={c}
            style={{
              ...styles.colorCircle,
              backgroundColor: c,
              outline: color === c ? `3px solid ${c}` : "none",
              outlineOffset: "2px",
            }}
            onClick={() => setColor(c)}
          />
        ))}
      </div>

      {/* エラー */}
      {error && <p style={styles.error}>{error}</p>}

      {/* ボタン */}
      <div style={styles.buttons}>
        <button style={styles.cancelButton} onClick={onCancel}>
          キャンセル
        </button>
        <button style={styles.submitButton} onClick={handleSubmit}>
          {isEditing ? "更新する" : "作成する"}
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
  colorGrid: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "4px",
  },
  colorCircle: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    cursor: "pointer",
  },
  error: {
    color: "#F44336",
    fontSize: "13px",
    marginTop: "4px",
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

export default EnvelopeForm;