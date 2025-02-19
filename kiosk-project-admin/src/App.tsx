import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.css';
import './App.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import StockManagement from './pages/StockPage/StockManagement';
import StockOrder from './pages/StockPage/StockOrder';
import StockDetails from './pages/StockPage/StockDetails';
import OrderDetails from './pages/ProductionPage/OrderDetails';
import AddMenu from './pages/ProductionPage/AddMenu';
import Hall from './pages/Hall';
import Dashboard from './pages/Finance/Dashboard';
import SalesAnalysis from './pages/Finance/SalesAnalysis';
import ExpendManagement from './pages/Finance/ExpendManagement';
import EmployeesProvider from './pages/EmployeePage/Employees';
import EmployeeManagement from './pages/EmployeePage/EmployeeManagement';
import PayrollManagement from './pages/EmployeePage/PayrollManagement';
import AttendanceManagement from './pages/EmployeePage/AttendanceManagement';
import AddOption from './pages/ProductionPage/AddOption';

const App: React.FC = () => {
    return (
        <EmployeesProvider> {/* EmployeeProvider로 래핑 */}
            <BrowserRouter>
                <div className="app-container">
                    <Header />
                    <div className="main-content">
                        <Sidebar />
                        <div className="content">
                            <Routes>
                                { <Route path="/" element={<Hall />} /> }
                                <Route path="/stock/management" element={<StockManagement />} />
                                <Route path="/stock/order" element={<StockOrder />} />
                                <Route path="/stock/details" element={<StockDetails />} />
                                <Route path="/stock/addMenu" element={<AddMenu />} />
                                <Route path='/stock/addOption' element={<AddOption />}/>
                                <Route path="/stock/orderDetails" element={<OrderDetails />} />
                                <Route path="/finance/dashboard" element={<Dashboard/>}/>
                                <Route path="/finance/salesAnalysis" element={<SalesAnalysis/>}/>
                                <Route path="/finance/expendManagement" element={<ExpendManagement/>}/>
                                <Route path="/employee/management" element={<EmployeeManagement />} />
                                <Route path="/employee/payroll" element={<PayrollManagement />} />
                                <Route path="/employee/attendance" element={<AttendanceManagement />} />
                            </Routes>
                        </div>
                    </div>
                </div>
            </BrowserRouter>
        </EmployeesProvider>
    );
};

export default App;
