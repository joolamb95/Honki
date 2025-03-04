import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../features/cartSlice";
import { Menu } from "../type/MenuType";
import "../resource/MenuDetail.css";
import "../component/TableManager";
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const MenuDetail = () => {
    const { menuNo, tableNo } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [quantity, setQuantity] = useState(1);
    const [selectedOptions, setSelectedOptions] = useState<{ optionNo: number; name: string; price: number }[]>([]);
    const [options, setOptions] = useState<{ optionNo: number; name: string; price: number }[]>([]);
    const [selectedTable, setSelectedTable] = useState<number | null>(null);  // ✅ null로 초기화

    const [menu, setMenu] = useState<Menu | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const storedTable = localStorage.getItem("currentTable");
        const urlTable = tableNo ? parseInt(tableNo, 10) : null;
      
        if(urlTable){
            console.log("📌 URL에서 가져온 테이블 번호:", urlTable);
            localStorage.setItem("currentTable", urlTable.toString());
            setSelectedTable(urlTable);
        }else if(storedTable){
            console.log("📌 기존 localStorage 테이블 번호 유지:", storedTable);
            setSelectedTable(parseInt(storedTable, 10));
        }else{
            console.warn("❌ MenuDetail - 테이블 번호가 설정되지 않았습니다!");
        }
    }, [tableNo]); 
    
    
 

    // ✅ API에서 메뉴 정보 가져오기
    useEffect(() => {
        if (!menuNo) return;

        setLoading(true);
        fetch(` ${apiBaseUrl}/honki/api/menus/${menuNo}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("상품을 찾을 수 없습니다.");
                }
                return response.json();
            })
            .then((data) => {
                console.log("메뉴 상세 데이터:", data);
                setMenu(data);
                setError(null);
                fetchOptions(data.categoryNo); // ✅ 메뉴 정보 가져온 후 옵션도 불러오기
            })
            .catch((err) => {
                console.error("메뉴 데이터를 불러오는 중 오류 발생:", err);
                setError("상품을 찾을 수 없습니다.");
            })
            .finally(() => setLoading(false));
    }, [menuNo]);

    // ✅ API에서 옵션 데이터 가져오기
    const fetchOptions = (categoryNo: number) => {
        fetch(` ${apiBaseUrl}/honki/api/options/${categoryNo}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("옵션을 불러올 수 없습니다.");
                }
                return response.json();
            })
            .then((data) => {
                console.log("📌 옵션 데이터:", data);
                setOptions(data.map((opt: any) => ({
                    optionNo: opt.optionNo, // ✅ 추가
                    name: opt.optionName,
                    price: opt.optionPrice || 0
                })));
            })
            .catch((err) => {
                console.error("❌ 옵션 데이터를 불러오는 중 오류 발생:", err);
            });
    };
    if (loading) {
        return <h2 className="menu-loading">⏳ 상품 정보를 불러오는 중...</h2>;
    }

    if (error || !menu) {
        return <h2 className="menu-not-found">❌ 상품을 찾을 수 없습니다.</h2>;
    }

    // ✅ 옵션 선택 핸들러
    const handleOptionChange = (option: { optionNo: number; name: string; price: number }) => {
        if (selectedOptions.find((o) => o.optionNo === option.optionNo)) {
            setSelectedOptions(selectedOptions.filter((o) => o.optionNo !== option.optionNo));
        } else {
            setSelectedOptions([...selectedOptions, option]);
        }
    };

    // ✅ 총 가격 계산
    const totalPrice = menu.menuPrice * quantity + selectedOptions.reduce((acc, option) => acc + option.price * quantity, 0);

    // ✅ 장바구니 추가 핸들러
    const handleAddToCart = () => {
    const storedTable = localStorage.getItem("currentTable"); 
    const tableNo = storedTable ? parseInt(storedTable, 10) : 1;  
    console.log("📌 MenuDetail - 장바구니 추가 시 테이블 번호:", tableNo); // ✅ 여기서 확인

    dispatch(addToCart({
        ...menu,
        quantity,
        selectedOptions: selectedOptions.map(opt => ({
            optionNo: opt.optionNo, 
            name: opt.name,
            price: opt.price
        })),
        tableNo // ✅ 올바르게 추가
    }));
    setShowModal(true);
};

    
   

    return (
        <div className="menu-detail">
            <div className="menu-detail-card">
                <img
                    src={menu.menuImg.startsWith("http") ? menu.menuImg : ` ${apiBaseUrl}/honki${menu.menuImg}`}
                    alt={menu.menuName}
                    className="menu-detail-img"
                />


                <h2 className="menu-detail-title">{menu.menuName}</h2>
                <p className="menu-detail-price">{menu.menuPrice.toLocaleString()} 원</p>

                {/* ✅ 옵션 선택 */}
                <div className="menu-options">
                    {options.length > 0 ? (
                        options.map((option) => (
                            <label key={option.name}>
                                <span>{option.name} + {option.price.toLocaleString()} 원</span>
                                <input
                                    type="checkbox"
                                    onChange={() => handleOptionChange(option)}
                                    checked={selectedOptions.some((o) => o.name === option.name)}
                                />
                            </label>
                        ))
                    ) : (
                        <p className="no-options"></p> // ✅ 옵션이 없을 경우 메시지 표시
                    )}
                </div>

                {/* ✅ 수량 선택 */}
                <div className="quantity-container">
                    <span className="tnfid">수량</span>
                    <div>
                        <button className="quantity-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                        <span className="quantity-value">{quantity}</span>
                        <button className="quantity-btn" onClick={() => setQuantity(quantity + 1)}>+</button>
                    </div>
                </div>

                {/* ✅ 버튼 */}
                <div className="menu-buttons">
                    <p className="total-price">총 금액 <strong>{totalPrice.toLocaleString()} 원</strong></p>
                    <button className="menu-cancel-button menu-button" onClick={() => navigate(-1)}>취소</button>
                    <button className="menu-cart-button menu-button" onClick={handleAddToCart}>장바구니 추가</button>
                </div>
            </div>

            {/* ✅ 장바구니 추가 후 모달 */}
            {showModal && (
                <div className="cart-modal-overlay">
                    <div className="cart-modal-content">
                        <span className="cart-modal-check-icon">✅</span>
                        <h2 className="cart-modal-title">장바구니 추가 완료</h2>
                        <p className="cart-modal-message">{menu.menuName}이(가) 장바구니에 추가되었습니다.</p>
                        <div className="cart-modal-buttons">
                            <button
                                className="cart-modal-button main"
                                onClick={() => navigate(`/table/${selectedTable}`)} // 선택된 테이블 번호로 경로 이동
                            >
                                메인으로 가기
                            </button>

                            <button className="cart-modal-button cart" onClick={() => navigate("/cart/:tableNo")}>장바구니 보기</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MenuDetail;
