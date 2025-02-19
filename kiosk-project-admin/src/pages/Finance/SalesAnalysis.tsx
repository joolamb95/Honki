import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from "recharts";
import moment from "moment";
import "../../style/SalesAnalysis.css";
import { useLocation, useNavigate } from "react-router-dom";


/* npm install recharts moment */

const SalesAnalysis: React.FC = () => {

  const navigate = useNavigate();
  const location = useLocation();

  const today = moment();
  const currentMonth = today.format("YYYY-MM");
  const lastWeekStart = today.subtract(7, "days").startOf("isoWeek");
  const lastWeekEnd = lastWeekStart.clone().add(6, "days");

  const daysInMonth = today.daysInMonth();

  const generateMonthlySalesData = () => {
    return Array.from({ length: daysInMonth }, (_, i) => ({
      date: `${i + 1}일`,
      sales: Math.floor(Math.random() * 900000),
    }));
  };

  const generateWeeklySalesData = () => {
    const daysOfWeek = ["월", "화", "수", "목", "금", "토", "일"];
    return daysOfWeek.map((day) => ({
      day,
      earlySales: Math.floor(Math.random() * 20000),
      lateSales: Math.floor(Math.random() * 20000),
    }));
  };

  const [monthlySalesData, setMonthlySalesData] = useState(generateMonthlySalesData());
  const [weeklySalesData, setWeeklySalesData] = useState(generateWeeklySalesData());

  useEffect(() => {
    const checkDateChange = setInterval(() => {
      const newToday = moment();
      if (newToday.format("YYYY-MM") !== currentMonth) {
        setMonthlySalesData(generateMonthlySalesData());
      }
      if (newToday.isoWeek() !== today.isoWeek()) {
        setWeeklySalesData(generateWeeklySalesData());
      }
    }, 60000*60); //매 1시간마다 변경

    return () => clearInterval(checkDateChange);
  }, []);

  // 📌 카테고리별 매출 데이터 (하드코딩)
  const categorySalesData = [
    {
      category: "주류",
      icon: "🍾",
      items: [
        { id: 1, name: "진로", orders: 45, color: "bg-blue-400", barColor: "bg-blue-600" },
        { id: 2, name: "참이슬", orders: 29, color: "bg-green-400", barColor: "bg-green-600" },
        { id: 3, name: "와인", orders: 18, color: "bg-purple-400", barColor: "bg-purple-600" },
        { id: 4, name: "막걸리", orders: 25, color: "bg-orange-400", barColor: "bg-orange-600" },
      ],
    },
    {
      category: "안주류",
      icon: "🍗",
      items: [
        { id: 1, name: "안주1", orders: 45, color: "bg-blue-400", barColor: "bg-blue-600" },
        { id: 2, name: "안주2", orders: 29, color: "bg-green-400", barColor: "bg-green-600" },
        { id: 3, name: "안주3", orders: 18, color: "bg-purple-400", barColor: "bg-purple-600" },
        { id: 4, name: "안주4", orders: 25, color: "bg-orange-400", barColor: "bg-orange-600" },
      ],
    },
    {
      category: "논알콜",
      icon: "🥤",
      items: [
        { id: 1, name: "칵테일", orders: 45, color: "bg-blue-400", barColor: "bg-blue-600" },
        { id: 2, name: "제로콜라", orders: 29, color: "bg-green-400", barColor: "bg-green-600" },
        { id: 3, name: "사이다", orders: 18, color: "bg-purple-400", barColor: "bg-purple-600" },
        { id: 4, name: "탄산수", orders: 25, color: "bg-orange-400", barColor: "bg-orange-600" },
      ],
    },
  ];

  return (
    <div className="salesAnalysis">
      <div className="nav-bar">
      <button className={location.pathname === '/finance/dashboard' ? 'active' : ''}
        onClick={() => navigate('/finance/dashboard')}>대시 보드</button>
        <button className={location.pathname === '/finance/salesAnalysis' ? 'active' : ''}
        onClick={() => navigate('/finance/salesAnalysis')}>매출 분석</button>
        <button className={location.pathname === '/finance/expendManagement' ? 'active' : ''}
        onClick={() => navigate('/finance/expendManagement')}>지출 관리</button>
      </div>

      <div className="section1">
        <div className="section">
          <h2>이번달 매출</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlySalesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#8884d8" name="월 매출" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="section">
          <h2 className="text-xl font-bold text-indigo-900">최고 매출 시간대</h2>
          <p className="text-gray-500">이번주({`${lastWeekStart.format("MM/DD")}~${lastWeekEnd.format("MM/DD")}) 주간 주문량`}</p>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklySalesData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="earlySales" fill="#3498db" name="17:00~20:59" barSize={40} />
                <Bar dataKey="lateSales" fill="#2ecc71" name="21:00~02:00" barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 📌 카테고리별 매출 섹션 */}
      <div className="section">
        <h2 className="text-xl font-bold text-indigo-900">카테고리 별 매출</h2>
        <p className="text-gray-500">인기 메뉴</p>
        
         {/* ✅ 가로 정렬을 위해 flex-wrap 추가 */}
        <div className="flex flex-wrap justify-center gap-6 mt-4">
          {categorySalesData.map((categoryData) => (
            <div key={categoryData.category} className="category-card">
              <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
                {categoryData.icon} {categoryData.category}
              </h3>

              <div className="mt-2 space-y-2">
                {categoryData.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center border-b pb-2">
                    <span className="text-gray-600 w-6">{item.id}</span>
                    <span className="text-gray-800 flex-1">{item.name}</span>
                    <span className="text-gray-800 w-10 text-right">{item.orders}</span>
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-2 ${item.barColor}`} style={{ width: `${item.orders}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SalesAnalysis;
