import { useState } from "react";
import type { Transaction } from "../types";
import { formatDate, formatAmount } from "../utils";
import Calendar from "../components/Calendar";
import TransactionItem from "../components/TransactionItem";

type CalendarPageProps = {
  transactions: Transaction[];
  onBack: () => void;
  onTransactionClick: (id: string) => void;  // ✅ 追加
};

const CalendarPage = ({ transactions, onBack, onTransactionClick }: CalendarPageProps) => {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(
    today.getDate()
  );

  const handlePrevMonth = () => {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else {
      setMonth((m) => m - 1);
    }
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else {
      setMonth((m) => m + 1);
    }
    setSelectedDay(null);
  };

  const handleDayClick = (day: number) => {
    setSelectedDay((prev) => (prev === day ? null : day));
  };

  // 選択中の日付の取引を絞り込む
  const selectedDayTransactions = transactions.filter((tx) => {
    if (selectedDay === null) return false;
    const date = new Date(tx.date);
    return (
      date.getFullYear() === year &&
      date.getMonth() === month &&
      date.getDate() === selectedDay
    );
  });

  // 選択中の日付のラベル
  const selectedLabel =
    selectedDay !== null
      ? formatDate(new Date(year, month, selectedDay).toISOString())
      : null;

  // 表示中の月の取引を絞り込む
  const currentMonthTransactions = transactions.filter((tx) => {
    const date = new Date(tx.date);
    return date.getFullYear() === year && date.getMonth() === month;
  });

  // 月次集計
  const monthlyIncome = currentMonthTransactions
    .filter((tx) => tx.type === "income")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const monthlyExpense = currentMonthTransactions
    .filter((tx) => tx.type === "expense")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const monthlyBalance = monthlyIncome - monthlyExpense;

  return (
    <div style={styles.container}>
      {/* ヘッダー */}
      <div style={styles.header}>
        <button style={styles.backButton} onClick={onBack}>
          ← 戻る
        </button>
        <h1 style={styles.headerTitle}>カレンダー</h1>
        <div style={{ width: "48px" }} />
      </div>

      <div style={styles.content}>
        {/* 月次集計カード */}
        <div style={styles.summaryRow}>
          <div style={styles.summaryCard}>
            <p style={styles.summaryLabel}>収入</p>
            <p style={{ ...styles.summaryAmount, color: "#4CAF50" }}>
              {formatAmount(monthlyIncome)}
            </p>
          </div>
          <div style={styles.summaryCard}>
            <p style={styles.summaryLabel}>支出</p>
            <p style={{ ...styles.summaryAmount, color: "#F44336" }}>
              {formatAmount(monthlyExpense)}
            </p>
          </div>
          <div style={styles.summaryCard}>
            <p style={styles.summaryLabel}>収支</p>
            <p
              style={{
                ...styles.summaryAmount,
                color: monthlyBalance >= 0 ? "#4A90E2" : "#F44336",
              }}
            >
              {monthlyBalance >= 0
                ? formatAmount(monthlyBalance)
                : `- ${formatAmount(Math.abs(monthlyBalance))}`}
            </p>
          </div>
        </div>

        {/* カレンダーグリッド */}
        <Calendar
          year={year}
          month={month}
          transactions={transactions}
          selectedDay={selectedDay}
          onDayClick={handleDayClick}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
        />

        {/* 取引リスト */}
        <div style={styles.listSection}>
          {selectedDay === null ? (
            <p style={styles.hint}>日付をタップすると取引を確認できます</p>
          ) : (
            <>
              <h2 style={styles.dateLabel}>📅 {selectedLabel}</h2>
              {selectedDayTransactions.length === 0 ? (
                <p style={styles.empty}>この日の取引はありません</p>
              ) : (
                selectedDayTransactions.map((tx) => (
                  <TransactionItem
                    key={tx.id}
                    transaction={tx}
                    onClick={
                      tx.type === "income" || tx.type === "expense"
                        ? () => onTransactionClick(tx.id)
                        : undefined
                    }
                  />
                ))
              )}
            </>
          )}
        </div>
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
  listSection: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "16px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
    minHeight: "80px",
  },
  hint: {
    fontSize: "14px",
    color: "#aaa",
    textAlign: "center",
    padding: "16px 0",
  },
  dateLabel: {
    fontSize: "15px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "12px",
  },
  empty: {
    fontSize: "14px",
    color: "#aaa",
    textAlign: "center",
    padding: "16px 0",
  },
  summaryRow: {
    display: "flex",
    gap: "8px",
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: "10px",
    padding: "10px 8px",
    textAlign: "center",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
  },
  summaryLabel: {
    fontSize: "11px",
    color: "#aaa",
    marginBottom: "4px",
  },
  summaryAmount: {
    fontSize: "13px",
    fontWeight: "bold",
  },
};

export default CalendarPage;