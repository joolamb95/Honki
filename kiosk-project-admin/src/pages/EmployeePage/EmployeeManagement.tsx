import React, { useContext, useState, useEffect, useCallback } from 'react';
import { EmployeeContext, Employee, EmployeeSalary } from './Employees';
import '../../style/EmployeMangement.css';
import { useNavigate, useLocation } from 'react-router-dom';
import axios, { AxiosResponse } from 'axios';
import api from '../../Axios/api';

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
  const navigate = useNavigate();
  const location = useLocation();

  // 페이징 관련 state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10; // 한 페이지에 10명씩

  // ✅ employees에서 jobTitle 목록을 동적으로 생성 (중복 제거)
  const jobTitles = Array.from(
    new Set(employees.map(emp => emp.salary?.jobTitle).filter(Boolean))
  );

  // 필터링: 검색어와 직급 필터 적용
  const filteredEmployees = employees.filter((employee) => {
    // EMPLOYEE_STATUS가 false면(비활성화) 화면에 표시하지 않음
    if (!employee.employeeStatus) return false;
    const matchesSearch =
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.salary?.jobTitle && employee.salary?.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filter ? employee.salary?.jobTitle === filter : true;
    return matchesSearch && matchesFilter;
  });

  // 정렬 로직
  const [sortConfig, setSortConfig] = useState<{ key: keyof Employee | null; direction: 'asc' | 'desc' }>({
    key: null,
    direction: 'asc',
  });
  const requestSort = (key: keyof Employee) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const getValue = (obj: any, path: string) => {
      return path.split('.').reduce((o, p) => (o && o[p] !== undefined ? o[p] : ""), obj);
    };

    let aValue = getValue(a, sortConfig.key);
    let bValue = getValue(b, sortConfig.key);

    // undefined 또는 null 값 처리 (예: 직급이 없는 경우 빈 문자열로)
    if (aValue === undefined || aValue === null) aValue = "";
    if (bValue === undefined || bValue === null) bValue = "";

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortConfig.direction === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }
    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
    }
    return 0;
  });

  // 페이징: 전체 페이지 수와 현재 페이지 데이터 계산
  const totalPages = Math.ceil(sortedEmployees.length / itemsPerPage);
  const paginatedEmployees = sortedEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    (currentPage - 1) * itemsPerPage + itemsPerPage
  );

  // Modal 열기/닫기
  const openModal = (employee: Employee | null) => {
    setSelectedEmployee(
      employee || {
        employeeNo: undefined,
        name: '',
        birthDate: '',
        gender: '',
        phone: '010xxxxxxxx',
        address: '',
        hireDate: '',
        resignDate: '',
        employeeStatus: 'true',
        salary: {
          jobTitle: '',
          baseSalary: 0,
          bonus: 0,
          paymentDate: '',
          totalSalary: 0,
          lastUpdate: new Date(),
        },
      }
    );
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedEmployee(null);
    setIsModalOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!selectedEmployee) return;
    const { name, value } = e.target;
    setSelectedEmployee((prev) => {
      if (!prev) return null;
      // 급여 정보 업데이트 (salary 객체 내부 필드 수정)
      if (["baseSalary", "bonus", "paymentDate", "jobTitle"].includes(name)) {
        const updatedSalary = {
          ...prev.salary,
          [name]: name === "baseSalary" || name === "bonus" ? Number(value) || 0 : value,
        };
        return {
          ...prev,
          salary: {
            ...updatedSalary,
            totalSalary: (updatedSalary.baseSalary || 0) + (updatedSalary.bonus || 0),
            lastUpdate: new Date(),
          },
        };
      }
      // 연락처 업데이트 (name이 contact가 아니라 phone)
      if (name === "contact") {
        return { ...prev, phone: value };
      }
      return { ...prev, [name]: value };
    });
  };

  const calculateEmploymentDuration = (hireDate: string): string => {
    const startDate = new Date(hireDate);
    const currentDate = new Date();
    if (isNaN(startDate.getTime())) return 'N/A';
    const diffTime = Math.abs(currentDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays}일`;
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get("http://localhost:8080/honki/api/employees");
      setEmployees(response.data);
    } catch (error) {
      console.error("🚨 직원 목록 불러오기 실패:", error);
    }
  };

  const saveChanges = async () => {
    try {
      if (!selectedEmployee) {
        alert("사원 정보를 입력해주세요.");
        return;
      }
      console.log("🔹 사원 저장 요청 데이터:", selectedEmployee);
      let requestData = { ...selectedEmployee };
      // 새로운 사원 추가 시 employeeNo 제거 (서버에서 생성)
      if (!requestData.employeeNo) {
        delete requestData.employeeNo;
      }
      let response: AxiosResponse<Employee>;
      if (selectedEmployee.employeeNo) {
        response = await axios.put(
          `http://localhost:8080/honki/api/employees/${selectedEmployee.employeeNo}`,
          requestData
        );
      } else {
        response = await axios.post(
          'http://localhost:8080/honki/api/employees',
          requestData
        );
      }
      console.log("🔹 서버 응답 데이터:", response.data);
      if (response.status === 200 || response.status === 201) {
        alert("저장이 완료되었습니다.");
        await fetchEmployees();
        setSelectedEmployee(response.data);
        closeModal();
      } else {
        throw new Error(`저장 실패: ${response.status}`);
      }
    } catch (error) {
      console.error("🚨 사원 추가 실패:", error);
      alert("저장에 실패하였습니다. 정보를입력해주세요.");
    }
  };

  const handleDelete = async (employeeNo: number) => {
    if (!employeeNo) {
      alert("잘못된 사원 정보입니다.");
      return;
    }
    
    const confirmed = window.confirm("정말 삭제하시겠습니까?.");
    if (!confirmed) {
      return;
    }
    
    try {
      console.log("🔹 사원 삭제 요청:", employeeNo);
      // 백엔드의 소프트 삭제 엔드포인트 호출 (delete 메서드 내부에서 소프트 삭제를 수행하도록 변경)
      await axios.delete(`http://localhost:8080/honki/api/employees/${employeeNo}`);
      // 삭제 후 프론트엔드 목록에서 제외
      setEmployees((prev) => prev.filter((employee) => employee.employeeNo !== employeeNo));
    } catch (error) {
      console.error("🚨 사원 삭제 실패:", error);
      alert("사원 삭제 중 오류가 발생했습니다.");
    }
  };

  const formatPhoneNumber = (phone: string): string => {
    if (!phone) return "N/A";
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
    }
    return phone;
  };

  return (
    <div className="employee-management">
      <div className="stock-nav">
        <button className={location.pathname === '/employee/management' ? 'active' : ''} onClick={() => navigate('/employee/management')}>
          인사관리
        </button>
        <button className={location.pathname === '/employee/payroll' ? 'active' : ''} onClick={() => navigate('/employee/payroll')}>
          급여관리
        </button>
        <button className={location.pathname === '/employee/attendance' ? 'active' : ''} onClick={() => navigate('/employee/attendance')}>
          근태관리
        </button>
      </div>

      <div className="content-wrapper">
        <div className="content-header">인사 관리</div>
        <div className="search-section">
          <div className="search-box">
            <select className="menu-select" onChange={(e) => setFilter(e.target.value)}>
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
            <div className="management-button">
              <button onClick={() => openModal(null)}>사원 추가</button>
            </div>
          </div>
        </div>
      </div>

      <table className="employee-table">
        <thead>
          <tr>
            <th onClick={() => requestSort("employeeNo")}>사원번호</th>
            <th onClick={() => requestSort("name")}>이름</th>
            <th onClick={() => requestSort("salary.jobTitle")}>직급</th>
            <th onClick={() => requestSort("phone")}>연락처</th>
            <th onClick={() => requestSort("hireDate")}>입사일</th>
            <th onClick={() => requestSort("hireDate")}>입사 경과일</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {paginatedEmployees.map((employee) => (
            <tr key={employee.employeeNo}>
              <td>{employee.employeeNo}</td>
              <td>{employee.name}</td>
              <td>{employee.salary?.jobTitle || '직급 없음'}</td>
              <td>{formatPhoneNumber(employee.phone)}</td>
              <td>{employee.hireDate}</td>
              <td>{employee.hireDate ? calculateEmploymentDuration(employee.hireDate) : 'N/A'}</td>
              <td>
                <div className="button-group">
                  <button className="edit-button" onClick={() => openModal(employee)}>수정</button>
                  <button className="delete-button" onClick={() => employee.employeeNo !== undefined && handleDelete(employee.employeeNo)}>
                    삭제
                  </button>
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

      {isModalOpen && selectedEmployee && (
        <div className="modal-overlay active">
          <div className="modal">
            <button className="modal-closex" onClick={closeModal}>✕</button>
            <h3>사원 상세 정보</h3>
            <div className="modal-contente">
              <div className="modal-section personnel">
                <h4>[인사 정보]</h4>
                <label>이름:</label>
                <input type="text" name="name" value={selectedEmployee.name} onChange={handleInputChange} />
                <label>직급:</label>
                <input type="text" name="jobTitle" value={selectedEmployee.salary?.jobTitle || ''} onChange={handleInputChange} />
                <label>생년월일:</label>
                <input type="date" name="birthDate" value={selectedEmployee.birthDate || ''} onChange={handleInputChange} />
                <label>성별:</label>
                <select name="gender" value={selectedEmployee.gender || ''} onChange={handleInputChange}>
                  <option value="">선택</option>
                  <option value="남성">남성</option>
                  <option value="여성">여성</option>
                </select>
                <label>연락처:</label>
                <input type="text" name="phone" value={selectedEmployee.phone} onChange={handleInputChange} />
                <label>주소:</label>
                <input type="text" name="address" value={selectedEmployee.address || ''} onChange={handleInputChange} />
                <label>입사일:</label>
                <input type="date" name="hireDate" value={selectedEmployee.hireDate || ''} onChange={handleInputChange} />
              </div>
              <div className="modal-section salary">
                <h4>[급여 정보]</h4>
                <label>기본급:</label>
                <input type="number" name="baseSalary" value={selectedEmployee.salary?.baseSalary || 0} onChange={handleInputChange} />
                <label>성과급:</label>
                <input type="number" name="bonus" value={selectedEmployee.salary?.bonus || 0} onChange={handleInputChange} />
                <label>급여 지급일:</label>
                <input type="date" name="paymentDate" value={selectedEmployee.salary?.paymentDate || ''} onChange={handleInputChange} />
                <label>총 지급 급여:</label>
                <input type="number" name="totalSalary" value={selectedEmployee.salary?.totalSalary || 0} readOnly />
              </div>
            </div>
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

export default EmployeeManagement;
