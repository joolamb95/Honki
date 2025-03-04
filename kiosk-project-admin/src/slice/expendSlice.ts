import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export interface Expense {
  expendNo: number;
  category: string;
  amount: number;
  expendDate: string;
  description: string;
}

interface ExpendState {
  expenses: Expense[]; // 현재 월 데이터
  prevExpenses: Expense[]; // ✅ 이전 달 데이터 저장
  availableMonths: string[];
  expensesData: Record<string, number>;
}

const initialState: ExpendState = {
  expenses: [],
  prevExpenses: [], // ✅ 초기값 추가
  availableMonths: [],
  expensesData: {},
};

// ✅ 지출 목록 불러오기 (현재 월과 이전 월 동시 조회)
export const fetchExpends = createAsyncThunk(
  "expends/fetchExpends",
  async (yearMonth: string) => {
    const response = await axios.get("http://localhost:8080/honki/finance/expends", {
      params: { yearMonth },
    });
    return response.data;
  }
);

// ✅ 사용 가능한 월 목록 불러오기
export const fetchAvailableMonths = createAsyncThunk(
  "expends/fetchAvailableMonths",
  async () => {
    const response = await axios.get("http://localhost:8080/honki/finance/expends/months");
    return response.data;
  }
);

const expendsSlice = createSlice({
  name: "expends",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchExpends.fulfilled, (state, action) => {
        if (!action.payload) return;

        // ✅ 백엔드에서 받은 데이터 구조 확인
        const { currentMonth, prevMonth } = action.payload;

        // ✅ 현재 월 데이터 저장
        state.expenses = currentMonth;
        state.expensesData[action.meta.arg] = currentMonth.reduce(
          (sum: number, expense: Expense) => sum + (expense.amount || 0),
          0
        );

        // ✅ 이전 월 데이터 저장
        state.prevExpenses = prevMonth;
        const prevMonthKey = getPrevMonth(action.meta.arg);
        state.expensesData[prevMonthKey] = prevMonth.reduce(
          (sum: number, expense: Expense) => sum + (expense.amount || 0),
          0
        );
      })
      .addCase(fetchAvailableMonths.fulfilled, (state, action) => {
        state.availableMonths = action.payload;
      });
  },
});

// ✅ 이전 월 계산 함수 추가
const getPrevMonth = (yearMonth: string) => {
  const [year, month] = yearMonth.split("-").map(Number);
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  return `${prevYear}-${prevMonth.toString().padStart(2, "0")}`;
};

export default expendsSlice.reducer;
