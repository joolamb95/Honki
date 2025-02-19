import React, { useEffect, useRef, useState } from "react";
import "../style/ChatModal.css";  // ✅ 새 CSS 파일 임포트

interface ChatModalProps {
  tableNumber: number | null;
  messages: { sender: string; text: string }[];
  onSendMessage: (tableNumber: number, message: string) => void;
  onClose: () => void;
}
const ChatModal: React.FC<ChatModalProps> = ({ tableNumber, messages, onSendMessage, onClose }) => {
  if (tableNumber === null) return null;  // :흰색_확인_표시: tableNumber가 null이면 렌더링하지 않음
  const [inputText, setInputText] = useState("");  // :흰색_확인_표시: useState는 항상 같은 순서
  const chatEndRef = useRef<HTMLDivElement | null>(null);  // :흰색_확인_표시: useRef를 뒤로 이동시키지 않음
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  const handleSendMessage = () => {
    const trimmedMessage = inputText.trim();
    if (trimmedMessage === "") return;
    onSendMessage(tableNumber, trimmedMessage);
    setInputText("");
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="chat-modal" onClick={(e) => e.stopPropagation()}>
        <div className="chat-header">
          <h2>테이블 {tableNumber}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="chat-window">
          {messages.map((msg, index) => (
            <div key={index} className={`chat-message ${msg.sender === "owner" ? "owner-message" : "guest-message"}`}>
              {msg.text}
            </div>
          ))}
          <div ref={chatEndRef} /> {/* :흰색_확인_표시: useRef 사용 위치 유지 */}
        </div>
        <div className="chat-input-container">
          <input
            type="text"
            className="chat-input"
            placeholder="메시지 입력..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className="chat-send-button" onClick={handleSendMessage}>보내기</button>
        </div>
      </div>
    </div>
  );
};
export default ChatModal;