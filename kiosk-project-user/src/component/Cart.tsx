import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import Modal from "react-modal";
import { loadPaymentWidget, PaymentWidgetInstance } from "@tosspayments/payment-widget-sdk";
import "../resource/Cart.css"; // ✅ 스타일 유지
import { addToCart, clearCart, removeFromCart } from "../features/cartSlice";
import AiModal from "./AiModal";
import { RecommendedMenu } from "../type/MenuType";
import FailModal from "./FailModal";




Modal.setAppElement("#root"); 

const Cart = () => {
    const cartItems = useSelector((state: RootState) => state.cart.items);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isOrderComplete, setIsOrderComplete] = useState(false);
    const [isOrderFailed, setIsOrderFailed] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [timeLeft, setTimeLeft] = useState(10);
    const [isProcessing, setIsProcessing] = useState(false);
    const paymentWidgetRef = useRef<PaymentWidgetInstance | null>(null);
    const isProcessingRef = useRef(false);
    const [isRecommendModalOpen, setIsRecommendModalOpen] = useState(false);
    const [recommendedItems, setRecommendedItems] = useState<RecommendedMenu[]>([]);
    const [isFailModalOpen, setIsFailModalOpen] = useState(false);
    const storedTable = localStorage.getItem("currentTable");
    const tableNo = storedTable ? parseInt(storedTable, 10) : 0;
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
    console.log("📌 현재 테이블 번호:", tableNo);

    const cleanupPaymentWidget = () => {
        console.log("📌 결제 위젯 제거 실행");

        if (paymentWidgetRef.current) {
            paymentWidgetRef.current = null;
        }
        const widgetContainer = document.getElementById("payment-widget");
        if (widgetContainer) {
            widgetContainer.innerHTML = "";
        }
    };
    const handleClosePayment = () => {
        cleanupPaymentWidget(); // ✅ 결제 위젯 제거
        setIsModalOpen(false);  // ✅ 결제 모달 닫기
        setIsFailModalOpen(true);  // ✅ 결제 실패 모달 열기
    };

    const totalCartPrice = cartItems.reduce(
        (acc, item) =>
            acc +
            (item.menuPrice + item.selectedOptions.reduce((optAcc, opt) => optAcc + opt.price, 0)) *
            item.quantity,
        0
    );

   



    const getAiRecommendation = async () => {
        console.log("🔍 AI 추천 요청 시작");
      
        if (!cartItems.length) return;
      
        // 1️⃣ 전체 메뉴 목록 불러오기
        let allMenus: { menuNo: number; menuName: string }[] = [];

        try {
          const response = await fetch(`${apiBaseUrl}/honki/api/menus`);
          if (!response.ok) throw new Error("❌ 전체 메뉴 조회 실패");
          allMenus = await response.json();
        } catch (error) {
          console.error("❌ 메뉴 목록을 가져오는 중 에러 발생:", error);
          return;
        }
      
        const allMenuNames = allMenus.map(m => m.menuName);
        const lastItem = cartItems[cartItems.length -1];
        const menuMap = new Map(allMenus.map(m => [m.menuName, m.menuNo]));
       
      
        let recommendedMenuNames: string[] = [];
        try {
            const response = await fetch("http://192.168.30.192:5001/recommend", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                last_item: lastItem.menuName,
                all_menus: allMenuNames
              }),
            });
            if(!response.ok){
                throw new Error("❌ AI 추천 요청 실패");
            }
            const data= await response.json();
            recommendedMenuNames = data.recommended_menus || [];     
            console.log("📌 LangChain AI 추천 응답:", recommendedMenuNames);
        } catch (error) {
          console.error("❌ LangChain 체인 실행 에러:", error);
          setIsModalOpen(true);
          return;
        }
      
       
        recommendedMenuNames = recommendedMenuNames.filter(name => allMenuNames.includes(name));
        console.log("✅ 필터링된 AI 추천 메뉴:", recommendedMenuNames);
      
        // 5️⃣ AI 추천 부족 시 카테고리 기반 추천 추가
        if (recommendedMenuNames.length < 4) {
          console.log("⚠️ AI 추천 부족, 카테고리 추천 추가");

          const categoryRecommendations: Record<number, number[]> = {
            1: [58, 59, 60, 61],
            2: [79, 80, 81, 54, 53, 52, 51, 50, 49, 82],
            3: [62, 63, 82],
            4: [84, 85, 86, 42],
            5: [50, 51, 52, 53],
            6: [55, 56, 57],
            8: [64, 65, 66, 84, 85, 86],
          };
          const cartCategories = [...new Set(cartItems.map(item => item.categoryNo))];

          let ruleBasedMenuNos = new Set<number>();

          cartCategories.forEach(category =>{
            if(categoryRecommendations[category]){
                categoryRecommendations[category]
                .slice(0, 4 - recommendedMenuNames.length)
                .forEach(no => ruleBasedMenuNos.add(no));
            }
          });
      
          
      
          if (ruleBasedMenuNos.size > 0) {
            try {
              const newRuleBasedMenuNames = await Promise.all(
                [...ruleBasedMenuNos].map(async (menuNo) => {
                  const menuName = allMenus.find(m => m.menuNo === menuNo)?.menuName;
                  if (!menuName) return null;
      
                  const url = `${apiBaseUrl}/honki/api/menus/getByName?menuName=${encodeURIComponent(menuName)}`;
                  const response = await fetch(url);
                  if (!response.ok) return null;
      
                  const menuData = await response.json();
                  return menuData.menuName;
                })
              );
              recommendedMenuNames.push(...newRuleBasedMenuNames.filter(name => name !== null) as string[]);
            } catch (error) {
              console.error("❌ 룰 기반 메뉴 조회 에러:", error);
            }
          }
        }
      
        recommendedMenuNames = recommendedMenuNames.slice(0, 4);
        if (recommendedMenuNames.length === 0) {
          console.error("❌ AI 추천 실패: 응답 데이터 없음");
          setIsModalOpen(true);
          return;
        }
      
        // 7️⃣ 최종 추천 메뉴 정보 가져오기
        try {
          const transformedRecommendedItems: RecommendedMenu[] = (await Promise.all(
            recommendedMenuNames.map(async (menuName) => {
              try {
                const url = `${apiBaseUrl}/honki/api/menus/getByName?menuName=${encodeURIComponent(menuName)}`;
                const response = await fetch(url);
                if (!response.ok) return null;
      
                const menuData = await response.json();
                return {
                  menuName: menuData.menuName,
                  menuImg: menuData.menuImg.startsWith("http")
                    ? menuData.menuImg
                    : `${apiBaseUrl}/honki${menuData.menuImg}`,
                  menuPrice: menuData.menuPrice ?? 0,
                };
              } catch (error) {
                console.error(`❌ 추천 메뉴 개별 조회 오류: ${menuName}`, error);
                return null;
              }
            })
          )).filter((item): item is RecommendedMenu => item !== null);
      
          // 최종 추천된 메뉴 상태 업데이트
          setRecommendedItems(transformedRecommendedItems);
          setIsRecommendModalOpen(true);
        } catch (error) {
          console.error("❌ 추천 메뉴 데이터 조회 오류:", error);
          setIsModalOpen(true);
        }
      };
      


    const handleBeforePayment = async () => {
        if (cartItems.length === 0) {
            navigate("/fail");
            return;
        }
        console.log("📌 AI 추천 요청 시작");  // 🚀 로그 추가
        await getAiRecommendation();
    };


    const handleSkipRecommendation = () => {
        console.log("추천 메뉴 없이 결제 진행");
        setIsRecommendModalOpen(false);
        setIsModalOpen(true); // ✅ 결제 모달 열기
    };

    const handleConfirmRecommendation = async (selectedMenu: string) => {
        console.log(`🛒 추천 메뉴 추가: ${selectedMenu}`);

        try {
            // 1. AI가 추천한 메뉴 정보를 백엔드에서 가져오기
            const response = await fetch(`${apiBaseUrl}/honki/api/menus/getByName?menuName=${encodeURIComponent(selectedMenu)}`);
            if (!response.ok) {
                console.error(`❌ API 응답 실패! 상태 코드: ${response.status}`);
                throw new Error("❌ 메뉴 정보를 가져오는데 실패했습니다.");
            }

            // 2. 메뉴 정보 배열 받기
            const menuData = await response.json();
            console.log("📌 추천된 메뉴 정보:", menuData);

            // 3. 첫 번째 메뉴 정보 사용
            if (!menuData || !menuData.menuName) {
                console.error("❌ 메뉴 데이터를 찾을 수 없습니다.");
                return;
            }

            const formattedMenu: RecommendedMenu = {
                menuName: menuData.menuName,
                menuImg: menuData.menuImg && menuData.menuImg.startsWith("http")
                    ? menuData.menuImg
                    : `${apiBaseUrl}/honki${menuData.menuImg}`, // URL 변환 처리
                menuPrice: menuData.menuPrice ?? 0
            };

            dispatch(
                addToCart({
                    // ✅ menuData가 존재하는지 확인 후 값 설정
                    menuNo: menuData?.menuNo ?? 0, // 기본값: 0
                    menuName: menuData?.menuName ?? "이름 없음",
                    engName: menuData?.engName ?? "", // 기본값: 빈 문자열
                    menuPrice: menuData?.menuPrice ?? 0,
                    menuImg: menuData?.menuImg ?? "",
                    menuStatus: menuData?.menuStatus ?? "판매중", // 기본값: 판매중
                    categoryNo: menuData?.categoryNo ?? 0,

                    quantity: 1,
                    selectedOptions: [],
                    tableNo: tableNo ?? 0, // 기본값: 0
                })
            );

            
            console.log("✅ 추천 메뉴가 장바구니에 추가되었습니다.");
        } catch (error) {
            console.error("❌ 추천 메뉴 추가 실패:", error);
        }
    };






    useEffect(() => {
        if (!isModalOpen) return;
        console.log("📌 결제 모달 상태:", isModalOpen);

        const initPaymentWidget = async () => {
            if (!isModalOpen || paymentWidgetRef.current || tableNo === null) return;

            await new Promise(resolve => setTimeout(resolve, 500));

            const clientKey = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";
            const customerKey = `table${tableNo}`;

            try {
                // ✅ PaymentWidget 로드
                const paymentWidget = await loadPaymentWidget(clientKey, customerKey);
                paymentWidgetRef.current = paymentWidget;
                console.log("📌 결제 위젯 로드 완료:", paymentWidget);

                // ✅ PaymentMethodsWidget 로드 및 저장
                const paymentMethodsWidget = paymentWidget.renderPaymentMethods("#payment-widget", totalCartPrice);
  

                const paymentContainer = document.getElementById("payment-widget");
                if (paymentContainer) {
                    paymentWidget.renderPaymentMethods("#payment-widget", { value: totalCartPrice });
                    console.log("📌 결제 위젯 렌더링 성공!");
                } else {
                    console.error("❌ 결제 위젯 요소를 찾을 수 없음");
                }


            } catch (error) {
                console.error("❌ 결제 위젯 초기화 중 오류:", error);
            }
        };

        initPaymentWidget();
        return () => {
            console.log("📌 결제 모달이 닫힐 때 위젯 제거");
            paymentWidgetRef.current = null; // ✅ 모달이 닫힐 때 위젯 상태 초기화
        }
    }, [isModalOpen, totalCartPrice, tableNo]);


    const handleClearCart = () => {
        dispatch(clearCart());
    };

    const handleDeleteItem = (menuNo: number) => {
        dispatch(removeFromCart(menuNo));
    };
    const handlePayment = async () => {
        if (isProcessingRef.current) return;
        isProcessingRef.current = true;
        setIsProcessing(true);

        try {
            const storedTable = localStorage.getItem("currentTable");
            console.log("📌 결제 시 로컬 스토리지에서 가져온 테이블 번호:", storedTable); // ✅ 로그 추가
            if (!storedTable) {
                alert("❌ 테이블 번호가 없습니다.");
                return;
            }
            const tableNo = parseInt(storedTable, 10); // 기존 테이블 번호 사용
            console.log("📌 변환된 테이블 번호:", tableNo); // ✅ 변환된 값 확인

            const orderId = `ORDER_${Date.now()}`;


            // TossPayments 결제 요청
            if (!paymentWidgetRef.current) {
                throw new Error("❌ 결제 위젯이 아직 로드되지 않았습니다!");
            }

        // ✅ 올바른 방식으로 결제 수단 가져오기
        const paymentMethodsWidget = paymentWidgetRef.current.renderPaymentMethods("#payment-widget", totalCartPrice);
        const selectedPaymentMethod = paymentMethodsWidget.getSelectedPaymentMethod();

        console.log("📌 선택된 결제 수단 전체 데이터:", selectedPaymentMethod);
        console.log("📌 선택된 결제 방식:", selectedPaymentMethod?.method);
        console.log("📌 선택된 간편결제 제공사:", selectedPaymentMethod?.easyPay?.provider);



            const response = await paymentWidgetRef.current.requestPayment({
                orderId,
                orderName: "키오스크 주문 결제",
            });



            if (!response || !response.paymentKey) {
                throw new Error("❌ 결제 키를 가져올 수 없음!");
            }

            const paymentMethod =
            selectedPaymentMethod?.easyPay?.provider // ✅ 간편결제 제공사 (카카오페이, 네이버페이 등)
            || selectedPaymentMethod?.method // ✅ 신용카드, 계좌이체, 가상계좌 등
            || response.paymentType; // ✅ TossPayments 기본 결제 타입

            // 주문 데이터 처리
            const orderData = {
                tableNo,  // 동적으로 가져온 테이블 번호 사용
                paymentNo: response.paymentKey,
                totalPrice: totalCartPrice,
                paymentMethod,
                orderItems: cartItems.map(item => ({
                    menuNo: item.menuNo,
                    optionNos: item.selectedOptions.map(option => option.optionNo),
                })),
            };

            console.log("📌 최종 저장될 결제 방식:", selectedPaymentMethod?.method || selectedPaymentMethod?.easyPay?.provider || response.paymentType);
            console.log("📌 서버로 보낼 주문 정보:", JSON.stringify(orderData, null, 2));

            // 주문 정보 저장
            const apiResponse = await fetch(`${apiBaseUrl}/honki/api/orders/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderData),
            });

            if (!apiResponse.ok) {
                throw new Error("❌ 주문 저장 실패!");
            }

            const createdOrder = await apiResponse.json();
            const orderNo = createdOrder.orderNo;
            localStorage.setItem("currentTable", tableNo.toString());

            console.log("📌 결제 완료 후 테이블 번호 유지됨:", localStorage.getItem("currentTable"));


            // 주문 상세 정보 저장 요청
            const orderDetailsData = {
                orderNo: createdOrder.orderNo,
                details: cartItems.flatMap(item =>
                    item.selectedOptions.length === 0
                        ? [{
                            menuNo: item.menuNo,
                            amount: item.quantity,
                            price: (item.menuPrice + item.selectedOptions.reduce((acc, opt) => acc + opt.price, 0)) * item.quantity,
                            optionNo: 0,  // 옵션이 없는 경우
                        }]
                        : item.selectedOptions.map(option => {
                            const price = (item.menuPrice + item.selectedOptions.reduce((acc, opt) => acc + opt.price, 0)) * item.quantity;
                            if (price > 0) {
                                return {
                                    menuNo: item.menuNo,
                                    amount: item.quantity,
                                    price: price,
                                    optionNo: option.optionNo,
                                };
                            }
                            return null;  // 가격이 0인 경우는 제외
                        }).filter(detail => detail !== null) // null 값 제거
                )
            };

            const detailResponse = await fetch(`${apiBaseUrl}/honki/api/orders-detail/add`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderDetailsData),
            });

            if (!detailResponse.ok) {
                throw new Error("❌ 주문 상세 정보 저장 실패!");
            }

            console.log("📌 주문 상세 정보가 DB에 저장됨!");

            // 주문 정보 `localStorage`에 저장 (가격이 0인 항목 제외)
            const filteredItems = cartItems.map(item => ({
                menuNo: item.menuNo,
                menuName: item.menuName,
                quantity: item.quantity,
                price: (item.menuPrice + item.selectedOptions.reduce((acc, opt) => acc + opt.price, 0)) * item.quantity,
                optionNos: item.selectedOptions.map(opt => opt.optionNo),
            })).filter(item => item.price > 0);  // 가격이 0인 항목 제외

            localStorage.setItem("paymentInfo", JSON.stringify({
                orderId: createdOrder.orderNo,
                paymentKey: response.paymentKey,
                totalCartPrice,
                paymentMethod: response.paymentType,
                items: filteredItems,
                tableNo,  // 테이블 번호도 함께 저장
            }));

            console.log("📌 결제 정보 저장 완료:", localStorage.getItem("paymentInfo"));

            // 장바구니 비우기
            dispatch(clearCart());

            // 주문 완료 페이지로 이동
            setTimeout(() => {
                navigate("/orders");
                setIsModalOpen(true);
            }, 1000);

        } catch (error) {
            console.error("❌ 결제 실패:", error);
            setErrorMessage(error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.");
            setIsOrderFailed(true);
        } finally {
            setIsProcessing(false);
            isProcessingRef.current = false;
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
                <button className="cart-confirm" onClick={handleBeforePayment}>결제하기</button>
            </div>

            <AiModal
                isOpen={isRecommendModalOpen}
                onClose={handleSkipRecommendation}
                onConfirm={handleConfirmRecommendation}
                recommendedItem={recommendedItems}
            />







            {/* ✅ 결제 위젯 모달 */}
            <Modal isOpen={isModalOpen} onRequestClose={() => setIsModalOpen(false)} className="payment-modal" overlayClassName="payment-overlay">
                <div className="payment-modal-content">
                    <h2 className="payment-title">💳 결제하기</h2>
                    <div id="payment-widget"></div>
                    <button className="payment-btn" onClick={handlePayment} disabled={isProcessingRef.current}>
                        결제
                    </button>
                    <button className="payment-close-btn" onClick={handleClosePayment}>닫기</button> {/* ✅ "닫기" 클릭 시 결제 실패 모달 오픈 */}
                    
                </div>

            </Modal>
            <FailModal isOpen={isFailModalOpen} onClose={() => setIsFailModalOpen(false)} message="결제가 취소되었습니다." />

            {/* ✅ 결제 완료 모달 */}
            <Modal isOpen={isOrderComplete} className="order-complete-modal" overlayClassName="order-overlay">
                <div className="order-complete-content">
                    <h2>✅ 결제 성공 🎉</h2>
                    <p>결제가 성공적으로 완료되었습니다!</p>
                    <p>주문번호: {localStorage.getItem("paymentInfo") && JSON.parse(localStorage.getItem("paymentInfo")!).orderId}</p>
                    <p>⏳ {timeLeft}초 후 메인 페이지로 이동합니다.</p>
                    <button className="order-btn" onClick={() => navigate("/menus")}>확인</button>
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