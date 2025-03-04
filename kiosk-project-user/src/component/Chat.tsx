import React, { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { setMessages, addMessage } from "../features/chatSlice";
import { ChatMessage } from "../type/ChatModal";
import "../resource/ChatModal.css";
import VirtualKeyboard from "./VirtualKeyboard";
interface ChatProps {
  tableNo: number;
  onClose: () => void;
  initialMessage?: string | null;
  stompClient?: Client | null;
}
const Chat: React.FC<ChatProps> = ({ tableNo, onClose, initialMessage, stompClient }) => {
  const dispatch = useDispatch();
  const chatMessages = useSelector((state: RootState) => state.chat.messages[tableNo] || []);
  const [message, setMessage] = useState(initialMessage || "");
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  // 서버에서 기존 메시지 불러오기
  // Redux 저장
  useEffect(() => {
    fetch(`${apiBaseUrl}/honki/chat/${tableNo}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("1기존 메시지 불러오기 성공:", data);
        dispatch(setMessages({ tableNo, messages: data }));
      })
      .catch((err) => console.error("기존 메시지 불러오기 실패:", err));
  }, [tableNo, dispatch]);
  // 메시지 전송
  const sendMessage = () => {
    if (!stompClient || !stompClient.connected) {
      console.error(":경광등: WebSocket이 아직 연결되지 않음.");
      return;
    }
    if (!message.trim()) {
      console.error(":경광등: 빈 메시지는 전송할 수 없음");
      return;
    }
    const newMessage: ChatMessage = {
      sender: "user",
      content: message.trim(),
      tableNo,
      timestamp: Date.now(),
      type: "CHAT"
    };
    console.log(":화살표가_있는_봉투: [손님] 메시지 전송:", newMessage);
    // 서버로 발행
    stompClient.publish({
      destination: "/app/chat.sendMessage",
      body: JSON.stringify(newMessage),
    });
    dispatch(addMessage(newMessage));
    setMessage("");
  };
  // 채팅 메시지가 갱신될 때마다 스크롤 맨 아래로 이동
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);
  return (
    <div>
      <div className="chat-messages" ref={chatContainerRef} style={{ overflowY: "auto", maxHeight: "300px" }}>
        {chatMessages.length === 0 && <p>:말풍선:</p>}
        {chatMessages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.sender === "owner" ? "other-message" : "my-message"}`}>
            <strong>{msg.sender}:</strong> {msg.content}
          </div>
        ))}
      </div>
      <div className="chat-input-container">
        <input
          type="text"
          className="chat-input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onFocus={() => setIsKeyboardOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
      </div>
      {isKeyboardOpen && (
        <VirtualKeyboard onChange={(input) => setMessage(input)} onSend={sendMessage} onClose={() => setIsKeyboardOpen(false)} />
      )}
    </div>
  );
};
export default Chat;