import React, { useContext, useState } from 'react';
import { EmployeeContext, Employee } from './Employees';
import '../../style/EmployeMangement.css';
import { useNavigate } from 'react-router-dom';
const EmployeeManagement: React.FC = () => {
  const context = useContext(EmployeeContext);
  if (!context) {
    throw new Error('EmployeeContext가 정의되지 않았습니다!');
  }
  const { employees, setEmployees } = context;
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const openModal = (employee: Employee | null) => {
    setSelectedEmployee(
      employee || {
        id: '',
        name: '',
        position: '',
        birthDate: '',
        gender: '',
        contact: '',
        address: '',
        hireDate: '',
        resignDate: '',
        status: true,
        email: '',
        basicSalary: 0,
        bonus: 0,
        paymentDate: '',
        totalSalary: 0,
      }
    );
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setSelectedEmployee(null);
    setIsModalOpen(false);
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (selectedEmployee) {
      const { name, value } = e.target;
      setSelectedEmployee((prev) => {
        if (!prev) return null;
        const updatedEmployee = {
          ...prev,
          [name]: name === 'basicSalary' || name === 'bonus' ? Number(value.replace(/^0+/, '')) : value,
        };
        // 총 지급 급여 자동 계산
        if (name === 'basicSalary' || name === 'bonus') {
          updatedEmployee.totalSalary = (updatedEmployee.basicSalary || 0) + (updatedEmployee.bonus || 0);
        }
        return updatedEmployee;
      });
    }
  };
  const navigate = useNavigate();
  const calculateEmploymentDuration = (hireDate: string): string => {
    const startDate = new Date(hireDate);
    const currentDate = new Date();
    if (isNaN(startDate.getTime())) return 'N/A';
    const diffTime = Math.abs(currentDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // 일 수 계산
    return `${diffDays}일`;
  };
  const saveChanges = () => {
    if (selectedEmployee) {
      const requiredFields = ['name', 'position', 'contact', 'hireDate'];
      for (const field of requiredFields) {
        if (!selectedEmployee[field as keyof Employee]) {
          alert(`${field}은(는) 필수 입력값입니다.`);
          return;
        }
      }
      const currentDate = new Date().toISOString().split('T')[0];
      const employeeWithUpdate = { ...selectedEmployee, lastUpdate: currentDate };
      if (selectedEmployee.id) {
        // 기존 사원 업데이트
        setEmployees((prev) =>
          prev.map((emp) => (emp.id === selectedEmployee.id ? employeeWithUpdate : emp))
        );
      } else {
        // 새로운 사원 추가
        setEmployees((prev) => [...prev, { ...employeeWithUpdate, id: `s${prev.length + 1}` }]);
      }
      closeModal();
    }
  };
  const handleDelete = (id: string) => {
    setEmployees((prev) => prev.filter((employee) => employee.id !== id));
  };
  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.contact.includes(searchTerm);
    const matchesFilter =
      !filter || (filter === 'manager' && employee.position === '매니저') || (filter === 'staff' && employee.position === '직원');
    return matchesSearch && matchesFilter;
  });
  return (
    <div className="employee-management">
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
    <div className="content-header">인사 관리</div>
    <div className="search-section">
        <div className="search-box">
            <select 
                className="menu-select"
                onChange={(e) => setFilter(e.target.value)}
            >
                <option value="">전체</option>
                <option value="manager">매니저</option>
                <option value="staff">직원</option>
            </select>
            <input
                type="text"
                placeholder="검색어를 입력하세요"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className='management-button'>
              <button onClick={() => openModal(null)}>사원 추가</button>
            </div>
        </div>
    </div>
</div>

      <table className="employee-table">
        <thead>
          <tr>
            <th>사원번호</th>
            <th>이름</th>
            <th>직급</th>
            <th>연락처</th>
            <th>입사일</th>
            <th>입사 경과일</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {filteredEmployees.map((employee) => (
            <tr key={employee.id}>
              <td>{employee.id}</td>
              <td>{employee.name}</td>
              <td>{employee.position}</td>
              <td>{employee.contact}</td>
              <td>{employee.hireDate}</td>
              <td>{employee.hireDate ? calculateEmploymentDuration(employee.hireDate) : 'N/A'}</td>
              <td>
                <div className="button-group">
                  <button className="edit-button" onClick={() => openModal(employee)}>수정</button>
                  <button className="delete-button" onClick={() => handleDelete(employee.id)}>삭제</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {isModalOpen && selectedEmployee && (
  <div className="modal-overlay active">
    <div className="modal">
      <button className="modal-closex" onClick={closeModal}>✕</button>
      <h3>사원 상세 정보</h3>

      {/* 가로 2분할 레이아웃 */}
      <div className="modal-contente">
        
        {/* 좌측 - 인사 정보 */}
        <div className="modal-section personnel">
          <h4>[인사 정보]</h4>
          <label>이름:</label>
          <input type="text" name="name" value={selectedEmployee.name} onChange={handleInputChange} />
          <label>직급:</label>
          <input type="text" name="position" value={selectedEmployee.position} onChange={handleInputChange} />
          <label>생년월일:</label>
          <input type="date" name="birthDate" value={selectedEmployee.birthDate} onChange={handleInputChange} />
          <label>성별:</label>
          <select name="gender" value={selectedEmployee.gender} onChange={handleInputChange}>
            <option value="">선택</option>
            <option value="남성">남성</option>
            <option value="여성">여성</option>
          </select>
          <label>연락처:</label>
          <input type="text" name="contact" value={selectedEmployee.contact} onChange={handleInputChange} />
          <label>주소:</label>
          <input type="text" name="address" value={selectedEmployee.address} onChange={handleInputChange} />
        </div>

        {/* 우측 - 급여 정보 */}
        <div className="modal-section salary">
          <h4>[급여 정보]</h4>
          <label>기본급:</label>
          <input type="number" name="basicSalary" value={selectedEmployee.basicSalary} onChange={handleInputChange} />
          <label>성과급:</label>
          <input type="number" name="bonus" value={selectedEmployee.bonus} onChange={handleInputChange} />
          <label>급여 지급일:</label>
          <input type="date" name="paymentDate" value={selectedEmployee.paymentDate} onChange={handleInputChange} />
          <label>총 지급 급여:</label>
          <input type="number" name="totalSalary" value={selectedEmployee.totalSalary} readOnly />
        </div>

      </div>

      {/* 하단 버튼 */}
      <div className="modal-actions">
        <button className="save-button" onClick={saveChanges}>저장</button>
        <button className="cancel-button" onClick={closeModal}>닫기</button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};
export default EmployeeManagement