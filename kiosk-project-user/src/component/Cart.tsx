import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import Modal from "react-modal";
import { loadPaymentWidget, PaymentWidgetInstance } from "@tosspayments/payment-widget-sdk";
import "../resource/Cart.css"; // ✅ 스타일 유지
import { clearCart, removeFromCart } from "../features/cartSlice";

Modal.setAppElement("#root"); // 💡 `index.html`에서 `id="root"`가 있어야 함

const Cart = () => {
    const cartItems = useSelector((state: RootState) => state.cart.items);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isOrderComplete, setIsOrderComplete] = useState(false);
    const [isOrderFailed, setIsOrderFailed] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [timeLeft, setTimeLeft] = useState(10);
    const paymentWidgetRef = useRef<PaymentWidgetInstance | null>(null);

    // ✅ 총 금액 계산 (옵션 포함)
    const totalCartPrice = cartItems.reduce(
        (acc, item) =>
            acc +
            (item.menuPrice + item.selectedOptions.reduce((optAcc, opt) => optAcc + opt.price, 0)) *
            item.quantity,
        0
    );

    useEffect(() => {
        console.log("📌 결제 모달 상태:", isModalOpen);
    
        const initPaymentWidget = async () => {
            if (!isModalOpen) return; // 모달이 열리지 않으면 실행 안됨
    
            await new Promise(resolve => setTimeout(resolve, 500));
            const clientKey = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";
            const tableNo = 1;
            const customerKey = `table_${tableNo}`;
    
            const paymentWidget = await loadPaymentWidget(clientKey, customerKey);
            console.log("📌 결제 위젯 로드 완료:", paymentWidget);
    
            // ✅ 결제 위젯 요소가 존재하는지 확인 후 렌더링
            const paymentContainer = document.getElementById("payment-widget");
            if (paymentContainer) {
                paymentWidget.renderPaymentMethods("#payment-widget", { value: totalCartPrice });
                console.log("📌 결제 위젯 렌더링 성공!");
            } else {
                console.error("❌ 결제 위젯 요소를 찾을 수 없음, 0.5초 후 재시도...");
                setTimeout(() => {
                    const retryContainer = document.getElementById("payment-widget");
                    if (retryContainer) {
                        paymentWidget.renderPaymentMethods("#payment-widget", { value: totalCartPrice });
                        console.log("📌 결제 위젯 렌더링 성공! (재시도)");
                    } else {
                        console.error("❌ 재시도 후에도 결제 위젯 요소를 찾을 수 없음");
                    }
                }, 500); // 0.5초 후 재시도
            }
    
            paymentWidgetRef.current = paymentWidget;
        };
    
        initPaymentWidget();
    }, [isModalOpen, totalCartPrice]);
    

    const handleClearCart = () => {
        dispatch(clearCart());
    };

    const handleDeleteItem = (menuNo: number) => {
        dispatch(removeFromCart(menuNo));
    };
    const handlePayment = async () => {
        console.log("📌 handlePayment 함수 실행됨");
        if (totalCartPrice < 1) {  // ✅ 최소 결제 금액을 5,000원으로 설정
            navigate("/fail?message=장바구니에는 하나의 메뉴가 있어야 합니다.");
            return;
        }
    
        if (!paymentWidgetRef.current) {
            console.error("❌ 결제 위젯이 아직 로드되지 않음!");
            return;
        }
    
        try {
            const orderId = `ORDER_${Date.now()}`;
    
            // ✅ 기존 결제 UI를 다시 렌더링하여 자동 결제 방지
            paymentWidgetRef.current.renderPaymentMethods("#payment-widget", { value: totalCartPrice });
    
            // ✅ `successUrl`, `failUrl` 제거 (Promise 방식 사용)
            const response = await paymentWidgetRef.current.requestPayment({
                orderId,
                orderName: "키오스크 주문 결제",
            });
    
            const paymentMethod = response?.paymentType || "미확인";
    
            // ✅ 주문 정보 저장
            const paymentData = {
                orderId,
                items: cartItems.map(item => ({
                    menuNo: item.menuNo,
                    menuName: item.menuName,
                    quantity: item.quantity,
                    price: item.menuPrice,
                })),
                totalCartPrice,
                paymentMethod,
            };
    
            console.log("📌 저장 전 paymentData:", paymentData);
            localStorage.setItem("paymentInfo", JSON.stringify(paymentData));
    
            // ✅ 결제 완료 후 장바구니 비우기
            dispatch(clearCart());
    
            // ✅ 데이터 저장 완료 후 1초 후 `navigate("/orders")` 실행
            setTimeout(() => {
                console.log("📌 navigate 직전 paymentInfo:", localStorage.getItem("paymentInfo"));
                navigate("/orders");
                setIsModalOpen(false); // ✅ 결제 완료 후 모달 닫기
            }, 1000); // 1초 후 실행 (데이터 저장 후 이동)
    
        } catch (error) {
            console.error("❌ 결제 실패:", error);
        }
    };

    // ✅ 10초 후 자동으로 닫히도록 설정
    useEffect(() => {
        if (isOrderComplete && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);

            return () => clearInterval(timer);
        } else if (timeLeft === 0) {
            setIsOrderComplete(false);
            navigate("/orders");
        }
    }, [isOrderComplete, timeLeft]);

    return (
        <div className="cart-container">
            <h2 className="cart-title">🛒 장바구니</h2>

            {cartItems.length === 0 ? (
                <p className="cart-empty">장바구니에 담긴 상품이 없습니다.</p>
            ) : (
                <div className="cart-summary">
                    <ul className="cart-list">
                        {cartItems.map((item) => (
                            <li key={item.menuNo} className="cart-item">
                                <img src={item.menuImg} alt={item.menuName} className="cart-img" />
                                <div className="cart-details">
                                    <p className="cart-name">{item.menuName}</p>
                                    {item.selectedOptions.length > 0 && (
                                        <div className="cart-options">
                                            {item.selectedOptions.map((option, index) => (
                                                <p key={index} className="cart-option">
                                                    {option.name} + {option.price.toLocaleString()}원
                                                </p>
                                            ))}
                                        </div>
                                    )}
                                    <p className="cart-quantity">수량: {item.quantity}개</p>
                                    <p className="cart-price">
                                        {((item.menuPrice + item.selectedOptions.reduce((optAcc, opt) => optAcc + opt.price, 0))
                                            * item.quantity).toLocaleString("ko-KR")} 원
                                    </p>
                                </div>
                                <div className="cart-actions">
                                    <button className="cart-delete-btn" onClick={() => handleDeleteItem(item.menuNo)}>
                                        ❌
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <p className="cart-total">
                        <button className="cart-clear-btn" onClick={handleClearCart}>장바구니 비우기</button>
                        총 결제 금액: <span className="cart-total-amount">
                            {totalCartPrice.toLocaleString("ko-KR")}원
                        </span>
                    </p>
                </div>
            )}

            <div className="cart-buttons">
                <button className="cart-cancel" onClick={() => navigate(-1)}>취소</button>
                <button className="cart-confirm" onClick={() => setIsModalOpen(true)}>결제하기</button>
            </div>

            {/* ✅ 결제 위젯 모달 */}
            <Modal isOpen={isModalOpen} onRequestClose={() => setIsModalOpen(false)} className="payment-modal" overlayClassName="payment-overlay">
                <div className="payment-modal-content">
                    <h2 className="payment-title">💳 결제하기</h2>
                    <div id="payment-widget"></div>
                    <button className="payment-btn" onClick={handlePayment}>결제</button>
                    <button className="payment-close-btn" onClick={() => setIsModalOpen(false)}>닫기</button>
                </div>
            </Modal>

            {/* ✅ 결제 완료 모달 */}
            <Modal isOpen={isOrderComplete} className="order-complete-modal" overlayClassName="order-overlay">
                <div className="order-complete-content">
                    <h2>✅ 결제 성공 🎉</h2>
                    <p>결제가 성공적으로 완료되었습니다!</p>
                    <p>주문번호: {localStorage.getItem("paymentInfo") && JSON.parse(localStorage.getItem("paymentInfo")!).orderId}</p>
                    <p>⏳ {timeLeft}초 후 메인 페이지로 이동합니다.</p>
                    <button className="order-btn" onClick={() => navigate("/")}>확인</button>
                </div>
            </Modal>
            <Modal
    isOpen={isOrderFailed}
    onRequestClose={() => setIsOrderFailed(false)}
    className="payment-fail-modal"
    overlayClassName="payment-fail-overlay"
>
    <div className="payment-fail-content">
        <h2>❌ 결제 실패</h2>
        <p>{errorMessage}</p>
        <button className="fail-btn" onClick={() => setIsOrderFailed(false)}>닫기</button>
    </div>
</Modal>



        </div>
    );
};

export default Cart;
