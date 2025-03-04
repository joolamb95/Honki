export interface ChatMessage {
    sender: string;
    content: string;
    timestamp: number;
    tableNo: number;
    type: "CHAT" | "JOIN" | "LEAVE" | "CALL";
}
