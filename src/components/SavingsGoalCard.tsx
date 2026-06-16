import type { SavingsGoal } from "../types";
import { formatAmount, formatDate, calcProgress } from "../utils";
import ProgressBar from "./ProgressBar";

type SavingsGoalCardProps = {
  goal: SavingsGoal;
  onClick: () => void;
};

const SavingsGoalCard = ({ goal, onClick }: SavingsGoalCardProps) => {
  const percent = calcProgress(goal.currentAmount, goal.targetAmount);

  return (
    <div style={styles.card} onClick={onClick}>
      {/* ヘッダー行 */}
      <div style={styles.header}>
        <span style={styles.name}>{goal.name}</span>
        {percent >= 100 && <span style={styles.badge}>達成済み🎉</span>}
      </div>

      {/* プログレスバー */}
      <div style={{ marginBottom: "8px" }}>
        <ProgressBar current={goal.currentAmount} target={goal.targetAmount} />
      </div>

      {/* 金額・期限 */}
      <div style={styles.footer}>
        <span style={styles.amounts}>
          {formatAmount(goal.currentAmount)} / {formatAmount(goal.targetAmount)}
        </span>
        {goal.deadline && (
          <span style={styles.deadline}>
            期限：{formatDate(goal.deadline)}
          </span>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: "#fff",
    borderRadius: "10px",
    padding: "14px",
    marginBottom: "8px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
    cursor: "pointer",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  name: {
    fontSize: "15px",
    fontWeight: "bold",
  },
  badge: {
    fontSize: "12px",
    color: "#4CAF50",
    fontWeight: "bold",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "6px",
  },
  amounts: {
    fontSize: "13px",
    color: "#555",
  },
  deadline: {
    fontSize: "12px",
    color: "#aaa",
  },
};

export default SavingsGoalCard;