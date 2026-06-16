import type { Envelope } from "../types";
import { formatAmount } from "../utils";

type EnvelopeCardProps = {
  envelope: Envelope;
  onClick: () => void;
};

const EnvelopeCard = ({ envelope, onClick }: EnvelopeCardProps) => {
  return (
    <div style={styles.card} onClick={onClick}>
      {/* 左側のカラーバー */}
      <div style={{ ...styles.colorBar, backgroundColor: envelope.color }} />

      {/* 封筒情報 */}
      <div style={styles.info}>
        <span style={styles.name}>{envelope.name}</span>
        <span style={styles.balance}>{formatAmount(envelope.balance)}</span>
      </div>

      {/* 矢印 */}
      <span style={styles.arrow}>›</span>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: "10px",
    marginBottom: "8px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
    cursor: "pointer",
    overflow: "hidden",
  },
  colorBar: {
    width: "6px",
    alignSelf: "stretch",
    flexShrink: 0,
  },
  info: {
    flex: 1,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 12px",
  },
  name: {
    fontSize: "15px",
    fontWeight: "bold",
  },
  balance: {
    fontSize: "15px",
    color: "#333",
  },
  arrow: {
    fontSize: "20px",
    color: "#ccc",
    paddingRight: "12px",
  },
};

export default EnvelopeCard;