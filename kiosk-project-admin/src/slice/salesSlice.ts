import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ✅ 타입 정의
export interface MenuItem {
  id: number;
  rank: number;
  NAME: string;
  ORDERS: number;
}

export interface TopMenuCategory {
  category: string;
  items: MenuItem[];
}

// Redux 상태 정의
interface SalesState {
  monthlySales: { date: string; SALES: number }[];
  weeklySales: { day: string; morningSales: number; afternoonSales: number }[];
  topMenus: TopMenuCategory[];
  loading: boolean;
}

// 초기 상태 수정
const initialState: SalesState = {
  monthlySales: [],
  weeklySales: [],
  topMenus: [],
  loading: false,
};

// ✅ 이번 달 매출 가져오기
export const fetchMonthlySales = createAsyncThunk(
  "sales/fetchMonthlySales",
  async (yearMonth: string) => {
    const response = await axios.get(`http://localhost:8080/honki/finance/sales`, {
      params: { yearMonth },
    });

    return response.data.map((item: { date: string; SALES: number }) => ({
      date: item.date,
      sales: item.SALES,
    }));
  }
);

// ✅ 이번 주 매출 가져오기
export const fetchWeeklySales = createAsyncThunk("sales/fetchWeeklySales", async (_, { rejectWithValue }) => {
  
  const response = await axios.get("http://localhost:8080/honki/finance/sales/weekly");

  console.log("✅ 원본 API 응답:", response.data); // 📌 응답 데이터 확인

  if (!response.data || response.data.length === 0) {
    console.warn("⚠️ API에서 반환된 데이터가 없습니다.");
    return rejectWithValue("주간 매출 데이터가 없습니다.");
  }

    // ✅ 요일 배열 선언 (고정값)
    const daysOfWeek = ["월", "화", "수", "목", "금", "토", "일"];

  // ✅ 데이터를 요일 기준으로 그룹화하여 변환
  const groupedSales: Record<string, { day: string; morningSales: number; afternoonSales: number }> = {};

  response.data.forEach((item: any) => {
    const day = item.DAY;

    if (!groupedSales[day]) {
      groupedSales[day] = { day, morningSales: 0, afternoonSales: 0 };
    }

    if (item.TIME_PERIOD === "morningSales") {
      groupedSales[day].morningSales += item.SALES;
    } else if (item.TIME_PERIOD === "afternoonSales") {
      groupedSales[day].afternoonSales += item.SALES;
    }
  });

  console.log("✅ groupedSales 변환 후:", groupedSales);

 // ✅ 모든 요일을 포함하도록 데이터 보완
 const completedSales = daysOfWeek.map((day) => groupedSales[day] || { day, morningSales: 0, afternoonSales: 0 });

 console.log("✅ 최종 weeklySales 데이터:", completedSales);


 return completedSales;
});





// ✅ 인기 메뉴 가져오기
export const fetchTopMenus = createAsyncThunk(
  "sales/fetchTopMenus",
  async () => {
    const response = await axios.get("http://localhost:8080/honki/finance/sales/top-menus");

    return response.data;  // 이미 가공된 데이터를 그대로 반환

  }
);


const salesSlice = createSlice({
  name: "sales",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMonthlySales.fulfilled, (state, action) => {
        state.monthlySales = action.payload;
      })
      .addCase(fetchWeeklySales.fulfilled, (state, action) => {
        console.log("✅ fetchWeeklySales 응답 데이터:", action.payload);
        state.weeklySales = action.payload;
      })
      .addCase(fetchTopMenus.fulfilled, (state, action) => {
        console.log("📌 fetchTopMenus 응답 데이터:", action.payload);
        state.topMenus = action.payload;
      });
  },
});

export default salesSlice.reducer;
