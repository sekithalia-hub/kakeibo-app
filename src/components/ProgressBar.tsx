import { calcProgress } from "../utils";

type ProgressBarProps = {
  current: number;
  target: number;
};

const ProgressBar = ({ current, target }: ProgressBarProps) => {
  const percent = calcProgress(current, target);
  const isCompleted = percent >= 100;

  return (
    <div>
      {/* バー本体 */}
      <div style={styles.track}>
        <div
          style={{
            ...styles.fill,
            width: `${percent}%`,
            backgroundColor: isCompleted ? "#4CAF50" : "#4A90E2",
          }}
        />
      </div>
      {/* パーセント表示 */}
      <div style={styles.label}>
        <span style={{ color: isCompleted ? "#4CAF50" : "#333" }}>
          {isCompleted ? "🎉 達成！" : `${percent}%`}
        </span>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  track: {
    width: "100%",
    height: "12px",
    backgroundColor: "#e0e0e0",
    borderRadius: "6px",
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: "6px",
    transition: "width 0.3s ease",
  },
  label: {
    marginTop: "4px",
    fontSize: "13px",
    textAlign: "right",
  },
};

export default ProgressBar;