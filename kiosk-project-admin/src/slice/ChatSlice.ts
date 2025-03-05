import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ChatMessage {
  sender: string;
  content: string;
  tableNo: number;
  timestamp: number;
  type?: string; // 예: "CHAT", "LEAVE", "JOIN" 등
}

interface ChatState {
  messages: { [key: number]: ChatMessage[] };
}

const initialState: ChatState = {
  messages: {},
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      const { tableNo, timestamp, sender, content } = action.payload;
      if (!state.messages[tableNo]) {
        state.messages[tableNo] = [];
      }
      state.messages[tableNo].push(action.payload);
      // 중복 메시지 방지: timestamp, sender, content가 모두 동일하면 중복으로 추가하지 않음.
      const exists = state.messages[tableNo].some(
        (msg) =>
          msg.timestamp === timestamp &&
          msg.sender === sender &&
          msg.content === content
      );
      if (!exists) {
        state.messages[tableNo].push(action.payload);
      }
    },
    setMessages: (
      state,
      action: PayloadAction<{ tableNo: number; messages: ChatMessage[] }>
    ) => {
      state.messages[action.payload.tableNo] = action.payload.messages;
    },
    clearMessages: (state, action: PayloadAction<number>) => {
      delete state.messages[action.payload];
    },
  },
});

export const { addMessage, setMessages, clearMessages } = chatSlice.actions;
export default chatSlice.reducer;
