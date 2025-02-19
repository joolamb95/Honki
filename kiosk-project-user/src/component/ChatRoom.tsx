import React, { useState, useEffect, useRef } from "react";
import "../resource/Chat.css";
import VirtualKeyboard from "./VirtualKeyboard";

interface ChatRoomProps {
  initialMessage?: string | null;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ initialMessage }) => {
  const [messages, setMessages] = useState<{ text: string; sender: string }[]>([]);
  const [input, setInput] = useState("");
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasSentInitialMessage = useRef(false); // ✅ 중복 실행 방지

  // ✅ 처음 채팅방이 열릴 때 `initialMessage`가 있으면 한 번만 자동 전송
  useEffect(() => {
    if (initialMessage && !hasSentInitialMessage.current) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: initialMessage, sender: "user" },
      ]);
      hasSentInitialMessage.current = true; // ✅ 이후에는 실행 안 함
      scrollToBottom();
    }
  }, [initialMessage]);

  // ✅ 새 메시지가 추가될 때 자동 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages((prevMessages) => [...prevMessages, { text: input, sender: "user" }]);
    setInput(""); // ✅ 메시지 전송 후 입력창 초기화
    scrollToBottom();
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-bubble ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value || "")}
          placeholder="메시지를 입력하세요..."
          onFocus={() => setIsKeyboardVisible(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
        />
      </div>

      {isKeyboardVisible && (
        <VirtualKeyboard
          onChange={(text) => setInput(text)}
          onSend={sendMessage}
          onClose={() => setIsKeyboardVisible(false)}
        />
      )}
    </div>
  );
};

export default ChatRoom;
