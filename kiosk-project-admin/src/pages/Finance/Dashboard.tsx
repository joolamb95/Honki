import React, { useEffect, useState } from "react";
import "../../style/Dashboard.css";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";


interface MonthlyData {
  month: string;
  expense: number;
  revenue: number;
}


interface Payment {
  title: string;
  amount: number;
  tax: string;
  total: number;
}


const Dashboard: React.FC = () => {

  const navigate = useNavigate();
  const location = useLocation();

  // 지출 정산 내역 데이터 관리
  const [settlements, setSettlements] = useState<Payment[]>([]);


  // 지출 정산 내역 데이터 백엔드 요청 API
  useEffect(() => {
    const fetchSettlements = async () => {
      try {
        const response = await axios.get<Payment[]>("http://localhost:8080/honki/api/orders/recent-payments");
        setSettlements(response.data);
      } catch (error) {
        console.error("지출 내역 가져오기 실패:", error);
      }
    };

    fetchSettlements();
  }, []);


  // 매출 대비 지출 그래프 데이터 관리
  const [chartData, setChartData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);

  // 매출 대비 지출 데이터 백엔드 요청 API
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const [expensesRes, revenuesRes] = await Promise.all([
          axios.get<MonthlyData[]>("http://localhost:8080/honki/finance/monthly-expenses"),
          axios.get<MonthlyData[]>("http://localhost:8080/honki/api/orders/monthly-revenues"),
        ]);

        const expenses = expensesRes.data;
        const revenues = revenuesRes.data;

        // 월별 데이터 매칭
        const months = [...new Set([...expenses.map((e: MonthlyData) => e.month), ...revenues.map((r: MonthlyData) => r.month)])].sort();
        const formattedData = months.map(month => ({
          month,
          expense: expenses.find((e: MonthlyData) => e.month === month)?.expense || 0,
          revenue: revenues.find((r: MonthlyData) => r.month === month)?.revenue || 0
        }));

        setChartData(formattedData);
      } catch (error) {
        console.error("데이터 가져오기 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchChartData();
  }, []);

 // ✅ 총 매출액과 총 지출액 계산 (chartData 활용)
 const totalRevenue = chartData.reduce((sum, data) => sum + data.revenue, 0);
 const totalExpends = chartData.reduce((sum, data) => sum + data.expense, 0);

  // 매출 데이터 상태 관리
  const [salesData, setSalesData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    netProfit: 0,
    // totalVisitors: 0,
  });

  // 대시보드 데이터 불러오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 여러 개의 API를 병렬로 호출
        const [revenueRes, ordersRes, expendsRes] = await Promise.all([
          axios.get("http://localhost:8080/honki/api/orders/totalRevenue"),
          axios.get("http://localhost:8080/honki/api/orders/totalOrders"),
          axios.get("http://localhost:8080/honki/finance/totalExpends"),
        ]);

        const totalRevenue = revenueRes.data;  // 총 매출액
        const totalOrders = ordersRes.data;    // 총 주문량
        const totalExpends = expendsRes.data;  // 총 지출액
        const netProfit = totalRevenue - totalExpends; // 순이익

        setSalesData({ totalRevenue, totalOrders, netProfit });
      } catch (error) {
        console.error("데이터 가져오기 실패:", error);
      }
    };

    fetchData();
  }, []);


  return (
    <div className="dashboard">
      {/* 네비게이션 바 */}
      <div className="nav-bar">
      <button className={location.pathname === '/finance/dashboard' ? 'active' : ''}
        onClick={() => navigate('/finance/dashboard')}>대시 보드</button>
        <button className={location.pathname === '/finance/salesAnalysis' ? 'active' : ''}
        onClick={() => navigate('/finance/salesAnalysis')}>매출 분석</button>
        <button className={location.pathname === '/finance/expendManagement' ? 'active' : ''}
        onClick={() => navigate('/finance/expendManagement')}>지출 관리</button>
      </div>

          {/* 오늘의 매출 정보 */}
          <div className="today-sales">
            <h2>오늘의 매출 정보</h2>
            <div className="sales-cards">
              <SalesCard title="총 매출액" value={`₩${salesData.totalRevenue.toLocaleString()}`} percentage="" bgColor="#FFE2E5" iconColor="#FA5A7D" />
              <SalesCard title="총 주문량" value={`${salesData.totalOrders}`} percentage="" bgColor="#FFF4DE" iconColor="#FF947A" />
              <SalesCard title="순 이익" value={`₩${salesData.netProfit.toLocaleString()}`} percentage="" bgColor="#DCFCE7" iconColor="#3CD856" />
              {/* <SalesCard title="방문 손님" value="0명" percentage="+0.5%" bgColor="#F3E8FF" iconColor="#BF83FF" /> */}
            </div>
          </div>

        <div className="inform-cards">
          {/* 매출 대비 지출 정보 차트 컨테이너 */}
        <div className="chart-container">
          <div className="chart-card">
            <div className="chart-title">수입 대비 지출 현황</div>

            {loading ? (
          <p>로딩 중...</p>
        ) : chartData.length === 0 ? (
          <p>데이터가 없습니다</p>
        ) : (
          <div className="chart-bars">
            {chartData.map(({ month, revenue, expense }, index) => (
              <div key={index} className="chart-group">
                <div className="chart-label">{month}</div>
                <div className="bar-container">
                  <div className="bar-income" style={{ height: `${revenue / 1000}px` }}></div>
                  <div className="bar-expense" style={{ height: `${expense / 1000}px` }}></div>
                </div>
              </div>
            ))}
          </div>
        )}

            <div className="summary">
              {/* 총 매출액 (Revenue) */}
              <div className="summary-item">
                <div className="summary-icon income-icon"></div>
                <div className="summary-info">
                  <div className="summary-title">총 매출액</div>
                  <div className="summary-subtitle">월별</div>
                </div>
                <div className="summary-value income">₩ {totalRevenue.toLocaleString()}</div>
              </div>

              {/* 총 지출액 (Expense) */}      
              <div className="summary-item">
                <div className="summary-icon expense-icon"></div>
                <div className="summary-info">
                  <div className="summary-title">총 지출액</div>
                  <div className="summary-subtitle">월별</div>
                </div>
                <div className="summary-value expense">₩ {totalExpends.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>

          {/* 정산 예정 금액 */}
          <div className="settlement">
            <div className="chart-title">정산 예정 금액</div>
            <div className="table">
              <div className="table-head">
                <span>항목</span>
                <span>금액</span>
                <span>소득세</span>
                <span>실수령액</span>
              </div>
              <div className="table-body">
              {settlements.length === 0 ? (
                <p>데이터가 없습니다</p>
              ) : (
                settlements.map((payment, index) => (
                  <TableRow
                    key={index}
                    title={payment.title}
                    amount={payment.amount.toLocaleString()}
                    tax={payment.tax}
                    total={payment.total.toLocaleString()}
                  />
                ))
              )}
              </div>
            </div>
          </div>
        </div>


    </div>
  );
};

const SalesCard: React.FC<{ title: string; value: string; percentage: string; bgColor: string; iconColor: string }> = ({
  title,
  value,
  percentage,
  bgColor,
  iconColor,
}) => {
  return (
    <div className="sales-card" style={{ background: bgColor }}>
      <div className="icon" style={{ background: iconColor }}></div>
      <div className="content">
        <div className="title">{title}</div>
        <div className="value">{value}</div>
        <div className="percentage">{percentage}</div>
      </div>
    </div>
  );
};

const TableRow: React.FC<{ title: string; amount: string; tax: string; total: string }> = ({ title, amount, tax, total }) => {
  return (
    <div className="table-row">
      <span>{title}</span>
      <span>₩ {amount}</span>
      <span>{tax}</span>
      <span>₩ {total}</span>
    </div>
  );
};

export default Dashboard;
