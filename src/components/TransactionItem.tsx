import type { Transaction } from "../types";import { formatAmount, formatDate } from "../utils";

type TransactionItemProps = {
  transaction: Transaction;
  onClick?: () => void; // ✅ 追加（省略可能）
};

// 取引種別ごとのアイコンとラベルと符号
const TYPE_CONFIG = {
  income: {
    icon: "📥",
    label: "収入",
    sign: "+",
    color: "#4CAF50",
  },
  expense: {
    icon: "📤",
    label: "支出",
    sign: "-",
    color: "#F44336",
  },
  transfer: {
    icon: "↔️",
    label: "送金",
    sign: "-",
    color: "#FF9800",
  },
  savings_deposit: {
    icon: "🎯",
    label: "目的貯金",
    sign: "-",
    color: "#9C27B0",
  },
} as const;

const TransactionItem = ({ transaction, onClick }: TransactionItemProps) => {
  const { icon, sign, color } = TYPE_CONFIG[transaction.type];

  return (
    <div
      style={{
        ...styles.item,
        cursor: onClick ? "pointer" : "default",       // ✅ タップ可能なら指カーソル
        backgroundColor: onClick ? undefined : undefined,
      }}
      onClick={onClick}                                // ✅ クリックハンドラー
    >
      {/* アイコン */}
      <span style={styles.icon}>{icon}</span>

      {/* 名前・メモ */}
      <div style={styles.info}>
        <span style={styles.name}>{transaction.relatedName}</span>
        {transaction.memo && (
          <span style={styles.memo}>{transaction.memo}</span>
        )}
        <span style={styles.date}>{formatDate(transaction.date)}</span>
      </div>

      {/* 金額 */}
      <span style={{ ...styles.amount, color }}>
        {sign}{formatAmount(transaction.amount)}
      </span>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  item: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 0",
    borderBottom: "1px solid #f0f0f0",
  },
  icon: {
    fontSize: "20px",
    flexShrink: 0,
  },
  info: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  name: {
    fontSize: "14px",
    fontWeight: "bold",
  },
  memo: {
    fontSize: "12px",
    color: "#888",
  },
  date: {
    fontSize: "12px",
    color: "#aaa",
  },
  amount: {
    fontSize: "14px",
    fontWeight: "bold",
    flexShrink: 0,
  },
};

export default TransactionItem;