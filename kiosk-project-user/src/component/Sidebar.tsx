import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../store";
import { setCategory } from "../features/categorySlice";
import { useState, useEffect } from "react";
import ServiceCallModal from "./bell";
import ChatModal from "./ChatModal";
import "../resource/Sidebar.css";

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false); // 서비스 호출 모달 상태
  const [isChatOpen, setIsChatOpen] = useState(false); // 채팅 모달 상태
  const selectedCategory = useSelector((state: RootState) => state.category);
  const [categories, setCategories] = useState<{ categoryNo: number; categoryName: string }[]>([]);
  const [error, setError] = useState<string | null>(null); // ❗ API 에러 상태 추가

  // ✅ API에서 카테고리 목록 가져오기
  useEffect(() => {
    fetch("http://localhost:8080/honki/api/categories") // ✅ 변경된 API 경로 반영
      .then((response) => {
        if (!response.ok) {
          throw new Error(`서버 오류: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("카테고리 데이터:", data);
        setCategories(data);
        setError(null); // 에러 초기화
      })
      .catch((error) => {
        console.error("카테고리 데이터 불러오기 오류:", error);
        setError("카테고리 데이터를 불러오지 못했습니다. 다시 시도해주세요."); // ❗ UI에 표시할 에러 메시지 설정
      });
  }, []);
  


  

  return (
    <div className="sidebar">
      <img src="/logo.png" alt="로고" className="logo" />

      <div className="category-list">
        {error ? ( // ❗ 에러 발생 시 UI에 메시지 표시
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
                  e.currentTarget.blur(); // ✅ 클릭 후 포커스 해제
                  
                }}
              >

                {category.categoryName}
              </button>
              
              
            </div>
          ))
        )}
        

        {/* ✅ 채팅 & 직원 호출 버튼 */}
        <div className="category-button2">
          {!isModalOpen && !isChatOpen && (
            <button className="cate-button1" onClick={() => setIsChatOpen(true)}>💬 채팅</button>
          )}
          {isChatOpen && <ChatModal onClose={() => setIsChatOpen(false)} 
            message="채팅 메시지"
            tableId={1}
            />}
          {!isModalOpen && !isChatOpen && (
            <button className="cate-button2" onClick={() => setIsModalOpen(true)}>🆘 서비스 호출</button>
          )}
          {isModalOpen && <ServiceCallModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
