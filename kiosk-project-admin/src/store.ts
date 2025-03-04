import { configureStore } from "@reduxjs/toolkit";
import expendsReducer from "./slice/expendSlice";
import salesReducer from "./slice/salesSlice";

const store = configureStore({
  reducer: {
    expends: expendsReducer,
    sales: salesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
