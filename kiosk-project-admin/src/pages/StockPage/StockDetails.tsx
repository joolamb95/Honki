import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../style/StockDetails.css';
import axios from 'axios';
import StockOrder from './StockOrder';

type OrderStatus = 'postpone' | 'completed'

interface StockOrderItem {
    orderId: number;
    menuNo: number;
    menuName: string;
    orderQuantity: number;
    orderAmount: number;
    orderDate: string;
    status: OrderStatus;
}

interface StockHistoryItem {
    orderId: number;
    orderDate: string;
    menuNo: number;
    menuName: string;
    stockQuantity: number;
    orderQuantity: number;
    orderAmount: number;
    status: string;
}

const StockDetails: React.FC = () => {
    const [postponeOrders, setPostponeOrders] = useState<StockOrderItem[]>([]);
    const [orderHistory, setOrderHistory] = useState<StockHistoryItem[]>([]);
    const [startDate, setStartDate] = useState('2025-01-01');
    const [endDate, setEndDate] = useState('2025-12-31');
    const [activeTab, setActiveTab] = useState<'postpone' | 'completed'>('postpone')
    const [searchTerm, setSearchTerm] = useState('');
    const [searchCategory, setSearchCategory] = useState('전체');

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        fetchPostponeOrders();
        fetchOrderHistory();
    }, []);

    const fetchPostponeOrders = async () => {
        try {
            const response = await axios.get<StockOrderItem[]>('http://localhost:8080/honki/stock/postpone');
            setPostponeOrders(response.data);
        } catch(error){
            console.error('대기 중인 주문 조회 실패', error);
            setPostponeOrders([]);
        }
    };

    const fetchOrderHistory = async () => {
        try {
            const response = await axios.get<StockHistoryItem[]>('http://localhost:8080/honki/stock/history');
            setOrderHistory(response.data);
        } catch (error) {
            console.error('주문 내역 조회 실패:' , error);
            setOrderHistory([]);
        }
    };

    const handleApproveOrder = async (orderId: number) => {
        try {
            await axios.post(`http://localhost:8080/honki/stock/orders/${orderId}/approve`);
            alert('주문이 승인되었습니다.');
            fetchPostponeOrders();
            fetchOrderHistory();
        } catch (error) {
            console.error('주문 승인 실패:', error);
            alert('주문 승인에 실패했습니다.');
        }
    };

    const handleCancelOrder = async (orderId: number) => {
        try {
            await axios.post(`http://localhost:8080/honki/stock/orders/${orderId}/cancel`);
            fetchPostponeOrders(); // 목록 새로고침
        } catch (error) {
            console.error('주문 취소 실패', error);
        }
    };

    const handleSearch = () => {
        // 검색 로직은 filteredData에서 처리됨
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const filteredData = useMemo(() => {
        const data = activeTab === 'postpone' ? postponeOrders : orderHistory;
        return data.filter(item => {
            const itemDate = new Date(item.orderDate);
            const startDateTime = new Date(startDate);
            const endDateTime = new Date(endDate);
            
            if (itemDate < startDateTime || itemDate > endDateTime) return false;
            if (!searchTerm) return true;

            const searchLower = searchTerm.toLowerCase();
            const itemId = activeTab === 'postpone' ? 
                (item as StockOrderItem).orderId : 
                (item as StockHistoryItem).orderId;

            switch (searchCategory) {
                case '전체':
                    return String(itemId).includes(searchLower) ||
                           String(item.menuNo).includes(searchLower) ||
                           item.menuName.toLowerCase().includes(searchLower);
                case '발주 번호':
                    return String(itemId).includes(searchLower);
                case '메뉴 번호':
                    return String(item.menuNo).includes(searchLower);
                case '메뉴 이름':
                    return item.menuName.toLowerCase().includes(searchLower);
                case '결제 금액':
                    return String(item.orderAmount).includes(searchLower);
                default:
                    return true;
            }
        });
    }, [activeTab, postponeOrders, orderHistory, searchTerm, searchCategory, startDate, endDate]);



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
                    <th>{activeTab === 'postpone' ? '주문 번호' : '내역 번호'}</th>
                        <th>결제 날짜</th>
                        <th>메뉴 번호</th>
                        <th>메뉴 이름</th>
                        <th>수량</th>
                        <th>재고 수정</th>
                        <th>결제 금액</th>
                        {activeTab === 'postpone' && <th>최종승인</th>}
                    </tr>
                </thead>
                <tbody>
                    {filteredData.map((item) => (
                        <tr key={activeTab === 'postpone' ? 
                            (item as StockOrderItem).orderId : 
                            (item as StockHistoryItem).orderId}
                        >
                            <td>{activeTab === 'postpone' ? 
                                `O${String((item as StockOrderItem).orderId).padStart(3, '0')}` : 
                                `H${String((item as StockHistoryItem).orderId).padStart(3, '0')}`}
                            </td>
                            <td>{new Date(item.orderDate).toLocaleDateString()}</td>
                            <td>{item.menuNo}</td>
                            <td>{item.menuName}</td>
                            <td>{item.orderQuantity}</td>
                            <td>{activeTab === 'postpone' ? 
                                (item as StockOrderItem).orderQuantity : 
                                (item as StockHistoryItem).stockQuantity}
                            </td>
                            <td>{`${item.orderAmount?.toLocaleString() || 0}원`}</td>
                            {activeTab === 'postpone' && (
                                <td>
                                    <div className='button-menu'>
                                        <button 
                                            onClick={() => handleApproveOrder((item as StockOrderItem).orderId)}
                                            className="approve-button"
                                        >
                                            승인
                                        </button>
                                        <button 
                                            onClick={() => handleCancelOrder((item as StockOrderItem).orderId)}
                                            className="cancel-button2"
                                        >
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