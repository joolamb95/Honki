import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../style/StockDetails.css';
import axios from 'axios';
import StockOrder from './StockOrder';


interface StockOrder {
    orderId: number;
    itemNo: number;
    itemType: 'M' | 'O';
    itemName: string;
    orderQuantity: number;
    orderAmount: number;
    orderDate: string;
    status: string;
}

const StockDetails: React.FC = () => {
    const [orders, setOrders] = useState<StockOrder[]>([]);
    const [startDate, setStartDate] = useState('2025-01-01');
    const [endDate, setEndDate] = useState('2025-12-31');
    const [activeTab, setActiveTab] = useState<'postpone' | 'completed'>('postpone')
    const [searchTerm, setSearchTerm] = useState('');
    const [searchCategory, setSearchCategory] = useState('전체');

    const navigate = useNavigate();

    const location = useLocation();

    useEffect(() => {
        if (activeTab === 'postpone') {
            fetchPostponeOrders();
        } else {
            fetchOrderHistory();
        }
    }, [activeTab]);

    const fetchPostponeOrders = async () => {
        try {
            const response = await axios.get<StockOrder[]>('http://localhost:8080/honki/stock/postpone');
            if (Array.isArray(response.data)) {
                setOrders(response.data);
            } else {
                console.error('주문 데이터가 배열 형식이 아닙니다:', response.data);
                setOrders([]);
            }
        } catch (error) {
            console.error('대기 중인 주문 조회 실패:', error);
            setOrders([]);
        }
    };

    const fetchOrderHistory = async () => {
        try {
            const response = await axios.get<StockOrder[]>('http://localhost:8080/honki/stock/history');
            if (Array.isArray(response.data)) {
                setOrders(response.data);
            } else {
                console.error('주문 내역 데이터가 배열 형식이 아닙니다:', response.data);
                setOrders([]);
            }
        } catch (error) {
            console.error('주문 내역 조회 실패:', error);
            setOrders([]);
        }
    };

    const handleApproveOrder = async (orderId: number) => {
        try {
            await axios.post(`http://localhost:8080/honki/stock/orders/${orderId}/approve`);
            alert('주문이 승인되었습니다.');
            fetchPostponeOrders();
        } catch (error) {
            console.error('주문 승인 실패:', error);
            alert('주문 승인에 실패했습니다.');
        }
    };

    const handleCancelOrder = async (orderId: number) => {
        try {
            await axios.post(`http://localhost:8080/honki/stock/orders/${orderId}/cancel`);
            alert('주문이 취소되었습니다.');
            fetchPostponeOrders();
        } catch (error) {
            console.error('주문 취소 실패:', error);
            alert('주문 취소에 실패했습니다.');
        }
    };


    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            // order가 null이거나 undefined인 경우 필터링에서 제외
            if (!order) return false;

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
                    case '발주 번호':
                        matchesSearch = order.orderId?.toString().includes(term) || false;
                        break;
                    case '품목 번호':
                        matchesSearch = order.itemNo?.toString().includes(term) || false;
                        break;
                    case '품목 이름':
                        matchesSearch = order.itemName?.toLowerCase().includes(term) || false;
                        break;
                    default:
                        matchesSearch = 
                            (order.orderId?.toString().includes(term) || false) ||
                            (order.itemNo?.toString().includes(term) || false) ||
                            (order.itemName?.toLowerCase().includes(term) || false);
                }
            }

            return isInDateRange && matchesSearch;
        });
    }, [orders, startDate, endDate, searchTerm, searchCategory]);

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
                <div className="order-tabs">
                    <button 
                        className={`tab-button ${activeTab === 'postpone' ? 'active' : ''}`}
                        onClick={() => setActiveTab('postpone')}
                    >
                        대기 중인 주문
                    </button>
                    <button 
                        className={`tab-button ${activeTab === 'completed' ? 'active' : ''}`}
                        onClick={() => setActiveTab('completed')}
                    >
                        완료된 주문
                    </button>
                </div>
                <div className="date-section">
                    <div className="date-label">주문 일자</div>
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
                            value={searchCategory}
                            onChange={(e) => setSearchCategory(e.target.value)}
                        >
                            <option>전체</option>
                            <option>발주 번호</option>
                            <option>품목 번호</option>
                            <option>품목 이름</option>
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

            <table className='stock-details-table'>
                <thead>
                    <tr>
                        <th>주문 번호</th>
                        <th>항목 번호</th>
                        <th>구분</th>
                        <th>항목명</th>
                        <th>수량</th>
                        <th>금액</th>
                        <th>주문일시</th>
                        <th>상태</th>
                        {activeTab === 'postpone' && <th>작업</th>}
                    </tr>
                </thead>
                <tbody>
                    {filteredOrders.map(order => (
                        <tr key={order.orderId}>
                            <td>{order.orderId}</td>
                            <td>{order.itemNo}</td>
                            <td>{order.itemType === 'M' ? '메뉴' : '옵션'}</td>
                            <td>{order.itemName}</td>
                            <td>{order.orderQuantity}</td>
                            <td>{order.orderAmount.toLocaleString()}원</td>
                            <td>{order.orderDate}</td>
                            <td>{order.status}</td>
                            {activeTab === 'postpone' && (
                                <td>
                                    <div className='button-menu'>
                                        <button className="approve-button" onClick={() => handleApproveOrder(order.orderId)}>
                                            승인
                                        </button>
                                        <button className="cancel-button2" onClick={() => handleCancelOrder(order.orderId)}>
                                            취소
                                        </button>
                                    </div>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default StockDetails;