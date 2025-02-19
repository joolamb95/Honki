import React, { useContext, useState } from 'react';
import { EmployeeContext, Employee } from './Employees';
import '../../style/PayrollManagement.css';
import { useNavigate, useLocation } from 'react-router-dom';

const PayrollManagement: React.FC = () => {
  const context = useContext(EmployeeContext);
  if (!context) {
    throw new Error('EmployeeContext가 정의되지 않았습니다!');
  }
  const { employees, setEmployees } = context;

  const [searchTerm, setSearchTerm] = useState('');
  const [filterOption, setFilterOption] = useState('all');
  const [minSalary, setMinSalary] = useState<number | ''>(''); // 최소 기본급 필터
  const [maxSalary, setMaxSalary] = useState<number | ''>(''); // 최대 기본급 필터
  const [editRowId, setEditRowId] = useState<string | null>(null);
  const [editedPayroll, setEditedPayroll] = useState<Partial<Employee>>({});

  const navigate = useNavigate();
  const location = useLocation();

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter =
      filterOption === 'all' || 
      (filterOption === 'manager' && employee.position === '매니저') ||
      (filterOption === 'staff' && employee.position === '직원');
    
    const matchesSalary =
      (minSalary === '' || employee.basicSalary >= minSalary) &&
      (maxSalary === '' || employee.basicSalary <= maxSalary);

    return matchesSearch && matchesFilter && matchesSalary;
  });

  const handleEdit = (id: string) => {
    setEditRowId(id);
    const employee = employees.find((emp) => emp.id === id);
    if (employee) {
      setEditedPayroll({ ...employee });
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof Employee
  ) => {
    const value = field === 'basicSalary' || field === 'bonus' ? Number(e.target.value) : e.target.value;
    setEditedPayroll((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (id: string) => {
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === id
          ? { ...emp, ...editedPayroll, totalSalary: (editedPayroll.basicSalary || 0) + (editedPayroll.bonus || 0) }
          : emp
      )
    );
    setEditRowId(null);
    setEditedPayroll({});
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
                <select 
                    className="menu-select"
                    value={filterOption}
                    onChange={(e) => setFilterOption(e.target.value)}
                >
                    <option value="all">전체</option>
                    <option value="manager">매니저</option>
                    <option value="staff">직원</option>
                </select>
                <input
                    type="text"
                    placeholder="검색어를 입력하세요"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button onClick={() => {}}>검색</button>
            </div>
        </div>
      </div>
      <table className="payroll-table">
        <thead>
          <tr>
            <th>사원번호</th>
            <th>이름</th>
            <th>직급</th>
            <th>기본급</th>
            <th>성과급</th>
            <th>총 급여</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {filteredEmployees.map((employee) => (
            <tr key={employee.id}>
              <td>{employee.id}</td>
              <td>{employee.name}</td>
              <td>{employee.position}</td>
              <td>
                {editRowId === employee.id ? (
                  <input
                    type="number"
                    value={editedPayroll.basicSalary || ''}
                    onChange={(e) => handleInputChange(e, 'basicSalary')}
                  />
                ) : (
                  employee.basicSalary
                )}
              </td>
              <td>
                {editRowId === employee.id ? (
                  <input
                    type="number"
                    value={editedPayroll.bonus || ''}
                    onChange={(e) => handleInputChange(e, 'bonus')}
                  />
                ) : (
                  employee.bonus
                )}
              </td>
              <td>{employee.totalSalary}</td>
              <td>
                {editRowId === employee.id ? (
                  <>
                    <button onClick={() => handleSave(employee.id)}>저장</button>
                    <button onClick={() => setEditRowId(null)}>취소</button>
                  </>
                ) : (
                  <div className="button-group">
                  <button  className="edit-button" onClick={() => handleEdit(employee.id)}>수정</button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PayrollManagement;
