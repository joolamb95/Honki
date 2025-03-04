import React, { useContext, useState, useEffect } from 'react';
import { EmployeeContext, Employee, EmployeeSalary } from './Employees';
import '../../style/PayrollManagement.css';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const PayrollManagement: React.FC = () => {
  const context = useContext(EmployeeContext);
  if (!context) {
    throw new Error('EmployeeContext가 정의되지 않았습니다!');
  }
  const { employees, setEmployees } = context;

  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('');
  const [minSalary, setMinSalary] = useState<number | ''>('');
  const [maxSalary, setMaxSalary] = useState<number | ''>('');
  const [editRowId, setEditRowId] = useState<number | null>(null);
  const [editedPayroll, setEditedPayroll] = useState<Partial<Employee>>({});

  const navigate = useNavigate();
  const location = useLocation();

  // 페이징 관련 state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10; // 한 페이지에 10명씩

  // ✅ employees에서 jobTitle 목록을 동적으로 생성 (중복 제거)
  const jobTitles = Array.from(new Set(employees.map(emp => emp.salary?.jobTitle).filter(Boolean)));

  // 급여 정보가 undefined일 경우 기본값 할당
  const getSalaryData = (employee: Employee) => ({
    baseSalary: employee.salary?.baseSalary ?? 0,
    bonus: employee.salary?.bonus ?? 0,
    paymentDate: employee.salary?.paymentDate ?? '',
    totalSalary: (employee.salary?.baseSalary ?? 0) + (employee.salary?.bonus ?? 0),
    lastUpdate: employee.salary?.lastUpdate ?? new Date(),
    jobTitle: employee.salary?.jobTitle ?? '',
  });

  // ✅ 검색 및 필터링
  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.salary?.jobTitle && employee.salary?.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter = filter ? employee.salary?.jobTitle === filter : true;
    const salaryData = getSalaryData(employee);
    const matchesSalary =
      (minSalary === '' || salaryData.baseSalary >= minSalary) &&
      (maxSalary === '' || salaryData.baseSalary <= maxSalary);

    return matchesSearch && matchesFilter && matchesSalary;
  });

  // ✅ 급여 수정 시작
  const handleEdit = (employeeNo: number) => {
    setEditRowId(employeeNo);
    const employee = employees.find((emp) => emp.employeeNo === employeeNo);
    if (employee) {
      setEditedPayroll({ ...employee, salary: getSalaryData(employee) });
    }
  };

  // ✅ 급여 입력값 변경 처리
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof EmployeeSalary,
    employeeNo: number
  ) => {
    const value = Number(e.target.value) || 0;
    setEditedPayroll((prev) => {
      if (prev.employeeNo !== employeeNo) return prev;
      const updatedSalary: EmployeeSalary = {
        baseSalary: prev.salary?.baseSalary ?? 0,
        bonus: prev.salary?.bonus ?? 0,
        paymentDate: prev.salary?.paymentDate ?? '',
        totalSalary: (prev.salary?.baseSalary ?? 0) + (prev.salary?.bonus ?? 0),
        lastUpdate: new Date(),
        jobTitle: prev.salary?.jobTitle ?? '',
      };
      return {
        ...prev,
        salary: {
          ...updatedSalary,
          [field]: value,
          totalSalary:
            field === 'baseSalary' || field === 'bonus'
              ? (field === 'baseSalary'
                  ? value + updatedSalary.bonus
                  : updatedSalary.baseSalary + value)
              : updatedSalary.totalSalary,
        },
      };
    });
  };

  // ✅ 급여 저장 (axios 요청)
  const handleSave = async (employeeNo: number) => {
    try {
      const updatedSalary = {
        employeeNo,
        jobTitle: editedPayroll.salary?.jobTitle || '',
        baseSalary: editedPayroll.salary?.baseSalary || 0,
        bonus: editedPayroll.salary?.bonus || 0,
        totalSalary: editedPayroll.salary?.totalSalary || 0,
        paymentDate:
          editedPayroll.salary?.paymentDate ||
          new Date().toISOString().split('T')[0],
        lastUpdate: new Date(),
      };

      console.log('🔹 급여 수정 요청 데이터:', updatedSalary);

      await axios.put(`http://localhost:8080/honki/api/payrolls/${employeeNo}`, updatedSalary);

      setEmployees((prev) =>
        prev.map((emp) =>
          emp.employeeNo === employeeNo ? { ...emp, salary: updatedSalary } : emp
        )
      );

      setEditRowId(null);
    } catch (error) {
      console.error('🚨 급여 수정 실패:', error);
    }
  };

  // =====================
  // 정렬 로직
  // =====================
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({
    key: null,
    direction: 'asc',
  });
  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const getValue = (obj: any, path: string) => path.split('.').reduce((o, p) => o?.[p], obj);
    let aValue = getValue(a, sortConfig.key);
    let bValue = getValue(b, sortConfig.key);
    if (aValue === undefined || aValue === null) return 1;
    if (bValue === undefined || bValue === null) return -1;
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortConfig.direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    }
    return 0;
  });

  // =====================
  // 페이징 로직 (클라이언트 사이드)
  // =====================
  const totalPages = Math.ceil(sortedEmployees.length / itemsPerPage);
  const paginatedEmployees = sortedEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    (currentPage - 1) * itemsPerPage + itemsPerPage
  );

  // =====================
  // 렌더링
  // =====================
  const formatNumber = (num?: number): string => {
    if (num === undefined || num === null || isNaN(num)) return '0';
    return num.toLocaleString();
  };

  return (
    <div className="payroll-management">
      <div className="stock-nav">
        <button
          className={location.pathname === '/employee/management' ? 'active' : ''}
          onClick={() => navigate('/employee/management')}
        >
          인사관리
        </button>
        <button
          className={location.pathname === '/employee/payroll' ? 'active' : ''}
          onClick={() => navigate('/employee/payroll')}
        >
          급여관리
        </button>
        <button
          className={location.pathname === '/employee/attendance' ? 'active' : ''}
          onClick={() => navigate('/employee/attendance')}
        >
          근태관리
        </button>
      </div>

      <div className="content-wrapper">
        <div className="content-header">급여 관리</div>

        <div className="date-section">
          <div className="date-label">기본급 범위</div>
          <div className="date-inputs">
            <input
              type="number"
              placeholder="최소 기본급"
              value={minSalary}
              onChange={(e) => setMinSalary(Number(e.target.value) || '')}
            />
            <span>~</span>
            <input
              type="number"
              placeholder="최대 기본급"
              value={maxSalary}
              onChange={(e) => setMaxSalary(Number(e.target.value) || '')}
            />
          </div>
        </div>

        <div className="search-section">
          <div className="search-box">
            <select className="menu-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="">전체</option>
              {jobTitles.map((title) => (
                <option key={title} value={title}>{title}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="검색어를 입력하세요"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <table className="payroll-table">
        <thead>
          <tr>
            <th onClick={() => requestSort('employeeNo')}>사원번호</th>
            <th onClick={() => requestSort('name')}>이름</th>
            <th onClick={() => requestSort('salary.jobTitle')}>직급</th>
            <th onClick={() => requestSort('salary.baseSalary')}>기본급</th>
            <th onClick={() => requestSort('salary.bonus')}>성과급</th>
            <th onClick={() => requestSort('salary.totalSalary')}>총 급여</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {paginatedEmployees.map((employee) => (
            <tr key={employee.employeeNo}>
              <td>{employee.employeeNo}</td>
              <td>{employee.name}</td>
              <td>{employee.salary?.jobTitle || '직급 없음'}</td>
              <td>
                {editRowId === employee.employeeNo ? (
                  <input
                    type="number"
                    value={editedPayroll.salary?.baseSalary ?? 0}
                    onChange={(e) => handleInputChange(e, 'baseSalary', employee.employeeNo)}
                  />
                ) : (
                  formatNumber(employee.salary?.baseSalary)
                )}
              </td>
              <td>
                {editRowId === employee.employeeNo ? (
                  <input
                    type="number"
                    value={editedPayroll.salary?.bonus ?? 0}
                    onChange={(e) => handleInputChange(e, 'bonus', employee.employeeNo)}
                  />
                ) : (
                  formatNumber(employee.salary?.bonus)
                )}
              </td>
              <td>{formatNumber(employee.salary?.totalSalary)}</td>
              <td>
                <div className="button-group">
                  {editRowId === employee.employeeNo ? (
                    <>
                      <button className="edit-button" onClick={() => handleSave(employee.employeeNo)}>저장</button>
                      <button className="delete-button" onClick={() => setEditRowId(null)}>취소</button>
                    </>
                  ) : (
                    <button className="edit-button1" onClick={() => handleEdit(employee.employeeNo)}>수정</button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 페이징 컨트롤 */}
      <div className="pagination" style={{ marginTop: '16px', textAlign: 'center' }}>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => setCurrentPage(pageNum)}
            style={{
              marginRight: '8px',
              backgroundColor: currentPage === pageNum ? '#ccc' : 'transparent',
            }}
          >
            {pageNum}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PayrollManagement;
