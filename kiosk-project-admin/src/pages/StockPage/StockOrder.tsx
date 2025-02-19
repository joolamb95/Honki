import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import '../../style/StockOrder.css';

interface StockItem {
    menuNo: number;
    menuName: string;
    stockQuantity: number;
    stockLastUpdate: string;
    stockStatus: string | null;
}

interface OrderQuantity {
    [key: number]: number;
}

const StockOrder: React.FC = () => {
    const [stocks, setStocks] = useState<StockItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchCategory, setSearchCategory] = useState('전체');
    const [orderQuantities, setOrderQuantities] = useState<OrderQuantity>({});
    const [activeTab, setActiveTab] = useState<'menu' | 'option'>('menu');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        fetchStocks();
    }, []);

    const fetchStocks = async () => {
        try {
            const response = await axios.get<StockItem[]>('http://localhost:8080/honki/stock');
            setStocks(response.data);
        } catch (error) {
            console.error('재고 조회 실패:', error);
            setStocks([]);
        }
    };

    const handleQuantityChange = (menuNo: number, value: number) => {
        setOrderQuantities(prev => ({
            ...prev,
            [menuNo]: value
        }));
    };

    const handleOrder = async () => {
        const orderedItems = Object.entries(orderQuantities).filter(([_, quantity]) => quantity > 0);
        
        if (orderedItems.length === 0) {
            alert('주문할 수량을 입력해주세요.');
            return;
        }

        try {
            for (const [menuNo, quantity] of orderedItems) {
                await axios.post('http://localhost:8080/honki/stock/order', {
                    menuNo: parseInt(menuNo),
                    orderQuantity: quantity,
                    orderAmount: quantity * 1000 // 임시 가격
                });
            }
            alert('재고 주문이 완료되었습니다.');
            setOrderQuantities({});
            fetchStocks();
        } catch (error) {
            console.error('재고 주문 실패:', error);
            alert('재고 주문에 실패했습니다.');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleSearch = () => {
        // 검색 로직
    };

    return (
        <div className="stock-management">
            <div className="stock-nav">
                <button 
                    className={location.pathname === '/stock/management' ? 'active' : ''}
                    onClick={() => navigate('/stock/management')}
                >
                    재고관리
                </button>
                <button 
                    className={location.pathname === '/stock/order' ? 'active' : ''}
                    onClick={() => navigate('/stock/order')}
                >
                    재고주문
                </button>
                <button 
                    className={location.pathname === '/stock/details' ? 'active' : ''}
                    onClick={() => navigate('/stock/details')}
                >
                    재고내역
                </button>
            </div>

            <div className="content-wrapper">
                <div className="content-header">재고 주문</div>
                <div className="order-tabs">
                    <button 
                        className={`tab-button ${activeTab === 'menu' ? 'active' : ''}`}
                        onClick={() => setActiveTab('menu')}
                    >
                        메뉴 재고주문
                    </button>
                    <button 
                        className={`tab-button ${activeTab === 'option' ? 'active' : ''}`}
                        onClick={() => setActiveTab('option')}
                    >
                        옵션 재고주문
                    </button>
                </div>

                <div className="search-section">
                    <div className="search-box">
                        <select 
                            className="menu-select"
                            value={searchCategory}
                            onChange={(e) => setSearchCategory(e.target.value)}
                        >
                            <option>전체</option>
                            <option>메뉴 번호</option>
                            <option>메뉴 이름</option>
                            <option>결제 날짜</option>
                        </select>
                        <input 
                            type="text" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="검색어를 입력하세요"
                        />
                        <button onClick={handleSearch}>검색</button>
                    </div>
                </div>
            </div>

            <table className='order-table'>
                <thead>
                    <tr>
                        <th>메뉴 번호</th>
                        <th>메뉴 이름</th>
                        <th>현재 수량</th>
                        <th>주문 수량</th>
                        <th>주문 금액</th>
                    </tr>
                </thead>
                <tbody>
                    {stocks.map((stock) => (
                        <tr key={stock.menuNo}>
                            <td>{stock.menuNo}</td>
                            <td>{stock.menuName}</td>
                            <td>{stock.stockQuantity}</td>
                            <td>
                                <input 
                                    className="stock-modify" 
                                    type="number" 
                                    min={0}
                                    value={orderQuantities[stock.menuNo] || ''}
                                    onChange={(e) => handleQuantityChange(
                                        stock.menuNo, 
                                        parseInt(e.target.value) || 0
                                    )}
                                />
                            </td>
                            <td>
                                {orderQuantities[stock.menuNo] 
                                    ? `${(orderQuantities[stock.menuNo] * 1000).toLocaleString()}원` 
                                    : '0원'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
            <div className="button-container">
                <button className="order-button" onClick={handleOrder}>
                    메뉴 재고 주문
                </button>
            </div>
        </div>
    );
};

export default StockOrder;