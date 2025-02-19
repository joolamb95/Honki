import { Link, useSearchParams, useNavigate } from "react-router-dom";
import Modal from "react-modal";
import "../resource/FailPage.css"; // ✅ 스타일 유지

const FailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const errorMessage = searchParams.get("message") || "알 수 없는 오류가 발생했습니다.";
  const errorCode = searchParams.get("code") || "UNKNOWN_ERROR";

  return (
    <Modal isOpen={true} className="fail-modal" overlayClassName="fail-overlay">
      <div className="fail-content">
        <img width="80px" src="https://static.toss.im/lotties/error-spot-no-loop-space-apng.png" alt="결제 실패" />
        <h2>❌ 결제 실패</h2>
        <p className="fail-message">{errorMessage}</p>
       

        <div className="fail-buttons">
          <button className="fail-btn home" onClick={() => navigate("/")}>🏠 홈으로 이동</button>
          <button className="fail-btn cart" onClick={() => navigate("/cart")}>🛒 장바구니로 돌아가기</button>
        </div>
      </div>
    </Modal>
  );
};

export default FailPage;
