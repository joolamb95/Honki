import { Client } from "@stomp/stompjs";
import { createContext, useContext } from "react";

interface WebSocketContextType {
    stompClient: Client | null;
    orderUpdates: any;
    chatMessages: { [key: number]: any[] };
}

export const WebSocketContext = createContext<WebSocketContextType>({
    stompClient: null,
    orderUpdates: null,
    chatMessages: {},  // 기본값은 빈 객체
  });

  export const useWebSocket = () => useContext(WebSocketContext);