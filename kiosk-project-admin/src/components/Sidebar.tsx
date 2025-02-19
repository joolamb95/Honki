import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaShoppingCart } from 'react-icons/fa';  // 홈 현황 아이콘
import { AiOutlineHome } from 'react-icons/ai';   // 재고 관리 아이콘
import { BsPerson } from 'react-icons/bs';        // 인사 관리 아이콘
import { MdBuild } from 'react-icons/md';         // 생산 관리 아이콘
import { BiDollar } from 'react-icons/bi';        // 재무 관리 아이콘
import '../style/Sidebar.css';

const Sidebar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isStockOpen, setIsStockOpen] = useState(false);
    const [isProductionOpen, setIsProductionOpen] = useState(false);
    const [isFinanceOpen, setIsFinance] = useState(false);
    const [isEmployeeOpen, setIsEmployeeOpen] = useState(false);

    const toggleStock = () => {
        setIsStockOpen(!isStockOpen);
        navigate('/stock/management');  // 재고관리 클릭 시 바로 이동
    };

    const toggleProduction = () => {
        setIsProductionOpen(!isProductionOpen);
    };

    const toggleFinance = ()=>{
        setIsFinance(!isFinanceOpen);
    };

    const toggleEmployee =() => {
        setIsEmployeeOpen(!isEmployeeOpen);
        navigate('/employee');
    }

    
// 현재 경로가 어떤 메인 메뉴에 속하는지 확인하는 함수
const isStockActive = location.pathname.includes('/stock') && !location.pathname.includes('/stock/addMenu') && !location.pathname.includes('/stock/orderDetails');
const isEmployeeActive = location.pathname.includes('/employee');
const isProductionActive = location.pathname.includes('/stock/addMenu') || location.pathname.includes('/stock/orderDetails');
const isFinanceActive = location.pathname.includes('/finance');

    return (
        <div className="sidebar">
            <button 
                className={location.pathname === '/' ? 'active' : ''} 
                onClick={() => navigate('/')}
            >
                <FaShoppingCart className="icon" />
                <span>홀 현황</span>
            </button>
            
            <div className="stock-menu">
                <button 
                    className={`stock-main ${isStockActive ? 'active' : ''}`}
                    onClick={toggleStock}
                >
                    <AiOutlineHome className="icon" />
                    <span>재고관리</span>
                </button>
                {isStockOpen && (
                    <div className="stock-submenu">
                        <button 
                            className={location.pathname === '/stock/order' ? 'sub-active' : ''}
                            onClick={() => navigate('/stock/order')}
                        >
                            <span>재고주문</span>
                        </button>
                        <button 
                            className={location.pathname === '/stock/details' ? 'sub-active' : ''}
                            onClick={() => navigate('/stock/details')}
                        >
                            <span>재고내역</span>
                        </button>
                    </div>
                )}
            </div>

            {/* 인사 관리 버튼 */}
            <div className="stock-menu">
                <button
                    className={`stock-main ${location.pathname === '/employee/management' ? 'active' : ''}`}
                    onClick={() => {
                        navigate('/employee/management'); // 인사 관리 메인 페이지로 이동
                        setIsEmployeeOpen(!isEmployeeOpen); // 하위 메뉴 토글
                      }}
                >
                    <BsPerson className="icon" />
                    <span>인사 관리</span>
                </button> 

                {isEmployeeOpen && (
                    <div className="stock-submenu">
                        <button
                            className={location.pathname === '/employee/payroll' ? 'sub-active' : ''}
                            onClick={() => navigate('/employee/payroll')}
                        >
                            <span>급여 관리</span>
                        </button>
                        <button
                            className={location.pathname === '/employee/attendance' ? 'sub-active' : ''}
                            onClick={() => navigate('/employee/attendance')}
                        >
                            <span>근태 관리</span>
                        </button>
                    </div>
                )}
            </div>

            <div className="stock-menu">
                <button 
                    className={`stock-main ${isProductionActive ? 'active' : ''}`}
                    onClick={toggleProduction}
                >
                    <MdBuild className="icon" />
                    <span>생산관리</span>
                </button>
                {isProductionOpen && (
                    <div className="stock-submenu">
                        <button 
                            className={location.pathname === '/stock/addMenu' ? 'sub-active' : ''}
                            onClick={() => navigate('/stock/addMenu')}
                        >
                            <span>메뉴 관리</span>
                        </button>
                        <button 
                            className={location.pathname === '/stock/addOption' ? 'sub-active' : ''}
                            onClick={() => navigate('/stock/addOption')}
                        >
                            <span>옵션 관리</span>
                        </button>
                        <button 
                            className={location.pathname === '/stock/orderDetails' ? 'sub-active' : ''}
                            onClick={() => navigate('/stock/orderDetails')}
                        >
                            <span>주문 내역</span>
                        </button>
                    </div>
                )}
            </div>

            <div className="stock-menu">
                <button 
                    className={`stock-main ${isFinanceActive ? 'active' : ''}`}
                    onClick={toggleFinance}
                >
                    <BiDollar className="icon" />
                    <span>재무관리</span>
                </button>

                {isFinanceOpen && (
                    <div className="stock-submenu">
                        <button 
                            className={location.pathname === '/finance/dashboard' ? 'sub-active' : ''}
                            onClick={() => navigate('/finance/dashboard')}
                        >
                            <span>대시 보드</span>
                        </button>
                        <button 
                            className={location.pathname === '/finance/salesAnalysis' ? 'sub-active' : ''}
                            onClick={() => navigate('/finance/salesAnalysis')}
                        >
                            <span>매출 분석</span>
                        </button>
                        <button 
                            className={location.pathname === '/finance/expendManagement' ? 'sub-active' : ''}
                            onClick={() => navigate('/finance/expendManagement')}
                        >
                            <span>지출 관리</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sidebar;
