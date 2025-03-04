import React from "react";
import { Client } from "@stomp/stompjs";
import "../App.css";
import "../resource/Chat.css"

interface ServiceCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  stompClient: Client | null; //WebSocket을 사용하기 위해 추가
  onMessageClick: (message: string) => void; //메시지 클릭 시 실행할 함수 추가
}

const ServiceCallModal: React.FC<ServiceCallModalProps> = ({ isOpen, onClose, stompClient, onMessageClick }) => {
  if (!isOpen) return null;

  //중복 실행 방지: 호출 메시지 클릭 시 한 번만 실행되도록 처리
  const handleClick = (message: string) => {
      console.log("🛎️ 호출 메시지 클릭됨:", message);
      onMessageClick(message); //Sidebar에서 채팅방 열고 메시지 전송 처리
  };

  return (
      <div className="modal-overlay">
          <div className="modal-content">
              <button className="modal-close" onClick={onClose}>✖</button>
              <h2 className="modal-title">서비스 호출</h2>
              <div className="modal-grid">
                  {["숟가락 주세요.", "젓가락 주세요.","앞접시 주세요", "물 주세요.","얼음주세요.",
                  "물티슈 주세요.","냅킨 주세요","앞치마 주세요.", "직원 호출"].map((item, index) => (
                      <button key={index} className="modal-button" onClick={() => handleClick(item)}>
                          {item}
                      </button>
                  ))}
              </div>
          </div>
      </div>
  );
};


export default ServiceCallModal;