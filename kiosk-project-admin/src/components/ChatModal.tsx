import React, { useEffect, useRef, useState } from "react";
import "../style/ChatModal.css";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { addMessage, setMessages } from "../slice/ChatSlice";

interface ChatModalProps {
  tableNo: number;
  onSendMessage: (tableNo: number, content: string) => void;
  onClose: () => void;
}

const ChatModal: React.FC<ChatModalProps> = ({ tableNo, onSendMessage, onClose }) => {
  const dispatch = useDispatch();
  const chatMessages = useSelector((state: RootState) => state.chat.messages[tableNo] || []);
  const [inputText, setInputText] = useState("");
  const chatWindowRef = useRef<HTMLDivElement | null>(null);

  // 환경 변수에서 API URL 불러오기
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  // 기존 메시지 불러오기
  useEffect(() => {
    if (!apiBaseUrl) {
      console.error("API Base URL이 설정되지 않았습니다.");
      return;
    }

    fetch(`${apiBaseUrl}/honki/chat/${tableNo}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("기존 메시지 불러오기 성공:", data);
        dispatch(setMessages({ tableNo, messages: data }));
      })
      .catch((err) => console.error("기존 메시지 불러오기 실패:", err));
  }, [tableNo, dispatch, apiBaseUrl]);

  // 메시지 상태가 변경될 때마다 스크롤을 맨 아래로 이동
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    console.log("[사장님] 메시지 전송:", inputText.trim());

    const newMessage = {
      tableNo,
      sender: "owner",
      content: inputText.trim(),
      timestamp: Date.now(),
    };

    // Redux에 메시지 추가
    dispatch(addMessage(newMessage));
    
    // WebSocket을 통해 메시지 전송
    onSendMessage(tableNo, inputText.trim());
    setInputText("");
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="chat-modal" onClick={(e) => e.stopPropagation()}>
        <div className="chat-header">
          <h2>{`테이블 ${tableNo}`}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="chat-window" ref={chatWindowRef}>
          {chatMessages.map((msg, index) => (
            <div
              key={index}
              className={`chat-message ${msg.sender === "owner" ? "owner-message" : "guest-message"}`}
            >
              {msg.content}
            </div>
          ))}
        </div>
        <div className="chat-input-container">
          <input
            type="text"
            className="chat-input"
            placeholder="메시지 입력..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <button className="chat-send-button" onClick={handleSendMessage}>
            보내기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;
