import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../../style/StockManagement.css';

interface StockItem {
    menuNo: number;
    menuName: string;
    stockQuantity: number;
    stockLastUpdate: string;
    stockStatus: string;
}

const StockManagement: React.FC = () => {
    const [stocks, setStocks] = useState<StockItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchCategory, setSearchCategory] = useState('전체');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        fetchStocks();
    }, []);

    const fetchStocks = async () => {
        try {
            const response = await axios.get<StockItem[]>('http://localhost:8080/honki/stock', {
            });
            console.log('재고 목록:', response.data);
            setStocks(response.data);
        } catch (error) {
            console.error('재고 조회 실패:', error);
            setStocks([]);
        }
    };

    const filteredStocks = stocks.filter(stock => {
        if (!searchTerm) return true;

        switch (searchCategory) {
            case '메뉴 번호':
                return stock.menuNo.toString().includes(searchTerm);
            case '메뉴 이름':
                return stock.menuName.toLowerCase().includes(searchTerm.toLowerCase());
            case '결제 날짜':
                return stock.stockLastUpdate.includes(searchTerm);
            case '전체':
                return (
                    stock.menuNo.toString().includes(searchTerm) ||
                    stock.menuName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    stock.stockLastUpdate.includes(searchTerm)
                );
            default:
                return true;
        }
    });

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
                            placeholder="검색어를 입력하세요"
                        />
                        <button>검색</button>
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
                    {filteredStocks.map((stock) => (
                        <tr key={stock.menuNo}>
                            <td>{stock.menuNo}</td>
                            <td>{stock.menuName}</td>
                            <td>{stock.stockQuantity}</td>
                            <td>{stock.stockLastUpdate}</td>
                            <td>{stock.stockStatus || '-'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default StockManagement;
