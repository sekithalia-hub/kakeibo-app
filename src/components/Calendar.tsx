import React from "react";
import type { Transaction } from "../types";

type CalendarProps = {
  year: number;
  month: number;
  transactions: Transaction[];
  selectedDay: number | null; // ✅ 追加
  onDayClick: (day: number) => void; // ✅ 追加
  onPrevMonth: () => void;
  onNextMonth: () => void;
};

// 曜日ヘッダー
const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];
/**
 * カレンダーグリッド用の日付配列を生成する
 * 例：2024年1月 → [null, 1, 2, ..., 31, null, null]
 * 月の始まりの曜日に合わせて先頭を null で埋める
 */
const buildCalendarDays = (year: number, month: number): (number | null)[] => {
  // 月の最初の曜日（0=日曜）
  const firstDow = new Date(year, month, 1).getDay();
  // 月の最終日
  const lastDay = new Date(year, month + 1, 0).getDate();

  const days: (number | null)[] = [];

  // 先頭の空白を null で埋める
  for (let i = 0; i < firstDow; i++) {
    days.push(null);
  }
  // 日付を追加
  for (let d = 1; d <= lastDay; d++) {
    days.push(d);
  }
  // 末尾を7の倍数になるよう null で埋める（グリッドを揃えるため）
  while (days.length % 7 !== 0) {
    days.push(null);
  }

  return days;
};
const groupTransactionsByDay = (
  transactions: Transaction[],
  year: number,
  month: number
): Record<number, Transaction["type"][]> => {
  const map: Record<number, Transaction["type"][]> = {};

  transactions.forEach((tx) => {
    const date = new Date(tx.date);
    if (date.getFullYear() === year && date.getMonth() === month) {
      const day = date.getDate();
      if (!map[day]) map[day] = [];
      map[day].push(tx.type);
    }
  });

  return map;
};

const getDots = (
  types: Transaction["type"][]
): { income: boolean; expense: boolean } => {
  return {
    income: types.includes("income"),
    expense:
      types.includes("expense") ||
      types.includes("transfer") ||
      types.includes("savings_deposit"),
  };
};

const Calendar = ({ year, month, transactions, selectedDay, onDayClick, onPrevMonth, onNextMonth }: CalendarProps) => {
  const days = buildCalendarDays(year, month);
  const txByDay = groupTransactionsByDay(transactions, year, month); // ✅ 追加
  const today = new Date();
  const isToday = (day: number) =>
    today.getFullYear() === year &&
    today.getMonth() === month &&
    today.getDate() === day;

  return (
  <div style={styles.calendar}>
    <div style={styles.nav}>
      <button style={styles.navButton} onClick={onPrevMonth}>
        ←
      </button>

      <div style={styles.navTitle}>
        {year}年 {month + 1}月
      </div>

      <button style={styles.navButton} onClick={onNextMonth}>
        →
      </button>
    </div>

    <div style={styles.grid}>
      {WEEKDAYS.map((weekday, index) => (
        <div
          key={weekday}
          style={{
            ...styles.weekday,
            color:
              index === 0
                ? "#F44336"
                : index === 6
                ? "#4A90E2"
                : "#666",
          }}
        >
          {weekday}
        </div>
      ))}

      {days.map((day, index) => {
        if (day === null) {
          return <div key={`empty-${index}`} />;
        }

        const dow = index % 7;
        const todayFlag = isToday(day);

        return (
          <div key={day} style={styles.cell}>
            <div
                onClick={() => onDayClick(day)}
                style={{
                  ...styles.dayNumber,
                  backgroundColor:
                    selectedDay === day
                      ? "#333"
                      : todayFlag
                      ? "#4A90E2"
                      : "transparent",
                  color:
                    selectedDay === day
                      ? "#fff"
                      : todayFlag
                      ? "#fff"
                      : dow === 0
                      ? "#F44336"
                      : dow === 6
                      ? "#4A90E2"
                      : "#333",
                }}
              >
                {day}
              </div>
          </div>
        );
      })}
    </div>
  </div>
);
};
const styles: Record<string, React.CSSProperties> = {
  calendar: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "16px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
  },
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  navButton: {
    background: "none",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "20px",
    width: "36px",
    height: "36px",
    cursor: "pointer",
    color: "#555",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: 1,
  },
  navTitle: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#333",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "4px",
  },
  weekday: {
    textAlign: "center",
    fontSize: "12px",
    fontWeight: "bold",
    padding: "4px 0",
  },
  cell: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "3px",
    minHeight: "40px",
    padding: "2px 0",
  },
  dayNumber: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  dotRow: {
    display: "flex",
    gap: "2px",
    justifyContent: "center",
    minHeight: "6px",
  },
  dotGreen: {
    display: "inline-block",
    width: "5px",
    height: "5px",
    borderRadius: "50%",
    backgroundColor: "#4CAF50",
  },
  dotRed: {
    display: "inline-block",
    width: "5px",
    height: "5px",
    borderRadius: "50%",
    backgroundColor: "#F44336",
  },
};

export default Calendar;
