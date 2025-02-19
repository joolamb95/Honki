import React from "react";
import Chat from "./Chat"; // ✅ Chat.tsx 컴포넌트 import

interface ChatModalProps {
  message: string | null;
  tableId: number;
  onClose: () => void;
}

const ChatModal: React.FC<ChatModalProps> = ({ message, tableId, onClose }) => {
  return (
    <div className="chat-modal">
      <button className="modal-close" onClick={onClose}>✖</button>
      <h2>채팅</h2>
      <p>{message && `요청 메시지: ${message}`}</p>
      
      {/* ✅ Chat.tsx 사용 - tableId를 전달 */}
      <Chat tableId={tableId} />
    </div>
  );
};

export default ChatModal;