import { createSlice, PayloadAction } from "@reduxjs/toolkit";
interface ChatMessage {
    sender: string;
    content: string;
    tableNo: number;
    timestamp: number;
    type: "CHAT" | "JOIN" | "LEAVE" | "CALL";
}
interface ChatState {
    messages: { [key: number]: ChatMessage[] };
    unreadCount: { [key: number]: number };
}
const initialState: ChatState = {
    messages: {}, // :흰색_확인_표시: 테이블별 메시지 저장
    unreadCount: {},
};
const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        addMessage: (state, action: PayloadAction<ChatMessage>) => {
            const { tableNo, sender, type } = action.payload;
            if (!state.messages[tableNo]) {
                state.messages[tableNo] = [];
                state.unreadCount[tableNo] = 0;
            }
            state.messages[tableNo].push(action.payload);
            if (sender === "owner" && type !== "CALL") {  // :흰색_확인_표시: CALL 타입이면 카운트 증가 안 함
                state.unreadCount[tableNo] = (state.unreadCount[tableNo] || 0) + 1;
            }
        },
        setMessages: (state, action: PayloadAction<{ tableNo: number; messages: ChatMessage[] }>) => {
            state.messages[action.payload.tableNo] = action.payload.messages;
        },
        clearMessages: (state, action: PayloadAction<number>) => {
            console.log(`:빗자루: Redux: 테이블 ${action.payload}의 메시지 삭제 실행`);
            state.messages[action.payload];
            console.log(":메모: Redux 상태 업데이트 후:", state.messages); // :흰색_확인_표시: Redux 상태 확인
        },
    },
});
export const { addMessage, setMessages, clearMessages } = chatSlice.actions;
export default chatSlice.reducer;