import { Provider } from "react-redux";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import store from "./store";
import Sidebar from "./component/Sidebar";
import Menus from "./component/Menus";
import Cart from "./component/Cart";
import "./App.css";
import MenuDetail from "./component/MenuDetail";

import Orders from "./component/Orders";
import  FailPage  from "./component/Fail";





function App() {
  return (
    <Provider store={store}>
      <Router>
        <div id="container">
          <Sidebar />
          <div className="menu-content">
            <Routes>
              <Route path="/" element={<Menus />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/category/:categoryName" element={<Menus />} /> {/* ✅ 라우트 추가 */}
              <Route path="/menu/:menuNo" element={<MenuDetail />} />
              <Route path="/fail" element={<FailPage/>}/>
    
              <Route path="/orders" element={<Orders/>} />
              
            </Routes>
          </div>
        </div>
      </Router>
    </Provider>
  );
}

export default App;
