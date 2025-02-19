import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../style/StockDetails.css';

interface StockItem {
    orderNo: string;
    orderDate: string;
    menuNo: string;
    menuName: string;
    quantity: number;
    stockModify: number;
    price: string;
}

interface StockOrderHistory {
    orderNo: string;
    orderDate: string;
    menuNo: string;
    menuName: string;
    quantity: number;
    stockModify: number;
    price: string;
}

const StockDetails: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchCategory, setSearchCategory] = useState('전체');
    const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('2025-01-01');
    const [endDate, setEndDate] = useState('2025-02-06');
    const [appliedDateRange, setAppliedDateRange] = useState({ start: startDate, end: endDate });
    const navigate = useNavigate();
    const location = useLocation();

    // 재고 데이터
    const stockData: StockItem[] = [
        { orderNo: 'O002', orderDate: '2025-02-05', menuNo: 'M001', menuName: '라면', quantity: 50, stockModify: 2, price: '50,000원' },
        { orderNo: 'O001', orderDate: '2025-01-29', menuNo: 'M004', menuName: '진로', quantity: 100, stockModify: 100, price: '107,000원' },
    ];

    // 로컬 스토리지에서 주문 내역 가져오기
    const orderHistory: StockOrderHistory[] = JSON.parse(localStorage.getItem('orderHistory') || '[]').map((item: any) => {
        try {
            return {
                orderNo: `O${String(item.orderId).padStart(3, '0')}`,
                orderDate: item.orderDate || '',
                menuNo: item.menuNo || '',
                menuName: item.menuName || '',
                quantity: item.orderQuantity || 0,
                stockModify: item.orderQuantity || 0,
                price: item.orderAmount ? `${item.orderAmount.toLocaleString()}원` : '0원'
            };
        } catch (error) {
            console.error('Error processing order history item:', error);
            return {
                orderNo: 'O000',
                orderDate: '',
                menuNo: '',
                menuName: '',
                quantity: 0,
                stockModify: 0,
                price: '0원'
            };
        }
    });

    // 검색 버튼 클릭 핸들러
    const handleSearch = () => {
        setAppliedSearchTerm(searchTerm);
        setAppliedDateRange({ start: startDate, end: endDate });
    };

    // Enter 키 입력 시 검색 실행
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    // 필터링된 데이터
    const filteredData = useMemo(() => {
        // 기존 데이터와 주문 내역 합치기
        const allData = [...stockData, ...orderHistory];
        
        return allData.filter(item => {
            // 날짜 범위 체크
            const itemDate = new Date(item.orderDate);
            const startDateTime = new Date(appliedDateRange.start);
            const endDateTime = new Date(appliedDateRange.end);
            const isInDateRange = itemDate >= startDateTime && itemDate <= endDateTime;

            if (!isInDateRange) return false;

            if (!appliedSearchTerm) return true;

            const searchLower = appliedSearchTerm.toLowerCase();

            if (searchCategory === '전체') {
                return (
                    item.orderNo.toLowerCase().includes(searchLower) ||
                    item.menuNo.toLowerCase().includes(searchLower) ||
                    item.menuName.toLowerCase().includes(searchLower) ||
                    item.price.toLowerCase().includes(searchLower)
                );
            }

            switch (searchCategory) {
                case '발주 번호':
                    return item.orderNo.toLowerCase().includes(searchLower);
                case '메뉴 번호':
                    return item.menuNo.toLowerCase().includes(searchLower);
                case '메뉴 이름':
                    return item.menuName.toLowerCase().includes(searchLower);
                case '결제 금액':
                    return item.price.toLowerCase().includes(searchLower);
                default:
                    return true;
            }
        });
    }, [appliedSearchTerm, searchCategory, appliedDateRange, orderHistory, stockData]);

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
                <div className="content-header">재고 내역</div>
                <div className="date-section">
                    <div className="date-label">결제 날짜</div>
                    <div className="date-inputs">
                        <input 
                            type="date" 
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                        <span>~</span>
                        <input 
                            type="date" 
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                </div>
                
                <div className="search-section">
                    <div className="search-box">
                        <select 
                            className="menu-select"
                            value={searchCategory}
                            onChange={(e) => setSearchCategory(e.target.value)}
                        >
                            <option>전체</option>
                            <option>발주 번호</option>
                            <option>메뉴 번호</option>
                            <option>메뉴 이름</option>
                            <option>결제 금액</option>
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

            <table className='stock-details-table'>
                <thead>
                    <tr>
                        <th>발주 번호</th>
                        <th>결제 날짜</th>
                        <th>메뉴 번호</th>
                        <th>메뉴 이름</th>
                        <th>수량</th>
                        <th>재고 수정</th>
                        <th>결제 금액</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredData.map((item, index) => (
                        <tr key={index}>
                            <td>{item.orderNo}</td>
                            <td>{item.orderDate}</td>
                            <td>{item.menuNo}</td>
                            <td>{item.menuName}</td>
                            <td>{item.quantity}</td>
                            <td>{item.stockModify}</td>
                            <td>{item.price}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default StockDetails;