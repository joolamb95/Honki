import {  createSlice } from "@reduxjs/toolkit";
import { Menu } from "../type/MenuType";

const initialState: Menu[] = [];

const menuSlice = createSlice({
  name: "menu",
  initialState,
  reducers: {
    selectMenu: (state, data) => {
      // data.payload 컴포넌트가 전달한 값
      return data.payload;
    },
  },
});

export const { selectMenu } = menuSlice.actions;

export default menuSlice.reducer;
