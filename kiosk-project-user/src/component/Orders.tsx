import { useEffect, useState } from "react";
import Modal from "react-modal";
import "../resource/Order.css";
import { useNavigate } from "react-router-dom";

const Orders = () => {
    const navigate = useNavigate();
    const [paymentInfo, setPaymentInfo] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [timeLeft, setTimeLeft] = useState(10); // 10초 카운트다운

    useEffect(() => {
    const storedInfo = localStorage.getItem("paymentInfo");
    console.log("📌 LocalStorage 확인:", storedInfo);

    if (storedInfo) {
        const parsedInfo = JSON.parse(storedInfo);
        console.log("📌 파싱된 결제 정보:", parsedInfo); // ✅ 추가된 로그
        setPaymentInfo(parsedInfo);
        setIsModalOpen(true); // ✅ 모달 강제 열기
    } else {
        console.error("❌ 결제 정보를 찾을 수 없습니다. 메인 페이지로 이동합니다.");
        navigate("/");
    }
}, [navigate]);

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0 && isModalOpen) { 
            closeModal(); // ✅ 시간이 0이 되면 자동으로 닫기
        }
    }, [timeLeft, isModalOpen]);
    const closeModal = () => {
        if (paymentInfo && paymentInfo.tableNo) {
            console.log("📌 기존 테이블 번호 유지 전:", paymentInfo.tableNo);
            localStorage.setItem("currentTable", paymentInfo.tableNo.toString());
    
            // ✅ 저장 후 즉시 localStorage 값 확인
            console.log("📌 localStorage에 저장된 테이블 번호:", localStorage.getItem("currentTable"));
        }
    
        localStorage.removeItem("paymentInfo");
        setIsModalOpen(false);
    
        console.log("📌 기존 테이블 번호 유지, 이동:", localStorage.getItem("currentTable"));
    
        if (paymentInfo && paymentInfo.tableNo) {
            navigate(`/table/${paymentInfo.tableNo}`);
        } else {
            navigate("/");
        }
    };
    

    if (!paymentInfo) return null;

    const { orderId, totalCartPrice, items, tableNo } = paymentInfo;

    const orderSummary = items && items.length > 0
        ? items.map((item: any) => `${item.menuName} (${item.quantity}개, ${item.price.toLocaleString()}원)`).join(", ")
        : "주문 없음";

    return (
        <div className="home-container">
            <Modal
                isOpen={isModalOpen}
                className="order-modal"
                overlayClassName="order-overlay"
            >
                <div className="order-modal-content">
                    <div className="order-icon">✅</div>
                    <h2 className="order-title">결제 성공 🎉</h2>
                    <p className="order-text">주문이 성공적으로 완료되었습니다!</p>

                    <div className="order-summary">
                        <p className="order-detail">주문번호 : <strong>{orderId || "정보 없음"}</strong></p>
                        <p className="order-detail">결제 금액 : <strong>{totalCartPrice ? `${totalCartPrice.toLocaleString()}원` : "정보 없음"}</strong></p>
                        <p className="order-detail">주문 내역 : <strong>{orderSummary}</strong></p>
                    </div>

                    <p className="countdown-text">⏳ <strong>{timeLeft}</strong>초 후 테이블 페이지로 이동합니다.</p>

                    <button className="order-btn" onClick={closeModal}>확인</button>
                </div>
            </Modal>
        </div>
    );
};

export default Orders;
