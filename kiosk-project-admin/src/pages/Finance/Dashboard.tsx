import React from "react";
import "../../style/Dashboard.css";
import { useLocation, useNavigate } from "react-router-dom";

const Dashboard: React.FC = () => {

  const navigate = useNavigate();
  const location = useLocation();

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
              <SalesCard title="총 매출액" value="$1k" percentage="+8%" bgColor="#FFE2E5" iconColor="#FA5A7D" />
              <SalesCard title="총 주문량" value="300" percentage="+5%" bgColor="#FFF4DE" iconColor="#FF947A" />
              <SalesCard title="예약 단체 손님" value="5" percentage="+1.2%" bgColor="#DCFCE7" iconColor="#3CD856" />
              <SalesCard title="방문 손님" value="42" percentage="+0.5%" bgColor="#F3E8FF" iconColor="#BF83FF" />
            </div>
          </div>

        <div className="inform-cards">
          {/* 매출 대비 지출 정보 */}
        <div className="chart-container">
          <div className="chart-card">
            <div className="chart-title">수입 대비 지출 현황</div>

            <div className="chart-bars">
              {["Jan", "Feb", "Mar", "Apr", "May", "June", "July"].map(
                (month, index) => (
                  <div key={index} className="chart-group">
                    <div className="chart-label">{month}</div>
                    <div className="bar-container">
                      <div className="bar-income"></div>
                      <div className="bar-expense"></div>
                    </div>
                  </div>
                )
              )}
            </div>

            <div className="summary">
              <div className="summary-item">
                <div className="summary-icon income-icon"></div>
                <div className="summary-info">
                  <div className="summary-title">총 지출액</div>
                  <div className="summary-subtitle">월별</div>
                </div>
                <div className="summary-value income">8.823</div>
              </div>

              <div className="summary-item">
                <div className="summary-icon expense-icon"></div>
                <div className="summary-info">
                  <div className="summary-title">총 매출액</div>
                  <div className="summary-subtitle">월별</div>
                </div>
                <div className="summary-value expense">12.122</div>
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
                <TableRow title="토스 페이" amount="130,000" tax="10%" total="117,000" />
                <TableRow title="카카오 페이" amount="225,000" tax="10%" total="202,500" />
                <TableRow title="카카오 페이" amount="119,000" tax="10%" total="107,100" />
                <TableRow title="카카오 페이" amount="268,000" tax="10%" total="241,200" />
                <TableRow title="네이버 페이" amount="69,000" tax="10%" total="62,100" />
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
      <span>{amount}</span>
      <span>{tax}</span>
      <span>{total}</span>
    </div>
  );
};

export default Dashboard;
