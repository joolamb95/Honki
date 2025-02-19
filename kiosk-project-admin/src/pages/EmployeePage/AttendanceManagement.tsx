import React, { useContext, useState } from 'react';
import { EmployeeContext } from './Employees'; // EmployeeContext와 연동
import '../../style/AttendanceManagement.css';
import { useNavigate, useLocation } from 'react-router-dom';

interface Attendance {
  id: string;
  name: string;
  position: string;
  workDate: string;
  clockIn: string;
  clockOut: string;
  workHours: string;
  status: string;
}

const AttendanceManagement: React.FC = () => {
  const context = useContext(EmployeeContext);
  if (!context) {
    throw new Error('EmployeeContext가 정의되지 않았습니다!');
  }
  const { employees } = context;

  const getCurrentDate = (): string => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const [attendances, setAttendances] = useState<Attendance[]>(
    employees.map((emp) => ({
      id: emp.id,
      name: emp.name,
      position: emp.position,
      workDate: getCurrentDate(),
      clockIn: '',
      clockOut: '',
      workHours: '0시간 0분',
      status: '미기입',
    }))
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [statusFilter, setStatusFilter] = useState<string>(''); // 상태 필터 추가
  const [startDate, setStartDate] = useState<string>(''); // 시작 날짜 필터 추가
  const [endDate, setEndDate] = useState<string>(''); // 종료 날짜 필터 추가
  const itemsPerPage = 5;
  const [editRowId, setEditRowId] = useState<string | null>(null);
  const [editedAttendance, setEditedAttendance] = useState<Partial<Attendance>>({});

  const calculateWorkHours = (clockIn: string, clockOut: string): string => {
    const [inHours, inMinutes] = clockIn.split(':').map(Number);
    const [outHours, outMinutes] = clockOut.split(':').map(Number);

    const start = inHours * 60 + inMinutes;
    const end = outHours * 60 + outMinutes;
    const totalMinutes = end - start;

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours}시간 ${minutes}분`;
  };

  const handleEdit = (id: string) => {
    setEditRowId(id);
    const attendance = attendances.find((item) => item.id === id);
    if (attendance) {
      setEditedAttendance({ ...attendance });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof Attendance) => {
    const value = e.target.value;

    if (field === 'clockIn' || field === 'clockOut') {
      const newAttendance = { ...editedAttendance, [field]: value };
      if (newAttendance.clockIn && newAttendance.clockOut) {
        newAttendance.workHours = calculateWorkHours(newAttendance.clockIn, newAttendance.clockOut);
      }
      if (field === 'clockIn' && value > '09:00') {
        newAttendance.status = '지각';
      } else if (field === 'clockIn') {
        newAttendance.status = '정상';
      }
      setEditedAttendance(newAttendance);
    } else {
      setEditedAttendance({ ...editedAttendance, [field]: value });
    }
  };

  const handleSave = (id: string) => {
    setAttendances((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...editedAttendance } : item))
    );
    setEditRowId(null);
    setEditedAttendance({});
  };

  const handleCancel = () => {
    setEditRowId(null);
    setEditedAttendance({});
  };

  const filteredAttendances = attendances.filter((attendance) => {
    const matchesSearch =
      attendance.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attendance.position.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter ? attendance.status === statusFilter : true;

    const matchesDate =
      (!startDate || attendance.workDate >= startDate) &&
      (!endDate || attendance.workDate <= endDate);

    return matchesSearch && matchesStatus && matchesDate;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAttendances = filteredAttendances.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="attendance-management">
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
        <div className="content-header">근태 관리</div>
        
        <div className="date-section">
            <div className="date-label">시작 날짜</div>
            <div className="date-inputs">
                <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                />
                <span>~</span>
                <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                />
            </div>
        </div>

        <div className="search-section">
            <div className="search-box">
                <select 
                    className="menu-select"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                >
                    <option value="전체">전체</option>
                    <option value="사원번호">사원번호</option>
                    <option value="이름">이름</option>
                    <option value="직급">직급</option>
                </select>
                <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="검색어를 입력하세요"
                />
                <button onClick={() => {}}>검색</button>
            </div>
        </div>
      </div>

      <table className="attendance-table">
        <thead>
          <tr>
            <th>사원번호</th>
            <th style={{ width: '100px' }}>이름</th>
            <th style={{ width: '100px' }}>직급</th>
            <th>근무날짜</th>
            <th style={{ width: '100px' }}>출근시간</th>
            <th style={{ width: '100px' }}>퇴근시간</th>
            <th>근무시간</th>
            <th>근태 상태</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {currentAttendances.map((attendance) => (
            <tr key={attendance.id}>
              <td>{attendance.id}</td>
              <td>{attendance.name}</td>
              <td>{attendance.position}</td>
              <td>
                {editRowId === attendance.id ? (
                  <input
                    type="date"
                    value={editedAttendance.workDate || ''}
                    onChange={(e) => handleInputChange(e, 'workDate')}
                  />
                ) : (
                  attendance.workDate
                )}
              </td>
              <td>
                {editRowId === attendance.id ? (
                  <input
                    type="time"
                    value={editedAttendance.clockIn || ''}
                    onChange={(e) => handleInputChange(e, 'clockIn')}
                  />
                ) : (
                  attendance.clockIn
                )}
              </td>
              <td>
                {editRowId === attendance.id ? (
                  <input
                    type="time"
                    value={editedAttendance.clockOut || ''}
                    onChange={(e) => handleInputChange(e, 'clockOut')}
                  />
                ) : (
                  attendance.clockOut
                )}
              </td>
              <td>{attendance.workHours}</td>
              <td>{attendance.status}</td>
              <td>
                {editRowId === attendance.id ? (
                  <>
                    <button onClick={() => handleSave(attendance.id)}>저장</button>
                    <button onClick={handleCancel}>취소</button>
                  </>
                ) : (
                  <div className="button-group">
                    <button  className="edit-button" onClick={() => handleEdit(attendance.id)}>수정</button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        {[...Array(Math.ceil(filteredAttendances.length / itemsPerPage)).keys()].map((num) => (
          <button
            key={num + 1}
            onClick={() => paginate(num + 1)}
            className={currentPage === num + 1 ? 'active' : ''}
          >
            {num + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AttendanceManagement;
