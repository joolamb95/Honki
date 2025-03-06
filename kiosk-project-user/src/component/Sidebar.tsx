import React, { useEffect, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import ChatModal from "./ChatModal";
import ServiceCallModal from "./bell";
import { RootState } from "../store";
import { setCategory } from "../features/categorySlice";
import { addMessage, clearMessages } from "../features/chatSlice";
import "../resource/Sidebar.css";

const Sidebar: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false); // 서비스 호출 모달 상태
  const [isChatOpen, setIsChatOpen] = useState(false);   // 채팅 모달 상태
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const selectedCategory = useSelector((state: RootState) => state.category);
  const [categories, setCategories] = useState<{ categoryNo: number; categoryName: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [userChatRefreshKey, setUserChatRefreshKey] = useState(0); //상태 새로고침
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const storedTableNo = localStorage.getItem("currentTable") || "1";
  const currentTableNo = Number(storedTableNo);


  // *** 안 읽은 메시지 개수를 추적할 상태 ***
  const [unreadCount, setUnreadCount] = useState<number>(0);

// .env에서 얻어온 ip주소
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  // 카테고리 목록 불러오기
  useEffect(() => {
    fetch("http://localhost:8080/honki/api/categories")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`서버 오류: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("카테고리 데이터:", data);
        setCategories(data);
        setError(null);
      })
      .catch((error) => {
        console.error("카테고리 데이터 불러오기 오류:", error);
        setError("카테고리 데이터를 불러오지 못했습니다. 다시 시도해주세요.");
      });
  }, []);

  
  // WebSocket 연결 및 구독
useEffect(() => {
  const client = new Client({
      webSocketFactory: () => new SockJS(`${apiBaseUrl}/honki/ws/customer`),
      onConnect: () => {
          console.log("WebSocket 연결 성공");
          setStompClient(client);
          [1, 2, 3, 4, 5, 6, 7, 8, 9].forEach((tableNo) => {
              client.subscribe(`/topic/chat/customer/${tableNo}`, (msg) => {
                  const newMessage = JSON.parse(msg.body);
                  console.log(`📩 [User] 테이블 ${tableNo} 새 메시지:`, newMessage);
                  if (newMessage.type === "LEAVE") {
                      console.log(`🧹 테이블 ${tableNo} 메시지 삭제 실행`);
                      dispatch(clearMessages(tableNo));
                      setUserChatRefreshKey((prev) => prev + 1);
                  } else {
                      dispatch(addMessage(newMessage));

                      // ✅ "CALL" 타입이 아니고, 채팅창이 닫혀 있을 때만 카운트 증가
                      if (newMessage.type !== "CALL" && !isChatOpen) {
                          setUnreadCount((prev) => prev + 1);
                      }
                  }
              });
          });
      },
      onStompError: (error) => console.error("🚨 STOMP 오류:", error),
  });

  client.activate();

  return () => {
      console.log("⚠️ WebSocket 연결 해제");
      client.deactivate().then(() => setStompClient(null));
  };
}, [dispatch, isChatOpen]);  // isChatOpen도 dependency에 넣어야 새 값 반영

  // 서비스 호출 메시지 전송
const handleServiceCall = (message: string) => {
  if (!stompClient || !stompClient.connected) {
      console.error("🚨 WebSocket이 연결되지 않음");
      return;
  }
  console.log("📩 호출 메시지 전송:", message);
  stompClient.publish({
      destination: "/app/chat.sendServiceRequest",
      body: JSON.stringify({
          tableNo: currentTableNo,
          content: message,
          timestamp: Date.now(),
          sender: "user",          // ✅ 소문자로 수정
          type: "CALL"             // ✅ 타입을 "CALL"로 설정
      }),
  });
  setIsModalOpen(false);
  setIsChatOpen(true);  // ✅ 채팅 모달을 열어도 카운트는 증가하지 않음
};


  // 채팅 모달 열기
  const openChat = () => {
    setIsChatOpen(true);
    // 채팅 모달을 열면 안 읽은 메시지를 0으로 초기화
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
          {/* 채팅 모달 */}
          {isChatOpen && (
            <ChatModal
              key={userChatRefreshKey} // 이 key가 바뀌면 모달이 재마운트됨
              isOpen={isChatOpen}
              onClose={() => setIsChatOpen(false)}
              tableNo={currentTableNo}  //고정값 1 대신 저장된 테이블 번호 사용
              initialMessage={selectedMessage}
              stompClient={stompClient}
            />
          )}

          {/* 채팅 버튼 – 안 읽은 메시지 표시 */}
          <button className="cate-button1" onClick={openChat}>
            채팅
            {unreadCount > 0 && <span className="chat-badge">{unreadCount}</span>}
          </button>

          {/* 서비스 호출 버튼 */}
          <button className="cate-button2" onClick={() => setIsModalOpen(true)}>
            서비스 호출
          </button>

          {/* 서비스 호출 모달 */}
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
