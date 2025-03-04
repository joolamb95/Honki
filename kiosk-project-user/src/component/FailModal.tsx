import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
import "../resource/FailPage.css";

interface FailModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

const FailModal: React.FC<FailModalProps> = ({ isOpen, onClose, message }) => {
  const navigate = useNavigate();
  const storedTable = localStorage.getItem("currentTable");
  const tableNo = storedTable ? parseInt(storedTable, 10) : 1; // 기본값: 1

  return (
    <Modal isOpen={isOpen} className="fail-modal" overlayClassName="fail-overlay">
      <div className="fail-content">
        <img width="80px" src="https://static.toss.im/lotties/error-spot-no-loop-space-apng.png" alt="결제 실패" />
        <h2>❌ 결제 취소</h2>
        <p className="fail-message">{message || "결제가 취소되었습니다."}</p>

        <div className="fail-buttons">
          <button className="fail-btn home" onClick={() => { navigate(`/table/${tableNo}`); onClose(); }}>🏠 홈으로 이동</button>
          <button className="fail-btn cart" onClick={() => { navigate(`/cart/${tableNo}`); onClose(); }}>🛒 장바구니로 돌아가기</button>
        </div>
      </div>
    </Modal>
  );
};

export default FailModal;