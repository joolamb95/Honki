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
  weeklySales: { day: string; earlySales: number; lateSales: number }[];
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
export const fetchWeeklySales = createAsyncThunk("sales/fetchWeeklySales", async () => {
  const response = await axios.get("http://localhost:8080/honki/finance/sales/weekly");

  // ✅ 데이터를 요일 기준으로 그룹화하여 변환
  const groupedSales: Record<string, { day: string; earlySales: number; lateSales: number }> = {};

  response.data.forEach((item: any) => {
    const day = item.DAY;

    if (!groupedSales[day]) {
      groupedSales[day] = { day, earlySales: 0, lateSales: 0 };
    }

    if (item.TIME_PERIOD === "earlySales") {
      groupedSales[day].earlySales += item.SALES;
    } else if (item.TIME_PERIOD === "lateSales") {
      groupedSales[day].lateSales += item.SALES;
    }
  });

  return Object.values(groupedSales);
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
