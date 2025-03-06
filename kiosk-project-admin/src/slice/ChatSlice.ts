import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ChatMessage {
  sender: string;
  content: string;
  tableNo: number;
  timestamp: number;
  type?: string; 
}

interface ChatState {
  messages: { [key: number]: ChatMessage[] };
  totalCount: number;
}

const initialState: ChatState = {
  messages: {},
  totalCount: 0,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      const { tableNo, timestamp, sender, content } = action.payload;

      // 해당 테이블 메시지 배열이 없으면 생성
      if (!state.messages[tableNo]) {
        state.messages[tableNo] = [];
      }

      // 이미 동일 메시지가 있는지 확인
      const exists = state.messages[tableNo].some(
        (msg) =>
          msg.timestamp === timestamp &&
          msg.sender === sender &&
          msg.content === content
      );

      // 없으면 새 메시지 추가 + totalCount 증가
      if (!exists) {
        state.messages[tableNo].push(action.payload);
        state.totalCount++;
      }
    },
    setMessages: (
      state,
      action: PayloadAction<{ tableNo: number; messages: ChatMessage[] }>
    ) => {
      const { tableNo, messages } = action.payload;

      // 중복 없이 다시 넣기 위해
      const uniqueMessages: ChatMessage[] = [];

      // 기존 테이블 메시지 없으면 생성
      if (!state.messages[tableNo]) {
        state.messages[tableNo] = [];
      }

      messages.forEach((newMsg) => {
        const alreadyExists = state.messages[tableNo].some(
          (oldMsg) =>
            oldMsg.timestamp === newMsg.timestamp &&
            oldMsg.sender === newMsg.sender &&
            oldMsg.content === newMsg.content
        );
        if (!alreadyExists) {
          uniqueMessages.push(newMsg);
        }
      });

      // uniqueMessages를 테이블 배열에 추가
      state.messages[tableNo] = [...state.messages[tableNo], ...uniqueMessages];

      // 전체 메시지 카운트 다시 계산
      state.totalCount = Object.values(state.messages).reduce(
        (acc, msgs) => acc + msgs.length,
        0
      );
    },
    clearMessages: (state, action: PayloadAction<number>) => {
      // 특정 테이블 메시지 삭제
      const tableNo = action.payload;
      if (state.messages[tableNo]) {
        state.totalCount -= state.messages[tableNo].length;
        delete state.messages[tableNo];
      }
    },
    clearTotalCount: (state) => {
      // 전체 카운트를 0으로
      state.totalCount = 0;
    },
  },
});

export const { addMessage, setMessages, clearMessages, clearTotalCount } = chatSlice.actions;
export default chatSlice.reducer;
