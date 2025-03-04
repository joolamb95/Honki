import React, { useEffect, useRef, useState } from 'react';
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
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import {WebSocketContext} from './WebSocketContext'  // ✅ WebSocketContext 추가

const App: React.FC = () => {
    const stompClientRef = useRef<Client | null>(null);
    const [orderUpdates, setOrderUpdates] = useState<any>(null);
    const [chatMessages, setChatMessages] = useState<{ [key: number]: any[] }>({});

    useEffect(() => {
        if (stompClientRef.current) return;

        console.log("🔗 WebSocket 연결 시도...");
        const stompClient = new Client({
            webSocketFactory: () => new SockJS("http://localhost:8080/honki/ws/owner"),
            reconnectDelay: 5000,
            onConnect: () => {
                console.log("✅ WebSocket 연결 성공");
            
            let preOrder = {};
                // 주문 업데이트 구독
                stompClient.subscribe("/topic/orders/update", (message) => {
                    const updatedOrder = JSON.parse(message.body);
                    console.log("📩 주문 정보 업데이트 수신:", updatedOrder);
                    if(preOrder!= updatedOrder){
                        setOrderUpdates(updatedOrder);
                        preOrder = updatedOrder
                    }
                });

                // 채팅 메시지 구독
                for (let i = 1; i <= 9; i++) {
                    stompClient.subscribe(`/topic/chat/owner/${i}`, (message) => {
                        const newMessage = JSON.parse(message.body);
                        console.log(`📩 테이블 ${i} 새 메시지 수신:`, newMessage);

                        setChatMessages((prev) => ({
                            ...prev,
                            [i]: [...(prev[i] || []), newMessage],
                        }));
                    });
                }
            },
            onStompError: (error) => console.error("🚨 STOMP 오류:", error),
        });

        stompClient.activate();
        stompClientRef.current = stompClient;

        return () => {
            console.log("⚠️ WebSocket 연결 해제");
            stompClient.deactivate();
            stompClientRef.current = null;
        };
    }, []);

    return (
        
        <EmployeesProvider> {/* EmployeeProvider로 래핑 */}
            <WebSocketContext.Provider value={{ orderUpdates, chatMessages }}> {/* ✅ WebSocketContext 감싸기 */}
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
            </WebSocketContext.Provider>
        </EmployeesProvider>
    );
};

export default App;
