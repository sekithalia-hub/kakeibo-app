type Template = {
  id: "simple" | "standard" | "custom";
  emoji: string;
  title: string;
  description: string;
  envelopes: string[];
};

const TEMPLATES: Template[] = [
  {
    id: "simple",
    emoji: "🌱",
    title: "シンプル",
    description: "食費・日用品・その他",
    envelopes: ["食費", "日用品", "その他"],
  },
  {
    id: "standard",
    emoji: "📊",
    title: "しっかり管理",
    description: "食費・日用品・ガソリン・娯楽・医療費",
    envelopes: ["食費", "日用品", "ガソリン", "娯楽", "医療費"],
  },
  {
    id: "custom",
    emoji: "✏️",
    title: "自分で作る",
    description: "封筒を自分で作成する",
    envelopes: [],
  },
];

// 封筒カラーのプリセット（テンプレート用）
const TEMPLATE_COLORS = [
  "#4A90E2",
  "#4CAF50",
  "#FF9800",
  "#E25C5C",
  "#9C27B0",
];

type SetupPageProps = {
  onComplete: (envelopes: { name: string; color: string }[]) => void;
};

const SetupPage = ({ onComplete }: SetupPageProps) => {
  return (
    <div style={styles.container}>
      {/* ヘッダー */}
      <div style={styles.header}>
        <p style={styles.headerEmoji}>💰</p>
        <h1 style={styles.title}>封筒かんたん家計簿へようこそ</h1>
        <p style={styles.subtitle}>あなたに合った始め方を選んでください</p>
      </div>

      {/* テンプレート選択 */}
      <div style={styles.templateList}>
        {TEMPLATES.map((template) => (
          <button
            key={template.id}
            style={styles.templateCard}
            onClick={() => {
              // 封筒名にカラーを割り当てて返す
              const envelopes = template.envelopes.map((name, i) => ({
                name,
                color: TEMPLATE_COLORS[i % TEMPLATE_COLORS.length],
              }));
              onComplete(envelopes);
            }}
          >
            {/* 左：絵文字 */}
            <span style={styles.templateEmoji}>{template.emoji}</span>

            {/* 中央：テキスト */}
            <div style={styles.templateInfo}>
              <span style={styles.templateTitle}>{template.title}</span>
              <span style={styles.templateDescription}>
                {template.description}
              </span>
              {/* 封筒タグ（自分で作る以外） */}
              {template.envelopes.length > 0 && (
                <div style={styles.tagRow}>
                  {template.envelopes.map((name, i) => (
                    <span
                      key={name}
                      style={{
                        ...styles.tag,
                        backgroundColor:
                          TEMPLATE_COLORS[i % TEMPLATE_COLORS.length],
                      }}
                    >
                      {name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 右：矢印 */}
            <span style={styles.arrow}>›</span>
          </button>
        ))}
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
    backgroundColor: "#4A90E2",
    padding: "40px 24px 32px",
    textAlign: "center",
  },
  headerEmoji: {
    fontSize: "48px",
    marginBottom: "12px",
  },
  title: {
    color: "#fff",
    fontSize: "20px",
    fontWeight: "bold",
    marginBottom: "8px",
    lineHeight: 1.4,
  },
  subtitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: "14px",
  },
  templateList: {
    padding: "20px 16px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  templateCard: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    backgroundColor: "#fff",
    border: "none",
    borderRadius: "12px",
    padding: "16px",
    cursor: "pointer",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
    textAlign: "left",
    width: "100%",
  },
  templateEmoji: {
    fontSize: "28px",
    flexShrink: 0,
  },
  templateInfo: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  templateTitle: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#333",
  },
  templateDescription: {
    fontSize: "13px",
    color: "#888",
  },
  tagRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "4px",
    marginTop: "6px",
  },
  tag: {
    color: "#fff",
    fontSize: "11px",
    padding: "2px 8px",
    borderRadius: "10px",
  },
  arrow: {
    fontSize: "22px",
    color: "#ccc",
    flexShrink: 0,
  },
};

export default SetupPage;