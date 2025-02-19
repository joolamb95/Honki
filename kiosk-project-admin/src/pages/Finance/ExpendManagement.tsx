import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../style/ExpendManagement.css";
import ExpenseModal, { Expense } from "../../components/ExpenseModal";
import { useLocation, useNavigate } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const ExpendManagement: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedMonth, setSelectedMonth] = useState("2025-02"); // 기본값 설정
  const [expenses, setExpenses] = useState<
    { expendNo: number; category: string; amount: number; expendDate: string; description: string }[]
  >([]);
  const [expensesData, setExpensesData] = useState<Record<string, number>>({}); // 월별 총 지출 저장
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);

  const fetchExpends = async (yearMonth: string) => {
    try {
      console.log(`📌 API 호출 중... yearMonth=${yearMonth}`); 
  
      const responseCurrent = await axios.get(`http://localhost:8080/honki/finance/expends`, {
        params: { yearMonth },
      });
  
      console.log("📌 API 응답 데이터:", responseCurrent.data);
  
      // ✅ API 응답을 `Expense[]` 타입에 맞게 변환
      const formattedCurrentData: Expense[] = responseCurrent.data.map((item: any) => ({
        expendNo: item.expendNo,
        category: item.category,
        amount: item.amount,
        expendDate: item.expendDate,
        description: item.description,
      }));
  
      // ✅ 이전 월 데이터 가져오기 (추가)
      const prevMonth = getPrevMonth(yearMonth);
      let formattedPrevData: Expense[] = [];
  
      if (prevMonth) {
        const responsePrev = await axios.get(`http://localhost:8080/honki/finance/expends`, {
          params: { yearMonth: prevMonth },
        });
  
        console.log("📌 이전 월 응답 데이터:", responsePrev.data);
  
        formattedPrevData = responsePrev.data.map((item: any) => ({
          expendNo: item.expendNo,
          category: item.category,
          amount: item.amount,
          expendDate: item.expendDate,
          description: item.description,
        }));
      }
  
      // ✅ 상태 업데이트
      setExpenses(formattedCurrentData);
  
      setExpensesData(prev => ({
        ...prev,
        [yearMonth]: formattedCurrentData.reduce((sum, item) => sum + (item.amount || 0), 0),
        [prevMonth]: formattedPrevData.reduce((sum, item) => sum + (item.amount || 0), 0), // ✅ 이전 월 데이터 저장 추가
      }));
  
    } catch (error) {
      console.error("❌ 지출 데이터를 가져오는 중 오류 발생:", error);
      setExpenses([]);
    }
  };
  
  useEffect(() => {
    const fetchAvailableMonths = async () => {
      try {
        const response = await axios.get("http://localhost:8080/honki/finance/expends/months");
        console.log("📌 DB에서 가져온 월 목록:", response.data);
  
        if (response.data.length > 0) {
          setAvailableMonths(response.data);
          setSelectedMonth(response.data[0]); // 최신 월을 기본값으로 설정
        }
      } catch (error) {
        console.error("❌ 월 목록을 가져오는 중 오류 발생:", error);
      }
    };
  
    fetchAvailableMonths();
  }, []);

  // ✅ 선택한 월이 변경될 때마다 API 요청
  useEffect(() => {
    fetchExpends(selectedMonth);
  }, [selectedMonth, location.pathname]);

  // ✅ 모달 열기/닫기
  const openExpenseModal = () => setIsModalOpen(true);
  const closeExpenseModal = () => setIsModalOpen(false);

  // ✅ 파이 차트 데이터 변환
  const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const pieChartData = totalExpense
    ? expenses.map(expense => ({
        name: expense.category,
        value: parseFloat(((expense.amount / totalExpense) * 100).toFixed(2)), // ✅ 백분율 계산
        amount: expense.amount,
      }))
    : [];

  const COLORS = ["#7B61FF", "#FF6B6B", "#2DC3E8", "#FFA63D", "#4C84FF"];

  // ✅ 지난달 데이터 가져오기
  const getPrevMonth = (yearMonth: string) => {
    const [year, month] = yearMonth.split("-").map(Number);
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    return `${prevYear}-${prevMonth.toString().padStart(2, "0")}`;
  };

  const prevMonth = getPrevMonth(selectedMonth);
  const totalCurrentMonth = expensesData[selectedMonth] !== undefined ? expensesData[selectedMonth] : 0;
  const totalPrevMonth = prevMonth && expensesData[prevMonth] !== undefined ? expensesData[prevMonth] : 0;


  // ✅ 바 차트 데이터 구성
  const barChartData = [
    {
      name: "이전달 vs 이번달",
      prevAmount: totalPrevMonth / 10000, // 단위: 만원
      currentAmount: totalCurrentMonth / 10000, // 단위: 만원
    },
  ];

  return (
    <div className="dashboardContainer">
      {/* 상단 네비게이션 */}
      <div className="nav-bar">
        <button className={location.pathname === "/finance/dashboard" ? "active" : ""} onClick={() => navigate("/finance/dashboard")}>
          대시 보드
        </button>
        <button className={location.pathname === "/finance/salesAnalysis" ? "active" : ""} onClick={() => navigate("/finance/salesAnalysis")}>
          매출 분석
        </button>
        <button className={location.pathname === "/finance/expendManagement" ? "active" : ""} onClick={() => navigate("/finance/expendManagement")}>
          지출 관리
        </button>
      </div>

      {/* 지출내역 섹션 */}
      <div className="sectionTop">
        <div className="sectionTitle">지출내역</div>
        <div className="sectionOption">
          <button onClick={openExpenseModal}>입력/수정</button>
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
          {availableMonths.map((month) => (
            <option key={month} value={month}>
              {`${month.split("-")[0]}년도 ${month.split("-")[1]}월`}
            </option>
          ))}
        </select>
        </div>
      </div>

      {/* 지출내역 테이블 */}
      <div className="expenseTable">
        <table>
          <thead>
            <tr>
              <th>지출 항목</th>
              <th>지출 금액</th>
              <th>지출 날짜</th>
              <th>비고</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense.expendNo}>
                <td>{expense.category}</td>
                <td>{expense.amount.toLocaleString()} 원</td>
                <td>{expense.expendDate}</td>
                <td>{expense.description || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 📌 차트 섹션 */}
      <div className="chartSection">
        {/* 📌 파이 차트 */}
        <div className="chartBox1">
          <div className="chartTitle">지출비율</div>
          <PieChart width={600} height={350}>
            <Pie
              data={pieChartData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={100}
              dataKey="value"
              label={({ name, amount, value }) => `${name}: ${(amount / 10000).toLocaleString()}만원 (${value}%)`}
            >
              {pieChartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name, props) => [`${value}%`, `${props.payload.name}`]} />
            <Legend align="right" verticalAlign="bottom" layout="vertical" />
          </PieChart>
        </div>

        {/* 📌 바 차트 */}
        <div className="chartBox2">
          <div className="chartTitle">지난달 대비 지출액</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis label={{ value: "단위: 만원", angle: -90, position: "insideLeft" }} />
              <Tooltip
              formatter={(value, name) => {
                // name이 prevAmount면 '이전월', currentAmount면 '현재월'
                const label = name === "이전월" ? "이전월" : "현재월";
                return [`${value} 만원`, label];
              }}
            />
              <Legend />
              <Bar dataKey="prevAmount" name="이전월" fill="#8884d8" />
              <Bar dataKey="currentAmount" name="현재월" fill="#ff9999" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeExpenseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <ExpenseModal
              expenses={expenses}
              setExpenses={setExpenses}
              selectedMonth={selectedMonth}
              onClose={closeExpenseModal}
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default ExpendManagement;
