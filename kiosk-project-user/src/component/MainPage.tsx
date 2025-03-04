import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "../App.css"; // 스타일 파일


const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const MainPage = () => {
  const navigate = useNavigate();
  const [, setLoading] = useState(false);


  const handleRandomTableSelect = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}/honki/restaurant-table/random`);
      const data = await response.json();
      console.log("응답 받은 테이블:", data); 
      if (response.ok) {
        const tableNo = data.tableNo;
        navigate(`/table/${tableNo}`);
      } else {
        alert("테이블을 불러오는 데 실패했습니다.");
      }
    } catch (error) {
      console.error("랜덤 테이블 선택 오류:", error);
      alert("랜덤 테이블을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    
    <div id="container" onClick={handleRandomTableSelect}> {/* ✅ 어디를 클릭해도 이동 */}
      <div id="container1">
      <div id="main-content">
        <div className="kiosk-screen">
          <div className="random-table-container">
          

            {/* 로고 이미지 */}
            <img
              src="/logo.png"
              alt="Logo"
              className="random-table-image"
            />
             <div className="drink-text">HONKI</div>
          </div>
          <div className="drink-text1">클릭시 주문하기 페이지로 이동합니다.</div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default MainPage;
