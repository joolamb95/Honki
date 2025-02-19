import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../features/cartSlice";
import { Menu } from "../type/MenuType";
import "../resource/MenuDetail.css";

const MenuDetail = () => {
    const { menuNo } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [quantity, setQuantity] = useState(1);
    const [selectedOptions, setSelectedOptions] = useState<{ name: string; price: number }[]>([]);
    const [menu, setMenu] = useState<Menu | null>(null);
    const [options, setOptions] = useState<{ name: string; price: number }[]>([]); // ✅ 옵션 리스트 상태 추가
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // ✅ API에서 메뉴 정보 가져오기
    useEffect(() => {
        if (!menuNo) return;

        setLoading(true);
        fetch(`http://localhost:8080/honki/api/menus/${menuNo}`)
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
        fetch(`http://localhost:8080/honki/api/options/${categoryNo}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("옵션을 불러올 수 없습니다.");
                }
                return response.json();
            })
            .then((data) => {
                console.log("옵션 데이터:", data);
                setOptions(data.map((opt: any) => ({ name: opt.optionName, price: opt.optionPrice || 0 }))); // ✅ null 값 방지
            })
            .catch((err) => {
                console.error("옵션 데이터를 불러오는 중 오류 발생:", err);
            });
    };

    if (loading) {
        return <h2 className="menu-loading">⏳ 상품 정보를 불러오는 중...</h2>;
    }

    if (error || !menu) {
        return <h2 className="menu-not-found">❌ 상품을 찾을 수 없습니다.</h2>;
    }

    // ✅ 옵션 선택 핸들러
    const handleOptionChange = (option: { name: string; price: number }) => {
        if (selectedOptions.find((o) => o.name === option.name)) {
            setSelectedOptions(selectedOptions.filter((o) => o.name !== option.name));
        } else {
            setSelectedOptions([...selectedOptions, option]);
        }
    };

    // ✅ 총 가격 계산
    const totalPrice = menu.menuPrice * quantity + selectedOptions.reduce((acc, option) => acc + option.price * quantity, 0);

    // ✅ 장바구니 추가 핸들러
    const handleAddToCart = () => {
        dispatch(addToCart({
            ...menu,
            quantity,
            selectedOptions
        }));
        setShowModal(true);
    };

    return (
        <div className="menu-detail">
            <div className="menu-detail-card">
                <img src={`http://localhost:8080/honki${menu.menuImg}`} alt={menu.menuName} className="menu-detail-img" />
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
                        <p className="no-options">옵션이 없습니다.</p> // ✅ 옵션이 없을 경우 메시지 표시
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
                            <button className="cart-modal-button main" onClick={() => navigate("/")}>메인으로 가기</button>
                            <button className="cart-modal-button cart" onClick={() => navigate("/cart")}>장바구니 보기</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MenuDetail;
