import type { Transaction } from "../types";
import { formatAmount } from "../utils";

type AnalyticsPageProps = {
  transactions: Transaction[];
  onBack: () => void;
};

// カテゴリ別に使う色のプリセット
const SLICE_COLORS = [
  "#4A90E2",
  "#F44336",
  "#4CAF50",
  "#FF9800",
  "#9C27B0",
  "#00BCD4",
  "#FF5722",
  "#607D8B",
  "#E91E63",
  "#795548",
];
type CategoryData = {
  name: string;   // カテゴリ名（封筒名）
  amount: number; // 合計金額
  color: string;  // 表示色
  percent: number;// 割合（0〜100）
};

/**
 * 当月の支出を封筒名（カテゴリ）ごとに集計する
 */
const aggregateByCategory = (transactions: Transaction[]): CategoryData[] => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // 当月の支出のみ絞り込む
  const monthlyExpenses = transactions.filter((tx) => {
    if (tx.type !== "expense") return false;
    const d = new Date(tx.date);
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  });

  // カテゴリ（relatedName）ごとに合計
  const map: Record<string, number> = {};
  monthlyExpenses.forEach((tx) => {
    const key = tx.relatedName || "その他";
    map[key] = (map[key] ?? 0) + tx.amount;
  });

  const total = Object.values(map).reduce((s, v) => s + v, 0);
  if (total === 0) return [];

  // 金額降順でソートして返す
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .map(([name, amount], i) => ({
      name,
      amount,
      color: SLICE_COLORS[i % SLICE_COLORS.length],
      percent: Math.round((amount / total) * 100),
    }));
};
type PieChartProps = {
  data: CategoryData[];
};

/**
 * SVGで円グラフを描画する
 * 極座標 → デカルト座標への変換を使ってスライスを描画する
 */
const PieChart = ({ data }: PieChartProps) => {
  const SIZE = 200;       // SVGの幅・高さ
  const cx = SIZE / 2;   // 中心X
  const cy = SIZE / 2;   // 中心Y
  const r = 70;          // 半径
  const innerR = 0;     // 内側の半径（ドーナツ型にする）

  // 角度（ラジアン）から座標を計算するヘルパー
  const toXY = (angle: number, radius: number) => ({
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  });

  // スライスのSVGパスを生成する
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

  // 各スライスの開始・終了角度を計算する
  const total = data.reduce((s, d) => s + d.amount, 0);
  let currentAngle = -Math.PI / 2; // 12時の位置からスタート

  const slices = data.map((d) => {
const sliceAngle =
  data.length === 1
    ? (2 * Math.PI) - 0.001
    : (d.amount / total) * 2 * Math.PI;  const startAngle = currentAngle;
  const endAngle = currentAngle + sliceAngle;
  currentAngle = endAngle;

  return {
    ...d,
    path: buildPath(startAngle, endAngle),
  };
});
console.log("slices", slices);

console.log(data);
console.log(slices);

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
      {/* 中央に「支出」ラベル */}
      <text
        x={cx}
        y={cy - 6}
        textAnchor="middle"
        fontSize={12}
        fill="#rgba(255,255,255,0.8)"
      >
        支出合計
      </text>
      <text
        x={cx}
        y={cy + 14}
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
const AnalyticsPage = ({ transactions, onBack }: AnalyticsPageProps) => {
  const data = aggregateByCategory(transactions);

  // 当月ラベル
  const now = new Date();
  const monthLabel = `${now.getFullYear()}年${now.getMonth() + 1}月`;

  return (
    <div style={styles.container}>
      {/* ヘッダー */}
      <div style={styles.header}>
        <button style={styles.backButton} onClick={onBack}>
          ← 戻る
        </button>
        <h1 style={styles.headerTitle}>支出分析</h1>
        <div style={{ width: "48px" }} />
      </div>

      <div style={styles.content}>
        {/* 月ラベル */}
        <p style={styles.monthLabel}>📊 {monthLabel}の支出内訳</p>

        {data.length === 0 ? (
          // データなし
          <div style={styles.emptyCard}>
            <p style={styles.emptyIcon}>📭</p>
            <p style={styles.emptyText}>今月の支出データがありません</p>
            <p style={styles.emptySubText}>
              支出を登録すると円グラフで確認できます
            </p>
          </div>
        ) : (
          <>
            {/* 円グラフ */}
            <div style={styles.chartCard}>
              <PieChart data={data} />
            </div>

            {/* 凡例リスト */}
            <div style={styles.legendCard}>
              {data.map((item) => (
                <div key={item.name} style={styles.legendRow}>
                  {/* カラーバッジ */}
                  <span
                    style={{
                      ...styles.legendDot,
                      backgroundColor: item.color,
                    }}
                  />
                  {/* カテゴリ名 */}
                  <span style={styles.legendName}>{item.name}</span>
                  {/* パーセント */}
                  <span style={styles.legendPercent}>{item.percent}%</span>
                  {/* 金額 */}
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
    padding: "16px",
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
    width: "60px",
    textAlign: "center",
    flexShrink: 0,
  },
  legendAmount: {
    fontSize: "14px",
    fontWeight: "bold",
    color: "#333",
    width: "90px",
    textAlign: "right",
    flexShrink: 0,
  },
};

export default AnalyticsPage;