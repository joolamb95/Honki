import React, { useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from "recharts";
import { RootState, AppDispatch } from "../../store";
import { useSelector, useDispatch } from "react-redux";
import { fetchMonthlySales, fetchWeeklySales, fetchTopMenus, TopMenuCategory, MenuItem } from "../../slice/salesSlice";
import "../../style/SalesAnalysis.css";
import { useLocation, useNavigate } from "react-router-dom";

const SalesAnalysis: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  // ✅ Redux에서 데이터 가져오기
  const { monthlySales, weeklySales, topMenus = [] } = useSelector((state: RootState) => state.sales);

  useEffect(() => {
    console.log("📌 Redux 상태 확인 - monthlySales:", monthlySales);
    console.log("📌 Redux 상태 확인 - weeklySales:", weeklySales);
    console.log("📌 Redux 상태 확인 - topMenus:", topMenus);
  }, [monthlySales, weeklySales, topMenus]);

  // ✅ API 호출 (현재 월과 주의 데이터를 자동으로 가져옴)
  useEffect(() => {
    const today = new Date();
    const currentMonth = `${today.getFullYear()}-${('0' + (today.getMonth() + 1)).slice(-2)}`;
    dispatch(fetchMonthlySales(currentMonth)); // 이번 달 매출 데이터 요청 (현재 월 자동 반영)
    dispatch(fetchWeeklySales());  // 이번 주 매출 데이터 요청 (현재 주 자동 반영)
    dispatch(fetchTopMenus());     // 인기 메뉴 데이터 요청
  }, [dispatch]);

  // ✅ 카테고리 아이콘 설정
  const categoryIcons: Record<string, string> = {
    주류: "🍶",
    안주류: "🍗",
    논알콜: "🥤",
  };

  return (
    <div className="salesAnalysis">
      <div className="nav-bar">
        <button
          className={location.pathname === "/finance/dashboard" ? "active" : ""}
          onClick={() => navigate("/finance/dashboard")}
        >
          대시 보드
        </button>
        <button
          className={location.pathname === "/finance/salesAnalysis" ? "active" : ""}
          onClick={() => navigate("/finance/salesAnalysis")}
        >
          매출 분석
        </button>
        <button
          className={location.pathname === "/finance/expendManagement" ? "active" : ""}
          onClick={() => navigate("/finance/expendManagement")}
        >
          지출 관리
        </button>
      </div>

      {/* 이번 달 매출 */}
      <div className="section1">
        <div className="section">
          <h2>이번달 매출</h2>
          {monthlySales.length === 0 ? (
            <p className="text-center text-gray-500">📌 데이터가 없습니다.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlySales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#8884d8" name="월 매출" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* 이번 주 매출 */}
        <div className="section">
          <h2>주간 누적 매출</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklySales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="morningSales" fill="#3498db" name="오전 매출 (00~11시)" />
              <Bar dataKey="afternoonSales" fill="#2ecc71" name="오후 매출 (12~23시)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 📌 카테고리별 매출 섹션 */}
      <div className="section">
        <h2>카테고리 별 매출</h2>
        <p className="text-gray-500">인기 메뉴</p>

        {/* ✅ 데이터가 로드되지 않았을 경우 */}
        {!topMenus || topMenus.length === 0 ? (
          <p className="text-center text-gray-500">데이터가 없습니다.</p>
        ) : (
          <div className="flex flex-wrap justify-between gap-6 mt-4">
            {topMenus.map((categoryData: TopMenuCategory, index) => {
              const categoryKey = categoryData.category ? categoryData.category : `category-${index}`;

              // ✅ 각 카테고리에서 가장 주문량이 높은 값 찾기 (width 비율 조정)
              const maxOrders = categoryData.items.length > 0
                ? Math.max(...categoryData.items.map((item: MenuItem) => item.ORDERS))
                : 1; // maxOrders가 0이 되지 않도록 기본값 설정

                return (
                  <div key={categoryKey} className="category-card w-1/3 p-4 bg-white rounded-lg shadow-md">
                    <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
                      {categoryIcons[categoryData.category] ?? "🍽"} {categoryData.category ?? "기타"}
                    </h3>


                  {/* ✅ 인기 메뉴 리스트 */}
                  <div className="mt-2 space-y-2">
                    {categoryData.items.map((item: MenuItem, idx) => (
                      <div key={`${item.id}-${idx}`} className="flex justify-between items-center border-b pb-2">
                        <span className="text-gray-600 w-6">{item.rank}위   </span>
                        <span className="text-gray-800 flex-1">{item.NAME}   </span>
                        <span className="text-gray-800 w-10 text-right">{item.ORDERS}건</span>
                        <div className="w-24 h-2 bg-gray-200 rounded-full ml-2">
                          <div
                            className="h-2 bg-blue-600"
                            style={{ width: `${(item.ORDERS / maxOrders) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesAnalysis;
