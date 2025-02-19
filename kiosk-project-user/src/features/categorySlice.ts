import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const storedCategory = localStorage.getItem("selectedCategory") || "전체 메뉴"; // ✅ 기본값을 전체 메뉴로 설정

const categorySlice = createSlice({
  name: "category",
  initialState: storedCategory,
  reducers: {
    setCategory: (state, action: PayloadAction<string>) => {
      if (action.payload === "전체 메뉴") {
        localStorage.removeItem("selectedCategory"); // ✅ 전체 메뉴 클릭 시 로컬 스토리지 초기화
        return "전체 메뉴";
      } else {
        localStorage.setItem("selectedCategory", action.payload);
        return action.payload;
      }
    },
  },
});

export const { setCategory } = categorySlice.actions;
export default categorySlice.reducer;
