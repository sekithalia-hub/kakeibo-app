// ────────────────────────────────────────
// ID生成
// ────────────────────────────────────────

/**
 * プレフィックス付きのユニークIDを生成する
 * 例: generateId("env") → "env_1706140800000"
 */
export const generateId = (prefix: string): string => {
  return `${prefix}_${Date.now()}`;
};

// ────────────────────────────────────────
// 金額フォーマット
// ────────────────────────────────────────

/**
 * 数値を日本円表示に変換する
 * 例: formatAmount(20000) → "¥20,000"
 */
export const formatAmount = (amount: number): string => {
  return `¥${amount.toLocaleString("ja-JP")}`;
};

// ────────────────────────────────────────
// 日付フォーマット
// ────────────────────────────────────────

/**
 * ISO 8601形式の日付文字列を表示用に変換する
 * 例: formatDate("2024-01-25T10:00:00.000Z") → "2024/01/25"
 */
export const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}/${m}/${d}`;
};

// ────────────────────────────────────────
// 達成率計算
// ────────────────────────────────────────

/**
 * 目的貯金の達成率を0〜100の整数で返す
 * 例: calcProgress(75000, 100000) → 75
 */
export const calcProgress = (current: number, target: number): number => {
  if (target <= 0) return 0;
  return Math.min(Math.floor((current / target) * 100), 100);
};
// ────────────────────────────────────────
// 当月判定
// ────────────────────────────────────────

/**
 * ISO 8601形式の日付文字列が今月かどうかを返す
 * 例: isCurrentMonth("2024-01-15T10:00:00.000Z") → true（1月の場合）
 */
export const isCurrentMonth = (isoString: string): boolean => {
  const date = new Date(isoString);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth()
  );
};