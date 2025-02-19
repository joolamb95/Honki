import React, { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import '../../style/StockOrder.css'

interface StockItem {
    menuNo: string;          // MENU_NO
    menuName: string;        // MENU_NAME
    stockQuantity: number;   // STOCK_QUANTITY
    orderQuantity: number;   // ORDER_QUANTITY
    orderAmount: number;     // ORDER_AMOUNT
    orderDate: string;       // ORDER_DATE
}

interface StockOrderItem {
    orderId: number;         // ORDER_ID
    menuNo: string;          // MENU_NO
    menuName: string;        // MENU_NAME
    orderQuantity: number;   // ORDER_QUANTITY
    orderDate: string;       // ORDER_DATE
    orderAmount: number;     // ORDER_AMOUNT
}

interface OptionItem {
    optionNo: string;          
    optionName: string;        
    stockQuantity: number;   
    orderQuantity: number;   
    orderAmount: number;     
    orderDate: string;       
}

// 검색 및 주문
const StockOrder: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchCategory, setSearchCategory] = useState('전체');
    const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
    const [orderQuantities, setOrderQuantities] = useState<{ [key: string]: number }>({});
    const [activeTab, setActiveTab] = useState<'menu' | 'option'>('menu');
    const [optionOrderQuantities, setOptionOrderQuantities] = useState<{ [key: string]: number }>({});
    const navigate = useNavigate();
    const location = useLocation();

    // 초기 재고 데이터
    const initialStockData: StockItem[] = [
        { menuNo: 'M001', menuName: '라면', stockQuantity: 50, orderQuantity: 0, orderAmount: 50000, orderDate: '2025-02-05' },
        { menuNo: 'M002', menuName: '김치찌개', stockQuantity: 80, orderQuantity: 0, orderAmount: 0, orderDate: '-' },
        { menuNo: 'M003', menuName: '계란말이', stockQuantity: 50, orderQuantity: 0, orderAmount: 0, orderDate: '-' },
        { menuNo: 'M004', menuName: '진로', stockQuantity: 200, orderQuantity: 0, orderAmount: 0, orderDate: '-' },
    ];

    // 초기 옵션 데이터
    const initialOptionData: OptionItem[] = [
        { optionNo: 'P001', optionName: '라면사리', stockQuantity: 30, orderQuantity: 0, orderAmount: 0, orderDate: '-' },
        { optionNo: 'P002', optionName: '계란', stockQuantity: 100, orderQuantity: 0, orderAmount: 0, orderDate: '-' },
        { optionNo: 'P003', optionName: '고기추가', stockQuantity: 20, orderQuantity: 0, orderAmount: 0, orderDate: '-' },
        { optionNo: 'P004', optionName: '당면사리', stockQuantity: 25, orderQuantity: 0, orderAmount: 0, orderDate: '-' },
    ];

    // localStorage에서 재고 데이터 가져오기
    const savedStockData = localStorage.getItem('stockManagement');
    const stockData: StockItem[] = savedStockData ? JSON.parse(savedStockData).map((item: any) => ({
        menuNo: item.menuNo,
        menuName: item.menuName,
        stockQuantity: item.quantity || 0,
        orderQuantity: 0,
        orderAmount: 0,
        orderDate: item.paymentDate || '-'
    })) : initialStockData;

    // 주문 수량 변경
    const handleQuantityChange = (menuNo: string, value: number) => {
        setOrderQuantities(prev => ({
            ...prev,
            [menuNo]: value
        }));
    };

    // 주문 처리
    const handleOrder = () => {
        const orderedItems = Object.entries(orderQuantities).filter(([_, quantity]) => quantity > 0);
        
        if (orderedItems.length === 0) {
            alert('주문할 수량을 입력해주세요.');
            return;
        }

        const currentDate = new Date().toISOString().split('T')[0];

        // StockManagement 데이터 업데이트
        const existingStockManagement = JSON.parse(localStorage.getItem('stockManagement') || '[]');
        const updatedStockManagement = existingStockManagement.map((item: any) => {
            const menuNoWithoutM = Number(item.menuNo.replace('M', ''));
            const orderItem = orderedItems.find(([menuNo]) => Number(menuNo) === menuNoWithoutM);
            
            if (orderItem) {
                return {
                    ...item,
                    quantity: (item.quantity || 0) + orderItem[1],
                    paymentDate: currentDate
                };
            }
            return item;
        });

        // 기존 주문 내역 가져오기
        const existingOrders = JSON.parse(localStorage.getItem('orderHistory') || '[]');
        
        // 주문 내역 생성
        const orderData: StockOrderItem[] = orderedItems.map(([menuNo, quantity], index) => {
            const item = stockData.find(item => item.menuNo === String(menuNo));
            // 기존 주문 개수 + 1부터 시작하는 발주번호
            const nextOrderNumber = existingOrders.length + index + 1;
            const orderId = Number(`${nextOrderNumber}`.padStart(3, '0')); // 001, 002 형식의 숫자
            const amount = quantity * 1000;

            return {
                orderId,
                menuNo: String(menuNo),
                menuName: item?.menuName || '',
                orderQuantity: quantity,
                orderDate: currentDate,
                orderAmount: amount
            };
        });

        // localStorage 업데이트
        localStorage.setItem('stockManagement', JSON.stringify(updatedStockManagement));
        localStorage.setItem('orderHistory', JSON.stringify([...orderData, ...existingOrders]));

        setOrderQuantities({});
        alert('주문이 완료되었습니다.');
        navigate('/stock/details');
    };

    // 옵션 주문 수량 변경
    const handleOptionQuantityChange = (optionNo: string, value: number) => {
        setOptionOrderQuantities(prev => ({
            ...prev,
            [optionNo]: value
        }));
    };

    // 옵션 주문 처리
    const handleOptionOrder = () => {
        const orderedItems = Object.entries(optionOrderQuantities).filter(([_, quantity]) => quantity > 0);
        
        if (orderedItems.length === 0) {
            alert('주문할 수량을 입력해주세요.');
            return;
        }

        const currentDate = new Date().toISOString().split('T')[0];

        // 주문 처리 로직...
        setOptionOrderQuantities({});
        alert('옵션 주문이 완료되었습니다.');
        navigate('/stock/details');
    };

    // 검색 버튼 클릭 핸들러
    const handleSearch = () => {
        setAppliedSearchTerm(searchTerm);
    };

    // Enter 키 입력 시 검색 실행
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    // 필터링된 데이터
    const filteredData = useMemo(() => {
        if (!appliedSearchTerm) return stockData;

        return stockData.filter(item => {
            const searchLower = appliedSearchTerm.toLowerCase();

            if (searchCategory === '전체') {
                return (
                    item.menuNo.toString().includes(searchLower) ||
                    item.menuName.toLowerCase().includes(searchLower) ||
                    item.orderDate.toLowerCase().includes(searchLower)
                );
            }

            switch (searchCategory) {
                case '메뉴 번호':
                    return item.menuNo.toString().includes(searchLower);
                case '메뉴 이름':
                    return item.menuName.toLowerCase().includes(searchLower);
                case '결제 날짜':
                    return item.orderDate.toLowerCase().includes(searchLower);
                default:
                    return true;
            }
        });
    }, [appliedSearchTerm, searchCategory, stockData]);

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

                {activeTab === 'menu' ? (
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
                ) : (
                    <div className="search-section">
                        <div className="search-box">
                            <select 
                                className="menu-select"
                                value={searchCategory}
                                onChange={(e) => setSearchCategory(e.target.value)}
                            >
                                <option>전체</option>
                                <option>옵션 번호</option>
                                <option>옵션 이름</option>
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
                )}
            </div>

            {activeTab === 'menu' ? (
                <>
                    <table className='order-table'>
                        <thead>
                            <tr>
                                <th>메뉴 번호</th>
                                <th>메뉴 이름</th>
                                <th>현재 수량</th>
                                <th>주문 수량</th>
                                <th>결제 금액</th>
                                <th>결제 날짜</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.menuNo}</td>
                                    <td>{item.menuName}</td>
                                    <td>{item.stockQuantity}</td>
                                    <td>
                                        <input 
                                            className="stock-modify" 
                                            type="number" 
                                            min={0}
                                            value={orderQuantities[item.menuNo.toString()] || ''}
                                            onChange={(e) => handleQuantityChange(item.menuNo.toString(), parseInt(e.target.value) || 0)}
                                        />
                                    </td>
                                    <td>{orderQuantities[item.menuNo.toString()] ? `${orderQuantities[item.menuNo.toString()] * 1000}원` : '0원'}</td>
                                    <td>{item.orderDate}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="button-container">
                        <button className="order-button" onClick={handleOrder}>메뉴 재고 주문</button>
                    </div>
                </>
            ) : (
                <>
                    <table className='order-table'>
                        <thead>
                            <tr>
                                <th>옵션 번호</th>
                                <th>옵션 이름</th>
                                <th>현재 수량</th>
                                <th>주문 수량</th>
                                <th>결제 금액</th>
                                <th>결제 날짜</th>
                            </tr>
                        </thead>
                        <tbody>
                            {initialOptionData.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.optionNo}</td>
                                    <td>{item.optionName}</td>
                                    <td>{item.stockQuantity}</td>
                                    <td>
                                        <input 
                                            className="stock-modify" 
                                            type="number" 
                                            min={0}
                                            value={optionOrderQuantities[item.optionNo] || ''}
                                            onChange={(e) => handleOptionQuantityChange(item.optionNo, parseInt(e.target.value) || 0)}
                                        />
                                    </td>
                                    <td>{optionOrderQuantities[item.optionNo] ? `${optionOrderQuantities[item.optionNo] * 500}원` : '0원'}</td>
                                    <td>{item.orderDate}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="button-container">
                        <button className="order-button" onClick={handleOptionOrder}>옵션 재고 주문</button>
                    </div>
                </>
            )}
        </div>
    );
};

export default StockOrder;