import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { Menu } from "../type/MenuType";
import TableManager from "../component/TableManager"; // ✅ TableManager 추가
import "../resource/Menu.css";
import Quiz from "./Quizs";





const Menus = () => {
  const navigate = useNavigate();
  const { tableNo } = useParams(); // ✅ URL에서 테이블 번호 가져오기
  const selectedCategory = useSelector((state: RootState) => state.category);
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const menuContainerRef = useRef<HTMLDivElement | null>(null);
  const [, setCurrentCategoryIndex] = useState(0);
  const [menuItems, setMenuItems] = useState<Menu[]>([]);
  const [categories, setCategories] = useState<{ categoryNo: number; categoryName: string }[]>([]);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  const [isQuizOpen, setIsQuizOpen] = useState(false);


  useEffect(() => {
    fetch(`${apiBaseUrl}/honki/api/categories`)
      .then((response) => response.json())
      .then((data) => {
        console.log("카테고리 데이터:", data);
        setCategories(data);
      })
      .catch((error) => console.error("카테고리 데이터를 불러오는 중 오류 발생:", error));
  }, []);

  useEffect(() => {
    fetch(`${apiBaseUrl}/honki/api/menus`)
      .then((response) => response.json())
      .then((data) => {
        console.log("메뉴 데이터:", data);
        setMenuItems(data);
      })
      .catch((error) => console.error("메뉴 데이터를 불러오는 중 오류 발생:", error));
  }, []);

  // ✅ 테이블 번호 유지: `localStorage`에서 가져오거나 URL에서 가져오기
  const currentTableNo = tableNo ? parseInt(tableNo, 10) : parseInt(localStorage.getItem("currentTable") || "1", 10);

  useEffect(() => {
    localStorage.setItem("currentTable", currentTableNo.toString());
    console.log("📌 Menus.tsx - 현재 테이블 번호 유지:", currentTableNo);
  }, [currentTableNo]);

  // ✅ 카테고리별 메뉴 그룹화
  const groupedMenus = menuItems.reduce((acc, item) => {
    const category = categories.find((c) => c.categoryNo === item.categoryNo)?.categoryName || "기타";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, Menu[]>);

  const categoryOrder = categories.map((category) => category.categoryName);
  const sortedGroupedMenus = categoryOrder
    .filter((category) => groupedMenus[category])
    .reduce((acc, category) => {
      acc[category] = groupedMenus[category];
      return acc;
    }, {} as Record<string, Menu[]>);

  const categoryKeys = Object.keys(sortedGroupedMenus);

  useEffect(() => {
    if (selectedCategory && categoryRefs.current[selectedCategory]) {
      categoryRefs.current[selectedCategory]?.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
      const newIndex = categoryKeys.indexOf(selectedCategory);
      if (newIndex !== -1) {
        setCurrentCategoryIndex(newIndex);
      }
    }
  }, [selectedCategory, categoryKeys]);

  return (
    <>
      <TableManager /> {/* ✅ 테이블 번호 유지하도록 추가 */}

      <div className="menu-container" ref={menuContainerRef}>
        {Object.entries(sortedGroupedMenus).map(([category, items]) => (
          <div key={category} ref={(el) => { if (el) categoryRefs.current[category] = el; }} className="menu-category">
            <h2 className="menu-title"> {category}</h2>
            <div className="menu-list">
              {items.map((item) => (
                <div
                  className="menu-card"
                  key={item.menuNo}
                  onClick={() => navigate(`/menu/${item.menuNo}/${currentTableNo}`)} // ✅ 테이블 번호 유지하여 이동
                >
                  <img
                    src={item.menuImg.startsWith("http") ? item.menuImg : `${apiBaseUrl}/honki${item.menuImg}`}
                    alt={item.menuName}
                    className="menu-img"
                  />
                  <p className="menu-info">
                    <span className="menu-name">{item.menuName}</span>
                    <br />
                    <span className="menu-price">{item.menuPrice.toLocaleString()} 원</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bottom-buttons">
        <button className="bottom-button1" onClick={() => navigate(`/cart/${currentTableNo}`)}>장바구니</button> {/* ✅ 테이블 번호 유지 */}
        <button className="bottom-button1" onClick={() => setIsQuizOpen(true)}>
          🎲 상식 퀴즈
        </button>

      </div>

      {isQuizOpen && (
          <Quiz onClose={() => setIsQuizOpen(false)} />
      )}
    </>
  );
};

export default Menus;