import React from "react";
import Chat from "./Chat";
import "../resource/ChatModal.css";
import "../App.css";
import { Client } from "@stomp/stompjs";

interface ChatModalProps {
  tableNo: number;
  isOpen: boolean;
  onClose: () => void;
  initialMessage?: string | null;
  stompClient?: Client | null;
}

const ChatModal: React.FC<ChatModalProps> = ({
  tableNo,
  isOpen,
  onClose,
  initialMessage,
  stompClient,
}) => {
  if (!isOpen) return null; // 모달이 닫혀 있으면 렌더링하지 않음

  return (
    <div className="chat-modal-overlay">
      <div className="chat-modal-content">
        <div className="chat-modal-header">
          <h2>테이블 {tableNo} 채팅방</h2>
          <button className="chat-close-x" onClick={onClose}>
            ✖
          </button>
        </div>
        <Chat
          tableNo={tableNo}
          onClose={onClose}
          initialMessage={initialMessage}
          stompClient={stompClient}
        />
      </div>
    </div>
  );
};

export default ChatModal;
