import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { fetchExpends, fetchAvailableMonths } from "../../slice/expendSlice";
import "../../style/ExpendManagement.css";
import ExpenseModal from "../../components/ExpenseModal";
import { useLocation, useNavigate } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const ExpendManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();

  // Redux 상태에서 가져오기
  const { expenses, availableMonths, expensesData } = useSelector((state: RootState) => state.expends);
  const [selectedMonth, setSelectedMonth] = useState("");

  // DB에서 월 목록 가져오기
  useEffect(() => {
    dispatch(fetchAvailableMonths());
  }, [dispatch]);

  // 월 목록이 로드되면 최신 월을 기본값으로 설정
  useEffect(() => {
    if (availableMonths.length > 0) {
      setSelectedMonth(availableMonths[0]);  // 최신 월로 설정
      dispatch(fetchExpends(availableMonths[0]));  // Redux에서 해당 월 데이터 가져오기
    }
  }, [availableMonths, dispatch]);

  // 선택된 월이 변경되면 Redux에서 데이터 가져오기
  useEffect(() => {
    if (selectedMonth) {
      dispatch(fetchExpends(selectedMonth));
    }
  }, [selectedMonth, dispatch, location.pathname]);

  // 모달창 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openExpenseModal = () => setIsModalOpen(true);
  const closeExpenseModal = () => setIsModalOpen(false);

  // 지난달 데이터 가져오기
  const getPrevMonth = (yearMonth: string) => {
    const [year, month] = yearMonth.split("-").map(Number);
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    return `${prevYear}-${prevMonth.toString().padStart(2, "0")}`;
  };

  const prevMonth = getPrevMonth(selectedMonth);
  const totalCurrentMonth = expensesData[selectedMonth] ?? 0;
  const totalPrevMonth = expensesData[getPrevMonth(selectedMonth)] !== undefined ? expensesData[prevMonth] : 0;

  // 바 차트 데이터 구성
  const barChartData = [
    {
      name: "이전달 vs 이번달",
      prevAmount: totalPrevMonth / 10000, // 단위: 만원
      currentAmount: totalCurrentMonth / 10000, // 단위: 만원
    },
  ];

  // 파이 차트 데이터 변환
  const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const pieChartData = totalExpense
    ? expenses.map(expense => ({
        name: expense.category,
        value: parseFloat(((expense.amount / totalExpense) * 100).toFixed(2)), // 백분율 계산
        amount: expense.amount,
      }))
    : [];

  // 파이 차트 색상 배열
  const COLORS = ["#7B61FF", "#FF6B6B", "#2DC3E8", "#FFA63D", "#4C84FF"];

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

      {/* 차트 섹션 */}
      <div className="chartSection">
        {/* 파이 차트 */}
        <div className="chartBox1">
          <div className="chartTitle">지출비율</div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
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
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 바 차트 */}
        <div className="chartBox2">
          <div className="chartTitle">지난달 대비 지출액</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value, name) => [`${value} 만원`, name === "prevAmount" ? "이전월" : "현재월"]} />
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
      <ExpenseModal selectedMonth={selectedMonth} onClose={closeExpenseModal} expenses={expenses} />
      </div>
    </div>
)}
    </div>
  );
};

export default ExpendManagement;
