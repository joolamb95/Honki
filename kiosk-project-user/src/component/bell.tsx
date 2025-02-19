import React from "react";
import "../App.css"; 

interface ServiceCallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ServiceCallModal: React.FC<ServiceCallModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>✖</button>
        <h2 className="modal-title" style={{color:"black"}}>서비스 호출</h2>
        <div className="modal-grid">
          {["숟가락 주세요.", "젓가락 주세요.", "앞접시 주세요.",
            "물티슈 주세요.", "얼음 주세요.", "물 주세요.",
            "앞치마 주세요.", "냅킨 주세요."].map((item, index) => (
            <button key={index} className="modal-button">
              {item}
            </button>
          ))}
          <button className="modal-button red">직원 호출</button>
        </div>
      </div>
    </div>
  );
};

export default ServiceCallModal;
