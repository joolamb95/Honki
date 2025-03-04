import React from "react";
import "../resource/AiModal.css";

// ✅ 추천 메뉴 타입 정의
interface RecommendedMenu {
  menuName: string;
  menuImg: string;
  menuPrice: number;
}

interface AiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedMenu: string) => void;
  recommendedItem: RecommendedMenu[];
}
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const AiModal: React.FC<AiModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  recommendedItem
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>추천 메뉴</h2>

    
        <ul className="ai-modal-list">
          {recommendedItem.map((menu, index) => (
            <li className="ai-modal-item" key={index}>
              <img 
                src={menu.menuImg.startsWith("http") ? menu.menuImg : `${apiBaseUrl}/honki${menu.menuImg}`} 
                alt={menu.menuName} 
                className="ai-modal-image"
              />
              <p className="ai-modal-menu-name">{menu.menuName}</p>
              <p className="ai-modal-menu-price">{menu.menuPrice.toLocaleString()} 원</p>

              <button className="ai-modal-button" onClick={() => onConfirm(menu.menuName)}>
                추가
              </button>
            </li>
          ))}
        </ul>

        <button className="ai-modal-close" onClick={onClose}>결제</button>
      </div>
    </div>
  );
};

export default AiModal;
