import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store";
import { setCategory } from "../features/categorySlice";
import { Menu } from "../type/MenuType"; 
import "../resource/Menu.css";

const Menus = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const selectedCategory = useSelector((state: RootState) => state.category);
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const menuContainerRef = useRef<HTMLDivElement | null>(null);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [menuItems, setMenuItems] = useState<Menu[]>([]); 
  const [categories, setCategories] = useState<{ categoryNo: number; categoryName: string }[]>([]); // ✅ API에서 가져올 카테고리 데이터 상태

  // ✅ API에서 카테고리 목록 가져오기
  useEffect(() => {
    fetch("http://localhost:8080/honki/api/categories") // ✅ 실제 API 경로 확인
      .then((response) => response.json())
      .then((data) => {
        console.log("카테고리 데이터:", data);
        setCategories(data);
      })
      .catch((error) => console.error("카테고리 데이터를 불러오는 중 오류 발생:", error));
  }, []);

  // ✅ API에서 메뉴 데이터 가져오기
  useEffect(() => {
    fetch("http://localhost:8080/honki/api/menus")
      .then((response) => response.json())
      .then((data) => {
        console.log("메뉴 데이터:", data);
        setMenuItems(data);
      })
      .catch((error) => console.error("메뉴 데이터를 불러오는 중 오류 발생:", error));
  }, []);

  // ✅ 카테고리별 메뉴 그룹화 (이제 `categories` 상태 기반으로 그룹화)
  const groupedMenus = menuItems.reduce((acc, item) => {
    const category = categories.find((c) => c.categoryNo === item.categoryNo)?.categoryName || "기타";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, Menu[]>);

  // ✅ API에서 가져온 카테고리를 동적 정렬
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
      <div className="menu-container" ref={menuContainerRef}>
        {Object.entries(sortedGroupedMenus).map(([category, items]) => (
          <div key={category} ref={(el) => { if (el) categoryRefs.current[category] = el; }} className="menu-category">
            <h2 className="menu-title">🍽 {category}</h2>
            <div className="menu-list">
              {items.map((item) => (
                <div className="menu-card" key={item.menuNo} onClick={() => navigate(`/menu/${item.menuNo}`)}> 
                  <img src={`http://localhost:8080/honki${item.menuImg}`} alt={item.menuName} className="menu-img" />
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
        <button className="bottom-button1" onClick={() => navigate("/cart")}>🛒 장바구니</button>
        <button className="bottom-button2">📋 주문 내역 확인</button>
      </div>
    </>
  );
};

export default Menus;
