import { Menu } from "../type/MenuType";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CartItem extends Menu {
  quantity: number;
  selectedOptions: { name: string; price: number }[];
}

interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(
        (item) =>
          item.menuNo === action.payload.menuNo &&
          JSON.stringify(item.selectedOptions) === JSON.stringify(action.payload.selectedOptions) // ✅ 옵션이 동일한 경우만 추가
      );

      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
    },

    removeFromCart: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((item) => item.menuNo !== action.payload);
    },

    updateQuantity: (state, action: PayloadAction<{ menuNo: number; quantity: number; selectedOptions: { name: string; price: number }[] }>) => {
      const item = state.items.find(
        (item) =>
          item.menuNo === action.payload.menuNo &&
          JSON.stringify(item.selectedOptions) === JSON.stringify(action.payload.selectedOptions) // ✅ 옵션이 동일한 경우 찾기
      );
      if (item) {
        item.quantity = action.payload.quantity;
      }
    },

    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
