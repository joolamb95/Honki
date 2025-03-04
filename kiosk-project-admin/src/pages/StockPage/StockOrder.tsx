import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import '../../style/StockOrder.css';

interface StockItem {
    menuNo: number;
    menuName: string;
    stockQuantity: number;
    stockLastUpdate: string;
    stockStatus: string;
    stockType: 'M' | 'O';
}

interface MenuOption {
    optionNo: number;
    optionName: string;
    optionPrice: number;
    categoryNo: number;
    stockQuantity: number;
}

interface OrderQuantity {
    [key: number]: number;
}

interface OrderData {
    itemNo: number;
    itemType: 'M' | 'O';
    orderQuantity: number;
    orderAmount: number;
}

interface StockOption {
    optionNo: number;
    optionName: string;
    stockOptionQuantity: number;
    stockOptionStatus: string;
    stockOptionLastUpdate: string;
}

const StockOrder: React.FC = () => {
    const [stocks, setStocks] = useState<StockItem[]>([]);
    const [options, setOptions] = useState<StockOption[]>([]);
    const [orderType, setOrderType] = useState<'menu' | 'option'>('menu');
    const [searchTerm, setSearchTerm] = useState('');
    const [searchCategory, setSearchCategory] = useState('전체');
    const [menuOrderQuantities, setMenuOrderQuantities] = useState<OrderQuantity>({});
    const [optionOrderQuantities, setOptionOrderQuantities] = useState<OrderQuantity>({});
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [quantity, setQuantity] = useState(1);
    const [isOption, setIsOption] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (orderType === 'menu') {
            fetchStocks();
        } else {
            fetchStockOptions();
        }
    }, [orderType]);

    const fetchStocks = async () => {
        try {
            const response = await axios.get<StockItem[]>('http://localhost:8080/honki/stock');
            setStocks(response.data);
        } catch (error) {
            console.error('재고 조회 실패:', error);
            setStocks([]);
        }
    };

    const fetchStockOptions = async () => {
        try {
            const response = await axios.get<StockOption[]>('http://localhost:8080/honki/stock/options');
            if (Array.isArray(response.data)) {
                setOptions(response.data);
            } else {
                console.error('옵션 재고 데이터가 배열 형식이 아닙니다:', response.data);
                setOptions([]);
            }
        } catch (error) {
            console.error('옵션 재고 목록 조회 실패:', error);
            setOptions([]);
        }
    };

    const handleQuantityChange = (id: number, value: number) => {
        if (orderType === 'menu') {
            setMenuOrderQuantities(prev => ({
                ...prev,
                [id]: value
            }));
        } else {
            setOptionOrderQuantities(prev => ({
                ...prev,
                [id]: value
            }));
        }
    };

    const handleOrder = async () => {
        const orderedItems = orderType === 'menu' 
            ? Object.entries(menuOrderQuantities).filter(([_, qty]) => qty > 0)
            : Object.entries(optionOrderQuantities).filter(([_, qty]) => qty > 0);

        if (orderedItems.length === 0) {
            alert('주문할 수량을 입력해주세요.');
            return;
        }

        try {
            for (const [itemNo, quantity] of orderedItems) {
                const orderData = {
                    itemNo: parseInt(itemNo),
                    itemType: orderType === 'menu' ? 'M' : 'O',
                    orderQuantity: quantity,
                    orderAmount: quantity * 1000
                };
                await axios.post('http://localhost:8080/honki/stock/order', orderData);
            }
            alert('재고 주문이 완료되었습니다.');
            
            // 주문 완료 후 수량 초기화
            if (orderType === 'menu') {
                setMenuOrderQuantities({});
            } else {
                setOptionOrderQuantities({});
            }
            
            navigate('/stock/details');
        } catch (error) {
            console.error('주문 실패:', error);
            alert('주문에 실패했습니다.');
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

    // 메뉴 필터링
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

    // 옵션 필터링
    const filteredOptions = useMemo(() => {
        if (!Array.isArray(options)) return [];
        
        return options.filter(option => {
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
    }, [options, searchTerm, searchCategory]);

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
                        className={`tab-button ${orderType === 'menu' ? 'active' : ''}`}
                        onClick={() => setOrderType('menu')}
                    >
                        메뉴 재고주문
                    </button>
                    <button 
                        className={`tab-button ${orderType === 'option' ? 'active' : ''}`}
                        onClick={() => setOrderType('option')}
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
                            {orderType === 'menu' ? (
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
                        <th>{orderType === 'menu' ? '메뉴 번호' : '옵션 번호'}</th>
                        <th>{orderType === 'menu' ? '메뉴 이름' : '옵션 이름'}</th>
                        <th>현재 수량</th>
                        <th>주문 수량</th>
                        <th>주문 금액</th>
                    </tr>
                </thead>
                <tbody>
                    {orderType === 'menu' ? (
                        filteredStocks.map((stock) => (
                            <tr key={stock.menuNo}>
                                <td>M{stock.menuNo}</td>
                                <td>{stock.menuName}</td>
                                <td>{stock.stockQuantity}</td>
                                <td>
                                    <input 
                                        type="number"
                                        min={0}
                                        value={menuOrderQuantities[stock.menuNo] || ''}
                                        onChange={(e) => handleQuantityChange(stock.menuNo, parseInt(e.target.value) || 0)}
                                    />
                                </td>
                                <td>{menuOrderQuantities[stock.menuNo] ? `${(menuOrderQuantities[stock.menuNo] * 1000).toLocaleString()}원` : '0원'}</td>
                            </tr>
                        ))
                    ) : (
                        filteredOptions.map((option) => (
                            <tr key={option.optionNo}>
                                <td>O{option.optionNo}</td>
                                <td>{option.optionName}</td>
                                <td>{option.stockOptionQuantity}</td>
                                <td>
                                    <input 
                                        type="number"
                                        min={0}
                                        value={optionOrderQuantities[option.optionNo] || ''}
                                        onChange={(e) => handleQuantityChange(option.optionNo, parseInt(e.target.value) || 0)}
                                    />
                                </td>
                                <td>{optionOrderQuantities[option.optionNo] ? `${(optionOrderQuantities[option.optionNo] * 1000).toLocaleString()}원` : '0원'}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
            
            <div className="button-container">
                <button className="order-button" onClick={handleOrder}>
                    주문
                </button>
            </div>
        </div>
    );
};

export default StockOrder;