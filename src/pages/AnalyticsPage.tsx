import { useMemo } from "react";
import type { Transaction } from "../types";
import { formatAmount } from "../utils";

// ── 型定義 ────────────────────────────────────────────────────
type AnalyticsPageProps = {
  transactions: Transaction[];
  onBack: () => void;
};

const SLICE_COLORS = [
  "#4A90E2", "#F44336", "#4CAF50", "#FF9800", "#9C27B0",
  "#00BCD4", "#FF5722", "#607D8B", "#E91E63", "#795548",
];

type CategoryData = {
  name: string;
  amount: number;
  color: string;
  percent: number;
};

// ── 集計関数 ──────────────────────────────────────────────────
const aggregateByCategory = (
  transactions: Transaction[],
  year: number,
  month: number
): CategoryData[] => {
  const monthlyExpenses = transactions.filter((tx) => {
    if (tx.type !== "expense") return false;
    const d = new Date(tx.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const map: Record<string, number> = {};
  monthlyExpenses.forEach((tx) => {
    const key = tx.relatedName || "その他";
    map[key] = (map[key] ?? 0) + tx.amount;
  });

  const total = Object.values(map).reduce((s, v) => s + v, 0);
  if (total === 0) return [];

  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .map(([name, amount], i) => ({
      name,
      amount,
      color: SLICE_COLORS[i % SLICE_COLORS.length],
      percent: Math.round((amount / total) * 100),
    }));
};

// ── 修正ポイント：PieChart をファイルの外側に切り出す ──────────
// 変更前：AnalyticsPage の中に定義されていた
//         → 親が再レンダリングするたびに PieChart が再定義された
// 変更後：外に出すことで再定義されなくなる
type PieChartProps = {
  data: CategoryData[];
};

const PieChart = ({ data }: PieChartProps) => {
  const SIZE = 200;
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const r = 80;
  const innerR = 44;

  const toXY = (angle: number, radius: number) => ({
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  });

  const buildPath = (startAngle: number, endAngle: number): string => {
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    const outer1 = toXY(startAngle, r);
    const outer2 = toXY(endAngle, r);
    const inner1 = toXY(endAngle, innerR);
    const inner2 = toXY(startAngle, innerR);
    return [
      `M ${outer1.x} ${outer1.y}`,
      `A ${r} ${r} 0 ${largeArc} 1 ${outer2.x} ${outer2.y}`,
      `L ${inner1.x} ${inner1.y}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${inner2.x} ${inner2.y}`,
      "Z",
    ].join(" ");
  };

  const total = data.reduce((s, d) => s + d.amount, 0);
  let currentAngle = -Math.PI / 2;

  const slices = data.map((d) => {
    const sliceAngle = (d.amount / total) * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    currentAngle = endAngle;
    return { ...d, path: buildPath(startAngle, endAngle) };
  });

  return (
    <svg
      width={SIZE}
      height={SIZE}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      style={{ display: "block", margin: "0 auto" }}
    >
      {slices.map((slice) => (
        <path
          key={slice.name}
          d={slice.path}
          fill={slice.color}
          stroke="#fff"
          strokeWidth={2}
        />
      ))}
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize={12} fill="#888">
        支出合計
      </text>
      <text
        x={cx} y={cy + 14}
        textAnchor="middle"
        fontSize={13}
        fontWeight="bold"
        fill="#333"
      >
        {formatAmount(total)}
      </text>
    </svg>
  );
};

// ── AnalyticsPage 本体 ────────────────────────────────────────
const AnalyticsPage = ({ transactions, onBack }: AnalyticsPageProps) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthLabel = `${year}年${month + 1}月`;

  // ── 修正ポイント：useMemo で集計をメモ化 ──────────────────────
  // 変更前：レンダリングのたびに aggregateByCategory が再実行されていた
  // 変更後：transactions が変わったときだけ再計算する
  const data = useMemo(
    () => aggregateByCategory(transactions, year, month),
    [transactions, year, month]
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backButton} onClick={onBack}>← 戻る</button>
        <h1 style={styles.headerTitle}>支出分析</h1>
        <div style={{ width: "48px" }} />
      </div>

      <div style={styles.content}>
        <p style={styles.monthLabel}>📊 {monthLabel}の支出内訳</p>

        {data.length === 0 ? (
          <div style={styles.emptyCard}>
            <p style={styles.emptyIcon}>📭</p>
            <p style={styles.emptyText}>今月の支出データがありません</p>
            <p style={styles.emptySubText}>
              支出を登録すると円グラフで確認できます
            </p>
          </div>
        ) : (
          <>
            <div style={styles.chartCard}>
              <PieChart data={data} />
            </div>
            <div style={styles.legendCard}>
              {data.map((item) => (
                <div key={item.name} style={styles.legendRow}>
                  <span
                    style={{
                      ...styles.legendDot,
                      backgroundColor: item.color,
                    }}
                  />
                  <span style={styles.legendName}>{item.name}</span>
                  <span style={styles.legendPercent}>{item.percent}%</span>
                  <span style={styles.legendAmount}>
                    {formatAmount(item.amount)}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: "480px",
    margin: "0 auto",
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    backgroundColor: "#4A90E2",
  },
  backButton: {
    background: "none",
    border: "none",
    color: "#fff",
    fontSize: "14px",
    cursor: "pointer",
  },
  headerTitle: {
    color: "#fff",
    fontSize: "17px",
    fontWeight: "bold",
  },
  content: {
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  monthLabel: {
    fontSize: "15px",
    fontWeight: "bold",
    color: "#333",
  },
  emptyCard: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "40px 20px",
    textAlign: "center",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
  },
  emptyIcon: {
    fontSize: "40px",
    marginBottom: "12px",
  },
  emptyText: {
    fontSize: "15px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "8px",
  },
  emptySubText: {
    fontSize: "13px",
    color: "#aaa",
  },
  chartCard: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "24px 16px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
  },
  legendCard: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "8px 16px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
  },
  legendRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 0",
    borderBottom: "1px solid #f0f0f0",
  },
  legendDot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    flexShrink: 0,
  },
  legendName: {
    flex: 1,
    fontSize: "14px",
    color: "#333",
  },
  legendPercent: {
    fontSize: "13px",
    color: "#888",
    width: "36px",
    textAlign: "right",
  },
  legendAmount: {
    fontSize: "14px",
    fontWeight: "bold",
    color: "#333",
    width: "80px",
    textAlign: "right",
  },
};

export default AnalyticsPage;