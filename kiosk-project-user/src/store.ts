import { configureStore } from "@reduxjs/toolkit";
import menuReducer from "./features/menuSlice"; // 메뉴 관련 상태
import categoryReducer from "./features/categorySlice"; // 카테고리 상태 추가
import cartReducer from "./features/cartSlice"; // ✅ 장바구니 상태 추가

const store = configureStore({
  reducer: {
    menu: menuReducer, // 메뉴 상태
    category: categoryReducer, // 카테고리 상태
    cart: cartReducer, // ✅ 장바구니 상태 추가
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
