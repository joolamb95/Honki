import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../../style/OrderDetails.css';

interface OrderDetail {
    orderNo: number;        // number로 변경
    tableNo: number;        // number로 변경
    menuName: string;
    totalAmount: number;         // menuQuantity 대신 amount 사용
    optionName: string;     // null 허용 제거 (백엔드에서 '-' 처리)
    price: number;          // totalPrice 대신 price 사용
    orderDate: string;
}

const OrderDetails: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchCategory, setSearchCategory] = useState('전체');
    const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('2025-02-01T00:00');
    const [endDate, setEndDate] = useState('2025-02-28T23:59');
    const [appliedDateRange, setAppliedDateRange] = useState({ start: startDate, end: endDate });
    const [orders, setOrders] = useState<OrderDetail[]>([]);
    const navigate = useNavigate();
    const location = useLocation();

    // 주문 내역 조회
    const fetchOrders = async () => {
        try {
            // 날짜에서 시간 부분을 제외하고 날짜만 전송
            const formattedStartDate = appliedDateRange.start.split('T')[0];
            const formattedEndDate = appliedDateRange.end.split('T')[0];
            
            const params = {
                startDate: formattedStartDate,
                endDate: formattedEndDate,
                searchCategory: searchCategory === '전체' ? null : searchCategory,
                searchTerm: appliedSearchTerm || null
            };

            // null이나 undefined인 파라미터는 제외
            const cleanParams = Object.fromEntries(
                Object.entries(params).filter(([_, value]) => value != null)
            );

            console.log('요청 파라미터:', cleanParams);
            
            const response = await axios.get('http://localhost:8080/honki/menu/orders/list', {
                params: cleanParams
            });
            
            console.log('응답 데이터:', response.data);
            setOrders(response.data);
        } catch (error) {
            console.error('주문 내역 조회 실패:', error);
        }
    };

    // 컴포넌트 마운트 시 주문 내역 조회
    useEffect(() => {
        // 최초 데이터 로드
        fetchOrders();

        // 1분마다 데이터 갱신
        const intervalId = setInterval(() => {
            fetchOrders();
        }, 60000); 

        // 컴포넌트 언마운트 시 인터벌 정리
        return () => clearInterval(intervalId);
    }, [appliedDateRange, appliedSearchTerm]);

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const orderDate = new Date(order.orderDate);
            const start = new Date(startDate);
            const end = new Date(endDate);
            
            // 날짜 범위 필터링
            const isInDateRange = orderDate >= start && orderDate <= end;
            
            // 검색어 필터링
            let matchesSearch = true;
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                switch (searchCategory) {
                    case '주문 번호':
                        matchesSearch = order.orderNo.toString().includes(term);
                        break;
                    case '테이블 번호':
                        matchesSearch = order.tableNo.toString().includes(term);
                        break;
                    case '메뉴 이름':
                        matchesSearch = order.menuName.toLowerCase().includes(term);
                        break;
                    default:
                        matchesSearch = 
                            order.orderNo.toString().includes(term) ||
                            order.tableNo.toString().includes(term) ||
                            order.menuName.toLowerCase().includes(term);
                }
            }

            return isInDateRange && matchesSearch;
        });
    }, [orders, startDate, endDate, searchTerm, searchCategory]);

    return (
        <div className="stock-management">
            <div className="stock-nav">
                <button 
                    className={location.pathname === '/stock/addMenu' ? 'active' : ''}
                    onClick={() => navigate('/stock/addMenu')}
                >
                    메뉴 관리
                </button>
                <button 
                    className={location.pathname === '/stock/addOption' ? 'active' : ''}
                    onClick={() => navigate('/stock/addOption')}
                >
                    옵션 관리
                </button>
                <button 
                    className={location.pathname === '/stock/orderDetails' ? 'active' : ''}
                    onClick={() => navigate('/stock/orderDetails')}
                >
                    주문 내역
                </button>
            </div>

            <div className="content-wrapper">
                <div className="content-header">
                    주문 내역  
                    (검색된 주문 수: <strong>{filteredOrders.length}</strong> 개)
                </div>

                <div className="date-section">
                    <div className="date-label">주문 시간</div>
                    <div className="date-inputs">
                        <input 
                            type="datetime-local" 
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                        <span>~</span>
                        <input 
                            type="datetime-local" 
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
                            <option>주문 번호</option>
                            <option>테이블 번호</option>
                            <option>메뉴 이름</option>
                        </select>
                        <input 
                            type="text" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="검색어를 입력하세요"
                        />
                    </div>
                </div>
            </div>
            
            <div className='orders-table-container'>
                <table className='orders-table'>
                    <thead>
                        <tr>
                            <th>주문 번호</th>
                            <th>테이블 번호</th>
                            <th>주문 메뉴</th>
                            <th>메뉴 수</th>
                            <th>옵션</th>
                            <th>결제 금액</th>
                            <th>주문 시간</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.map((order, index) => (
                            <tr key={`${order.orderNo}-${index}`}>
                                <td>{order.orderNo}</td>
                                <td>{order.tableNo}</td>
                                <td>{order.menuName}</td>
                                <td>{order.totalAmount}</td>
                                <td>{order.optionName}</td>
                                <td>{order.price.toLocaleString()}원</td>
                                <td>{order.orderDate}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OrderDetails;