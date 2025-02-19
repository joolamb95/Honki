import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../style/StockManagement.css';

interface StockItem {
    menuNo: string;
    menuName: string;
    quantity: number;
    paymentDate: string;
    status: string;
}

const StockManagement: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchCategory, setSearchCategory] = useState('전체');
    const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    // 초기 재고 데이터
    const initialStockData: StockItem[] = [
        { menuNo: 'M001', menuName: '라면', quantity: 50, paymentDate: '2025-02-05', status: '배송중' },
        { menuNo: 'M002', menuName: '김치찌개', quantity: 80, paymentDate: '-', status: '-' },
        { menuNo: 'M003', menuName: '계란말이', quantity: 50, paymentDate: '-', status: '-' },
        { menuNo: 'M004', menuName: '진로', quantity: 200, paymentDate: '2025-01-29', status: '-' },
    ];

    // localStorage에서 재고 데이터 가져오기
    const savedStockData = localStorage.getItem('stockManagement');
    const stockData: StockItem[] = savedStockData ? JSON.parse(savedStockData) : initialStockData;

    // 처음 로드될 때 초기 데이터 저장
    React.useEffect(() => {
        if (!savedStockData) {
            localStorage.setItem('stockManagement', JSON.stringify(initialStockData));
        }
    }, [savedStockData]);

    // 검색 버튼 클릭 핸들러
    const handleSearch = () => {
        setAppliedSearchTerm(searchTerm);
    };

    // 필터링된 데이터
    const filteredData = useMemo(() => {
        if (!appliedSearchTerm) return stockData;

        return stockData.filter((item: StockItem) => {
            const searchLower = appliedSearchTerm.toLowerCase();

            if (searchCategory === '전체') {
                return (
                    item.menuNo.toLowerCase().includes(searchLower) ||
                    item.menuName.toLowerCase().includes(searchLower) ||
                    item.paymentDate.toLowerCase().includes(searchLower)
                );
            }

            switch (searchCategory) {
                case '메뉴 번호':
                    return item.menuNo.toLowerCase().includes(searchLower);
                case '메뉴 이름':
                    return item.menuName.toLowerCase().includes(searchLower);
                case '결제 날짜':
                    return item.paymentDate.toLowerCase().includes(searchLower);
                default:
                    return true;
            }
        });
    }, [appliedSearchTerm, searchCategory, stockData]);

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
                <div className="content-header">재고 관리</div>
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

            <table className='stock-table'>
                <thead>
                    <tr>
                        <th>메뉴 번호</th>
                        <th>메뉴 이름</th>
                        <th>수량</th>
                        <th>마지막 결제 날짜</th>
                        <th>상태</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredData.map((item: StockItem, index: number) => (
                        <tr key={index}>
                            <td>{item.menuNo}</td>
                            <td>{item.menuName}</td>
                            <td>{item.quantity}</td>
                            <td>{item.paymentDate}</td>
                            <td>{item.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default StockManagement;
