import { useEffect, useState } from "react";
import Modal from "react-modal";
import "../resource/Order.css";
import { useNavigate } from "react-router-dom";

const Orders = () => {
    const navigate = useNavigate();
    const [paymentInfo, setPaymentInfo] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(true);
    const [timeLeft, setTimeLeft] = useState(10); // 10초 카운트다운

    // ✅ 로컬스토리지에서 결제 정보 불러오기
    useEffect(() => {
        let attempts = 0;
        const maxAttempts = 5;
    
        const checkLocalStorage = () => {
            let storedInfo = localStorage.getItem("paymentInfo");
            console.log(`📌 LocalStorage 확인 시도 (${attempts + 1}/${maxAttempts}):`, storedInfo);
    
            if (storedInfo) {
                setPaymentInfo(JSON.parse(storedInfo));
            } else {
                attempts += 1;
                if (attempts < maxAttempts) {
                    setTimeout(checkLocalStorage, 1000); // 1초 후 다시 확인
                } else {
                    console.error("❌ 결제 정보를 끝내 찾을 수 없습니다. 메인 페이지로 이동합니다.");
                    navigate("/");
                }
            }
        };
    
        checkLocalStorage();
    }, [navigate]);

    // ✅ 10초 카운트다운 & 자동 닫기
    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            closeModal();
        }
    }, [timeLeft]);

    const closeModal = () => {
        localStorage.removeItem("paymentInfo"); // ✅ 결제 정보 삭제
        setIsModalOpen(false);
        navigate("/"); // ✅ 메인 페이지 이동
    };

    // ✅ 결제 정보가 없으면 렌더링 방지
    if (!paymentInfo) return null;

    const { orderId, totalCartPrice, paymentMethod, items } = paymentInfo;

    // ✅ 상품 가격과 개수를 포함한 주문 내역 표시
    const orderSummary = items && items.length > 0
        ? items.map((item: any) => `${item.menuName} (${item.quantity}개, ${item.price.toLocaleString()}원)`).join(", ")
        : "주문 없음";

    return (
        <div className="home-container">
            <Modal 
                isOpen={isModalOpen} 
                onRequestClose={closeModal} 
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

                    <p className="countdown-text">⏳ <strong>{timeLeft}</strong>초 후 메인 페이지로 이동합니다.</p>

                    <button className="order-btn" onClick={closeModal}>확인</button>
                </div>
            </Modal>
        </div>
    );
};

export default Orders;
