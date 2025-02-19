import React, { useMemo, useState } from 'react';
import { useNavigate, useLocation} from 'react-router-dom';
import '../../style/OrderDetails.css';

const OrderDetails: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchCategory, setSearchCategory] = useState('전체');
    const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('2025-01-01');
    const [endDate, setEndDate] = useState('2025-02-06');
    const [appliedDateRange, setAppliedDateRange] = useState({ start: startDate, end: endDate });
    const navigate = useNavigate();
    const location = useLocation();

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
                <div className="content-header">주문 내역</div>
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
                            <option>결제 금액</option>
                        </select>
                        <input 
                            type="text" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="검색어를 입력하세요"
                        />
                        <button onClick={handleSearch}>검색</button>
                    </div>
                </div>
            </div>

            <table className='details-table'>
                <thead>
                    <tr>
                        <th>주문 번호</th>
                        <th>테이블 번호</th>
                        <th>주문 메뉴</th>
                        <th>메뉴 수</th>
                        <th>옵션</th>
                        <th>옵션 수</th>
                        <th>결제 금액</th>
                        <th>주문 시간</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>A001</td>
                        <td>T001</td>
                        <td>라면</td>
                        <td>2</td>
                        <td>계란</td>
                        <td>1</td>
                        <td>4,000원</td>
                        <td>2025-02-05 14:22</td>
                    </tr>
                    <tr>
                        <td>A002</td>
                        <td>T001</td>
                        <td>진로</td>
                        <td>5</td>
                        <td></td>
                        <td></td>
                        <td>2,100원</td>
                        <td>2025-02-05 14:20</td>
                    </tr>
                    <tr>
                        <td rowSpan={2}>A003</td>
                        <td rowSpan={2}>T002</td>
                        <td>김치찌개</td>
                        <td>1</td>
                        <td rowSpan={2}>라면사리</td>
                        <td rowSpan={2}>1</td>
                        <td rowSpan={2}>8,000원</td>
                        <td rowSpan={2}>2025-02-05 13:15</td>
                    </tr>
                    <tr>
                        <td>진로</td>
                        <td>4</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default OrderDetails;
