import { Provider } from "react-redux";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import store from "./store";
import Sidebar from "./component/Sidebar";
import Menus from "./component/Menus";
import Cart from "./component/Cart";
import "./App.css";
import MenuDetail from "./component/MenuDetail";
import Orders from "./component/Orders";
import FailPage from "./component/Fail";
import MainPage from "./component/MainPage";
import TableManager from "./component/TableManager";
import Quiz from "./component/Quizs";

// App 컴포넌트
function App() {
  return (
    <Provider store={store}>
      <Router>
        <div id="container">
        <TableManager /> {/* ✅ 테이블 번호 관리 */}
          <SidebarWithRoute /> {/* 사이드바를 경로에 따라 렌더링 */}
          <div className="menu-content">
            <Routes>
              <Route path="/" element={<MainPage />} />
              <Route path="/table/:tableNo" element={<Menus />} />
              <Route path="/cart/:tableNo" element={<Cart />} />
              <Route path="/category/:categoryName" element={<Menus />} />
              <Route path="/menu/:menuNo/:tableNo?" element={<MenuDetail />} /> {/* ✅ tableNo 추가 */}
              <Route path="/fail/" element={<FailPage />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/quizzes" element={<Quiz />} />
              
            </Routes>
          </div>
        </div>
      </Router>
    </Provider>
  );
}

// SidebarWithRoute 컴포넌트
const SidebarWithRoute = () => {
  const location = useLocation();
  
  // 메인 페이지에서 사이드바를 숨기고, 다른 페이지에서는 사이드바를 보여줌
  if (location.pathname === "/") {
    return null; // 메인 페이지에서 사이드바 숨김
  }

  return <Sidebar />; // 메인 페이지가 아니면 사이드바 렌더링
};

export default App;