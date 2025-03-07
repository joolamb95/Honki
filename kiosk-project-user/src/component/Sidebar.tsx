import React, { useEffect, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ChatModal from "./ChatModal";
import ServiceCallModal from "./bell";
import { RootState } from "../store";
import { setCategory } from "../features/categorySlice";
import { addMessage, clearMessages } from "../features/chatSlice";
import "../resource/Sidebar.css";
const Sidebar: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [categories, setCategories] = useState<{ categoryNo: number; categoryName: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [userChatRefreshKey, setUserChatRefreshKey] = useState(0);
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const selectedCategory = useSelector((state: RootState) => state.category);
  const storedTableNo = localStorage.getItem("currentTable") || "1";
  const currentTableNo = Number(storedTableNo);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  // 카테고리 목록 불러오기
  useEffect(() => {
    fetch(`${apiBaseUrl}/honki/api/categories`)
      .then((response) => {
        if (!response.ok) throw new Error(`서버 오류: ${response.status}`);
        return response.json();
      })
      .then((data) => {
        console.log(":포장: 카테고리 데이터:", data);
        setCategories(data);
        setError(null);
      })
      .catch((error) => {
        console.error(" 카테고리 데이터 불러오기 오류:", error);
        setError("카테고리 데이터를 불러오지 못했습니다. 다시 시도해주세요.");
      });
  }, []);
  // WebSocket 연결 및 현재 테이블만 구독
  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(`${apiBaseUrl}/honki/ws/customer`),
      onConnect: () => {
        console.log(" WebSocket 연결 성공");
        setStompClient(client);
        // :흰색_확인_표시: 현재 테이블 번호만 구독
        client.subscribe(`/topic/chat/customer/${currentTableNo}`, (msg) => {
          const newMessage = JSON.parse(msg.body);
          console.log(` [User] 테이블 ${currentTableNo} 새 메시지:`, newMessage);
          if (newMessage.type === "LEAVE") {
            console.log(`테이블 ${currentTableNo} 메시지 삭제 실행`);
            dispatch(clearMessages(currentTableNo));
            setUserChatRefreshKey((prev) => prev + 1);
          } else {
            dispatch(addMessage(newMessage));
            // :흰색_확인_표시: 현재 테이블로 온 메시지만 카운트 증가
            if (newMessage.type !== "CALL" && !isChatOpen) {
              setUnreadCount((prev) => prev + 1);
            }
          }
        });
      },
      onStompError: (error) => console.error(" STOMP 오류:", error),
    });
    client.activate();
    return () => {
      console.log(" WebSocket 연결 해제");
      client.deactivate().then(() => setStompClient(null));
    };
  }, [dispatch, isChatOpen, currentTableNo]);  // :흰색_확인_표시: currentTableNo 추가
  // 서비스 호출 메시지 전송
  const handleServiceCall = (message: string) => {
    if (!stompClient || !stompClient.connected) {
      console.error(" WebSocket이 연결되지 않음");
      return;
    }
    console.log(" 호출 메시지 전송:", message);
    stompClient.publish({
      destination: "/app/chat.sendServiceRequest",
      body: JSON.stringify({
        tableNo: currentTableNo,
        content: message,
        timestamp: Date.now(),
        sender: "user",
        type: "CALL",
      }),
    });
    setIsModalOpen(false);
    setIsChatOpen(true);
  };
  // 채팅 모달 열기
  const openChat = () => {
    setIsChatOpen(true);
    setUnreadCount(0);
  };
  return (
    <div className="sidebar">
      <img src="/logo.png" alt="로고" className="logo" />
      <div className="category-list">
        {error ? (
          <p className="error-message">{error}</p>
        ) : (
          categories.map((category) => (
            <div key={category.categoryNo} className="category-button-wrapper">
              <button
                className={`category-button ${
                  selectedCategory !== "사시미" && selectedCategory === category.categoryName ? "active" : ""
                }`}
                onClick={(e) => {
                  dispatch(setCategory(category.categoryName));
                  navigate(`/category/${category.categoryNo}`);
                  e.currentTarget.blur();
                }}
              >
                {category.categoryName}
              </button>
            </div>
          ))
        )}
        <div className="category-button2">
          {isChatOpen && (
            <ChatModal
              key={userChatRefreshKey}
              isOpen={isChatOpen}
              onClose={() => setIsChatOpen(false)}
              tableNo={currentTableNo}
              initialMessage={selectedMessage}
              stompClient={stompClient}
            />
          )}
          <button className="cate-button1" onClick={openChat}>
            채팅
            {unreadCount > 0 && <span className="chat-badge">{unreadCount}</span>}
          </button>
          <button className="cate-button2" onClick={() => setIsModalOpen(true)}>
            서비스 호출
          </button>
          <ServiceCallModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            stompClient={stompClient}
            onMessageClick={handleServiceCall}
          />
        </div>
      </div>
    </div>
  );
};
export default Sidebar;