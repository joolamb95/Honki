import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.css';
import './App.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import EmployeesProvider from './pages/EmployeePage/Employees';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { useDispatch } from 'react-redux';
import { addMessage } from './slice/ChatSlice';  // Redux 액션
import { WebSocketContext } from './WebSocketContext';  // stompClient, orderUpdates, chatMessages 제공
// 페이지들
import Hall from './pages/Hall';
import StockManagement from './pages/StockPage/StockManagement';
import StockOrder from './pages/StockPage/StockOrder';
import StockDetails from './pages/StockPage/StockDetails';
import OrderDetails from './pages/ProductionPage/OrderDetails';
import AddMenu from './pages/ProductionPage/AddMenu';
import AddOption from './pages/ProductionPage/AddOption';
import Dashboard from './pages/Finance/Dashboard';
import SalesAnalysis from './pages/Finance/SalesAnalysis';
import ExpendManagement from './pages/Finance/ExpendManagement';
import EmployeeManagement from './pages/EmployeePage/EmployeeManagement';
import PayrollManagement from './pages/EmployeePage/PayrollManagement';
import AttendanceManagement from './pages/EmployeePage/AttendanceManagement';
const App: React.FC = () => {
  const dispatch = useDispatch();
  // stompClient, orderUpdates, chatMessages 상태를 관리
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [orderUpdates, setOrderUpdates] = useState<any>(null);
  // 만약 Context에 chatMessages도 저장하고 싶다면:
  const [chatMessages, setChatMessages] = useState<{ [key: number]: any[] }>({});
  useEffect(() => {
    console.log(":링크: WebSocket 연결 시도...");
    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/honki/ws/owner"),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log(":흰색_확인_표시: WebSocket 연결 성공");
        // 주문 업데이트 구독
        let preOrder: any = {};
        client.subscribe("/topic/orders/update", (message) => {
          const updatedOrder = JSON.parse(message.body);
          console.log(":화살표가_있는_봉투: 주문 정보 업데이트 수신:", updatedOrder);
          if (preOrder !== updatedOrder) {
            setOrderUpdates(updatedOrder);
            preOrder = updatedOrder;
          }
        });
        // 채팅 메시지 구독 (테이블 1~9)
        for (let i = 1; i <= 9; i++) {
          client.subscribe(`/topic/chat/owner/${i}`, (message) => {
            const newMessage = JSON.parse(message.body);
            console.log(`:화살표가_있는_봉투: 테이블 ${i} 새 메시지 수신:`, newMessage);
            // 1) Redux에 저장 (안 읽은 메시지 배지 기능에 사용)
            dispatch(
              addMessage({
                ...newMessage,
                tableNo: i,
              })
            );
            // 2) Context에도 저장하고 싶다면:
            setChatMessages((prev) => ({
              ...prev,
              [i]: [...(prev[i] || []), newMessage],
            }));
          });
        }
        // 연결 완료 후 stompClient 상태 업데이트
        setStompClient(client);
      },
      onStompError: (error) => console.error(":경광등: STOMP 오류:", error),
    });
    client.activate();
    return () => {
      console.log(":경고: WebSocket 연결 해제");
      client.deactivate();
      setStompClient(null);
    };
  }, [dispatch]);
  return (
    <EmployeesProvider>
      <WebSocketContext.Provider
        value={{
          stompClient,
          orderUpdates,
          chatMessages,  // Context에 chatMessages 주입
        }}
      >
        <BrowserRouter>
          <div className="app-container">
            <Header />
            <div className="main-content">
              <Sidebar />
              <div className="content">
                <Routes>
                  <Route path="/" element={<Hall />} />
                  <Route path="/stock/management" element={<StockManagement />} />
                  <Route path="/stock/order" element={<StockOrder />} />
                  <Route path="/stock/details" element={<StockDetails />} />
                  <Route path="/stock/addMenu" element={<AddMenu />} />
                  <Route path="/stock/addOption" element={<AddOption />} />
                  <Route path="/stock/orderDetails" element={<OrderDetails />} />
                  <Route path="/finance/dashboard" element={<Dashboard />} />
                  <Route path="/finance/salesAnalysis" element={<SalesAnalysis />} />
                  <Route path="/finance/expendManagement" element={<ExpendManagement />} />
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