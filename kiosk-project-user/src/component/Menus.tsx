import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { Menu } from "../type/MenuType";
import TableManager from "../component/TableManager";
import "../resource/Menu.css";
import Modal from "react-modal";
import GameSelectionModal from "./GameSelected";
import { Stock } from "../type/Stock";
import SoldOutModal from "../component/SoldOutModal";

// **(중복 import 주의!)** 
// import { Stock } from "../type/Stock"; 
// 위처럼 이미 import 했으면 추가로 작성하지 않아도 됩니다.

// public 폴더에 있는 sold-out.jpg를 사용할 경우:
const soldOutImg = "/sold-out.jpg";

const Menus = () => {
  const navigate = useNavigate();
  const { tableNo } = useParams();
  const selectedCategory = useSelector((state: RootState) => state.category);

  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const menuContainerRef = useRef<HTMLDivElement | null>(null);

  const [, setCurrentCategoryIndex] = useState(0);
  const [menuItems, setMenuItems] = useState<Menu[]>([]);
  const [categories, setCategories] = useState<{ categoryNo: number; categoryName: string }[]>([]);

  // 품절 모달 관련 state
  const [isSoldOutModalOpen, setIsSoldOutModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  // 재고 정보 state
  const [stockItems, setStockItems] = useState<Stock[]>([]);

  // 게임 모달
  const [showGameModal, setShowGameModal] = useState(false);

  // 환경 변수 (Vite)
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;


  // 1) 카테고리 데이터 불러오기
  useEffect(() => {
    fetch(`${apiBaseUrl}/honki/api/categories`)
      .then((response) => response.json())
      .then((data) => {
        console.log("카테고리 데이터:", data);
        setCategories(data);
      })
      .catch((error) => console.error("카테고리 데이터를 불러오는 중 오류 발생:", error));
  }, []);

  // 2) 재고 데이터 불러오기
  useEffect(() => {
    fetch(`${apiBaseUrl}/honki/stock`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("재고 데이터:", data);
        setStockItems(data);
      })
      .catch((error) => console.error("재고 데이터를 불러오는 중 오류 발생:", error));
  }, []);

  // 3) 메뉴 데이터 불러오기
  useEffect(() => {
    fetch(`${apiBaseUrl}/honki/api/menus`)
      .then((response) => response.json())
      .then((data) => {
        console.log("메뉴 데이터:", data);
        setMenuItems(data);
      })
      .catch((error) => console.error("메뉴 데이터를 불러오는 중 오류 발생:", error));
  }, []);

  // 4) 테이블 번호 유지
  const currentTableNo = tableNo
    ? parseInt(tableNo, 10)
    : parseInt(localStorage.getItem("currentTable") || "1", 10);

  useEffect(() => {
    localStorage.setItem("currentTable", currentTableNo.toString());
    console.log("📌 Menus.tsx - 현재 테이블 번호 유지:", currentTableNo);
  }, [currentTableNo]);

  // 5) 카테고리별 메뉴 그룹화
  const groupedMenus = menuItems.reduce((acc, item) => {
    const category =
      categories.find((c) => c.categoryNo === item.categoryNo)?.categoryName || "기타";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, Menu[]>);

  // 6) 카테고리 순서대로 메뉴 정렬
  const categoryOrder = categories.map((category) => category.categoryName);
  const sortedGroupedMenus = categoryOrder
    .filter((category) => groupedMenus[category])
    .reduce((acc, category) => {
      acc[category] = groupedMenus[category];
      return acc;
    }, {} as Record<string, Menu[]>);

  const categoryKeys = Object.keys(sortedGroupedMenus);

  // 7) 특정 카테고리를 선택했을 때 해당 섹션으로 스크롤
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

  // 8) 품절된 메뉴 클릭 시 모달 표시
  const handleSoldOutClick = (menuName: string) => {
    setModalMessage(" 이 메뉴는 품절되었습니다.");
    setIsSoldOutModalOpen(true);
  };

  return (
    <>
      {/* 테이블 번호 표시/유지 */}
      <TableManager />

      {/* 메뉴 목록 */}
      <div className="menu-container" ref={menuContainerRef}>
        {Object.entries(sortedGroupedMenus).map(([category, items]) => (
          <div
            key={category}
            ref={(el) => {
              if (el) categoryRefs.current[category] = el;
            }}
            className="menu-category"
          >
            <h2 className="menu-title">{category}</h2>
            <div className="menu-list">
              {items.map((item) => {
                const stockItem = stockItems.find((stock) => stock.menuNo === item.menuNo);
                const isSoldOut = stockItem && stockItem.stockQuantity === 0;

                return (
                  <div
                    className="menu-card"
                    key={item.menuNo}
                    onClick={() => {
                      if (isSoldOut) {
                        handleSoldOutClick(item.menuName);
                      } else {
                        navigate(`/menu/${item.menuNo}/${currentTableNo}`);
                      }
                    }}
                  >
                    <img
                      src={
                        isSoldOut
                          ? soldOutImg // 품절 시 sold-out.jpg
                          : item.menuImg.startsWith("http")
                          ? item.menuImg
                          : `${apiBaseUrl}/honki${item.menuImg}`
                      }
                      alt={item.menuName}
                      className="menu-img"
                    />
                    <p className="menu-info">
                      <span className="menu-name">{item.menuName}</span>
                      <br />
                      <span className="menu-price">{item.menuPrice.toLocaleString()} 원</span>
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 하단 버튼들 */}
      <div className="bottom-buttons">
        <button className="bottom-button1" onClick={() => navigate(`/cart/${currentTableNo}`)}>
          장바구니
        </button>
        <button className="bottom-button1" onClick={() => setShowGameModal(true)}>
          🎮 게임
        </button>
      </div>

      {/* 게임 모달 */}
      {showGameModal && <GameSelectionModal onClose={() => setShowGameModal(false)} />}

      {/* 품절 모달 */}
      <SoldOutModal
      isOpen={isSoldOutModalOpen}
      onClose={()=> setIsSoldOutModalOpen(false)}
      message={modalMessage}
      />
    </>
  );
};

export default Menus;
