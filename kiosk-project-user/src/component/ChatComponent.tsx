import { useEffect, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const ChatComponent = () => {
  const [messages, setMessages] = useState<string[]>([]); // ✅ string[]으로 변경
  const [input, setInput] = useState("");
  const [stompClient, setStompClient] = useState<Client | null>(null); // ✅ 타입 명시

  useEffect(() => {
    const socket = new SockJS("http://localhost:8080/stompServer");
    const client = new Client({
      webSocketFactory: () => socket, // SockJS 사용
      onConnect: () => {
        console.log("✅ WebSocket 연결 성공");
        client.subscribe("/topic/messages", (message) => {
          try {
            const receivedMessage = JSON.parse(message.body) as string; // ✅ string으로 변환
            setMessages((prev) => [...prev, receivedMessage]); // ✅ 타입 오류 해결
          } catch (error) {
            console.error("JSON 파싱 오류:", error);
          }
        });
      },
    });

    setStompClient(client);
    client.activate();

    return () => {
      if (client) client.deactivate();
    };
  }, []);

  const sendMessage = () => {
    if (stompClient && stompClient.connected && input.trim() !== "") {
      stompClient.publish({ destination: "/app/sendMessage", body: input }); // ✅ 올바른 전송 경로
      setInput("");
    } else {
      console.error("🚨 WebSocket 연결이 되어 있지 않음");
    }
  };

  return (
    <div>
      <h2>채팅</h2>
      <div>
        {messages.map((msg, index) => (
          <p key={index}>{msg}</p> // ✅ 정상적으로 렌더링됨
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button onClick={sendMessage}>보내기</button>
    </div>
  );
};

export default ChatComponent;
