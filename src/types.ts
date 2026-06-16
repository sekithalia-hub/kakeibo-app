// ────────────────────────────────────────
// 封筒
// ────────────────────────────────────────
export type Envelope = {
  id: string;
  name: string;
  balance: number;
  color: string;       // カラーコード例: "#4A90E2"
  createdAt: string;   // ISO 8601形式
};

// ────────────────────────────────────────
// 目的貯金
// ────────────────────────────────────────
export type SavingsGoal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string | null; // ISO 8601形式 or null
  createdAt: string;
};

// ────────────────────────────────────────
// 取引履歴
// ────────────────────────────────────────
export type TransactionType =
  | "income"          // 収入
  | "expense"         // 支出
  | "transfer"        // 封筒間送金
  | "savings_deposit" // 目的貯金入金

export type Transaction = {
  id: string;
  type: TransactionType;
  amount: number;       // 常に正の数
  memo: string;         // 空文字も可
  date: string;         // ISO 8601形式
  relatedName: string;  // 取引登録時点の名称を保持

  // type によって使われるフィールドが異なる
  envelopeId: string | null;      // income / expense で使用
  fromEnvelopeId: string | null;  // transfer / savings_deposit で使用
  toEnvelopeId: string | null;    // transfer で使用
  savingsGoalId: string | null;   // savings_deposit で使用
};