import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../../style/StockManagement.css';

interface Stock {
    menuNo: number;
    menuName: string;
    stockQuantity: number;
    stockStatus: string;
    stockLastUpdate: string;
}

interface StockOption {
    optionNo: number;
    optionName: string;
    stockOptionQuantity: number;
    stockOptionStatus: string;
    stockOptionLastUpdate: string;
}

const StockManagement: React.FC = () => {
    const [stocks, setStocks] = useState<Stock[]>([]);
    const [stockOptions, setStockOptions] = useState<StockOption[]>([]);
    const [activeTab, setActiveTab] = useState('menu'); // 'menu' 또는 'option'
    const [searchTerm, setSearchTerm] = useState('');
    const [searchCategory, setSearchCategory] = useState('전체');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        fetchStocks();
        fetchStockOptions();
    }, []);

    const fetchStocks = async () => {
        try {
            const response = await axios.get('http://localhost:8080/honki/stock');
            if (Array.isArray(response.data)) {
                setStocks(response.data);
            } else {
                console.error('재고 데이터가 배열 형식이 아닙니다:', response.data);
                setStocks([]);
            }
        } catch (error) {
            console.error('재고 목록 조회 실패:', error);
            setStocks([]);
        }
    };

    const fetchStockOptions = async () => {
        try {
            const response = await axios.get('http://localhost:8080/honki/stock/options');
            if (Array.isArray(response.data)) {
                setStockOptions(response.data);
            } else {
                console.error('옵션 재고 데이터가 배열 형식이 아닙니다:', response.data);
                setStockOptions([]);
            }
        } catch (error) {
            console.error('옵션 재고 목록 조회 실패:', error);
            setStockOptions([]);
        }
    };

    const filteredStocks = useMemo(() => {
        if (!Array.isArray(stocks)) return [];
        
        return stocks.filter(stock => {
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
    }, [stocks, searchTerm, searchCategory]);

    const filteredStockOptions = useMemo(() => {
        if (!Array.isArray(stockOptions)) return [];
        
        return stockOptions.filter(option => {
            if (!searchTerm) return true;

            switch (searchCategory) {
                case '옵션 번호':
                    return option.optionNo.toString().includes(searchTerm);
                case '옵션 이름':
                    return option.optionName.toLowerCase().includes(searchTerm.toLowerCase());
                case '결제 날짜':
                    return option.stockOptionLastUpdate.includes(searchTerm);
                case '전체':
                    return (
                        option.optionNo.toString().includes(searchTerm) ||
                        option.optionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        option.stockOptionLastUpdate.includes(searchTerm)
                    );
                default:
                    return true;
            }
        });
    }, [stockOptions, searchTerm, searchCategory]);

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
                <div className="stock-tabs">
                    <button 
                        className={`tab-button ${activeTab === 'menu' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('menu')}
                    >
                        메뉴 재고
                    </button>
                    <button 
                        className={`tab-button ${activeTab === 'option' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('option')}
                    >
                        옵션 재고
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
                            {activeTab === 'menu' ? (
                                <>
                                    <option>메뉴 번호</option>
                                    <option>메뉴 이름</option>
                                </>
                            ) : (
                                <>
                                    <option>옵션 번호</option>
                                    <option>옵션 이름</option>
                                </>
                            )}
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

            {activeTab === 'menu' ? (
                <table className='stock-table'>
                    <thead>
                        <tr>
                            <th>번호</th>
                            <th>이름</th>
                            <th>수량</th>
                            <th>마지막 결제 날짜</th>
                            <th>상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStocks.map((stock) => (
                            <tr key={`${stock.menuNo}`}>
                                <td>{stock.menuNo}</td>
                                <td>{stock.menuName}</td>
                                <td>{stock.stockQuantity}</td>
                                <td>{stock.stockLastUpdate}</td>
                                <td>{stock.stockStatus || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <table className='stock-table'>
                    <thead>
                        <tr>
                            <th>옵션 번호</th>
                            <th>옵션 이름</th>
                            <th>재고 수량</th>
                            <th>상태</th>
                            <th>최종 수정일</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStockOptions.map((option) => (
                            <tr key={option.optionNo}>
                                <td>{option.optionNo}</td>
                                <td>{option.optionName}</td>
                                <td>{option.stockOptionQuantity}</td>
                                <td>{option.stockOptionStatus || '-'}</td>
                                <td>{option.stockOptionLastUpdate}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default StockManagement;
