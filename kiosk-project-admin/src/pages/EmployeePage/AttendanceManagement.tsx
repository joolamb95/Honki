import React, { useContext, useState, useEffect } from 'react';
import { EmployeeContext } from './Employees';
import '../../style/AttendanceManagement.css';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

// ✅ Attendance 인터페이스
interface Attendance {
  attendanceNo: number;
  employeeNo: number;
  name: string;
  jobTitle: string;
  workDate: string;
  clockIn: string;
  clockOut: string;
  workHours: string;
  absenceStatus: string; // ✅ 지각, 결석 상태 저장
}

const AttendanceManagement: React.FC = () => {
  const context = useContext(EmployeeContext);
  if (!context) {
    throw new Error('EmployeeContext가 정의되지 않았습니다!');
  }
  const { employees } = context;
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [editRowId, setEditRowId] = useState<number | null>(null);
  const [editedAttendance, setEditedAttendance] = useState<Partial<Attendance>>({});
  const navigate = useNavigate();
  const location = useLocation();
  const [filteredAttendances, setFilteredAttendances] = useState<Attendance[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState(''); // 직급 필터
  const [sortConfig, setSortConfig] = useState<{ key: keyof Attendance | null; direction: 'asc' | 'desc' }>({
    key: null,
    direction: 'asc',
  });
  const getLocalDate = () => {
    const now = new Date();
    now.setHours(now.getHours() + 9); // ✅ 한국 시간 (KST)으로 보정
    return now.toISOString().split('T')[0];
  };
  
  const [currentDate] = useState<string>(getLocalDate()); // ✅ 현재 날짜
  

  const jobTitles = Array.from(new Set(attendances.map(att => att.jobTitle).filter(Boolean)));

  const applyFilters = () => {
    let filtered = [...attendances]; // ✅ 전체 데이터에서 필터링
  
    if (startDate && endDate) {
      filtered = filtered.filter(attendance => {
        const workDate = new Date(attendance.workDate).toISOString().split("T")[0];
        return workDate >= startDate && workDate <= endDate;
      });
    } else {
      // ✅ 날짜 필터가 없을 때 기본적으로 오늘 날짜만 표시
      filtered = attendances.filter(att => 
        new Date(att.workDate).toISOString().split("T")[0] === currentDate
      );
    }
  
    if (filter) {
      filtered = filtered.filter(att => att.jobTitle === filter);
    }
  
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(attendance =>
        String(attendance.employeeNo).includes(term) ||
        attendance.name.toLowerCase().includes(term) ||
        attendance.jobTitle.toLowerCase().includes(term)
      );
    }
  
    setFilteredAttendances(filtered);
  };
  
  
  
  
  useEffect(() => {
    applyFilters();
  }, [searchTerm, startDate, endDate, filter, attendances]);


  const resetFilters = () => {
  setStartDate('');
  setEndDate('');
  setFilter('');
  setSearchTerm('');

  // ✅ 필터 초기화 시 오늘 날짜만 보이도록 적용
  const todayAttendances = attendances.filter(att =>
    new Date(att.workDate).toISOString().split("T")[0] === currentDate
  );

  setFilteredAttendances(todayAttendances);
};

  
  const [sortedAttendances, setSortedAttendances] = useState<Attendance[]>([]);
  useEffect(() => {
    if (!sortConfig.key) {
      setSortedAttendances([...filteredAttendances]); // 정렬 키가 없으면 원본 데이터 유지
      return;
    }
  
    let sorted = [...filteredAttendances];
  
    sorted.sort((a, b) => {
      const key = sortConfig.key as keyof Attendance; // ✅ null이 아님을 보장
  
      let aValue = a[key] as string | number;
      let bValue = b[key] as string | number;
  
      if (key === "clockIn" || key === "clockOut") {
        const timeToMinutes = (time: string) => {
          if (!time || time === "-") return 0;
          const [hours, minutes] = time.split(":").map(Number);
          return hours * 60 + minutes;
        };
  
        aValue = timeToMinutes(aValue as string);
        bValue = timeToMinutes(bValue as string);
      }
  
      if (key === "workHours") {
        aValue = convertWorkHoursToNumber(aValue as string);
        bValue = convertWorkHoursToNumber(bValue as string);
      }
  
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortConfig.direction === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      } else if (typeof aValue === "number" && typeof bValue === "number") {
        return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });
  
    setSortedAttendances(sorted);
  }, [sortConfig, filteredAttendances]);
  
  const requestSort = (key: keyof Attendance) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  

  useEffect(() => {
    axios.get('http://localhost:8080/honki/api/attendances')
      .then((response) => {
        console.log("🔹 서버 응답 데이터:", response.data);
  
        const formattedData = response.data.map((att: Attendance) => ({
          ...att,
          workHours: formatWorkHours(att.workHours),
        }));
  
        setAttendances(formattedData); // ✅ 전체 데이터 저장
  
        // ✅ 처음 렌더링될 때만 오늘 날짜 데이터 필터링
        const todayAttendances = formattedData.filter((att: Attendance) => 
          new Date(att.workDate).toISOString().split("T")[0] === currentDate
        );
  
        setFilteredAttendances(todayAttendances); // ✅ 필터된 데이터 저장
        setStartDate(currentDate); // ✅ 시작 날짜를 오늘 날짜로 자동 설정
        setEndDate(currentDate); // ✅ 종료 날짜를 오늘 날짜로 자동 설정
      })
      .catch((error) => {
        console.error('🚨 근태 정보 불러오기 실패:', error);
      });
  }, []);
  
  
  

  

  const calculateWorkHours = (clockIn: string | null, clockOut: string | null): string => {
    if (!clockIn || !clockOut) return "0시간 0분"; // ✅ clockIn 또는 clockOut이 없으면 기본값 반환
  
    const [inHours, inMinutes] = clockIn.split(':').map(Number);
    const [outHours, outMinutes] = clockOut.split(':').map(Number);
  
    let totalMinutes = (outHours * 60 + outMinutes) - (inHours * 60 + inMinutes);
    if (totalMinutes < 0) totalMinutes += 24 * 60; // ✅ 야간 근무 처리
  
    return totalMinutes >= 0 ? `${Math.floor(totalMinutes / 60)}시간 ${totalMinutes % 60}분` : "0시간 0분";
  };
  




  // ✅ 출근시간에 따라 absenceStatus 자동 설정
  const determineAbsenceStatus = (clockIn: string | undefined): string => {
    if (!clockIn) return '결석';
    return clockIn > '09:00' ? '지각' : '정상';
  };

  // ✅ 수정 시작
  const handleEdit = (attendanceNo: number) => {
    setEditRowId(attendanceNo);
    const attendance = attendances.find((item) => item.attendanceNo === attendanceNo);
    if (attendance) {
      setEditedAttendance({
        ...attendance,
        clockIn: attendance.clockIn || "", // ✅ 빈 값 방지
        clockOut: attendance.clockOut || "" // ✅ 빈 값 방지
      });
    }
  };
  

  // ✅ 출근, 퇴근 입력 시 absenceStatus 자동 설정
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof Attendance) => {
    const value = e.target.value;
  
    setEditedAttendance((prevState) => {
      let newAttendance = { ...prevState, [field]: value };
  
      if (field === "clockIn" || field === "clockOut") {
        newAttendance.absenceStatus = newAttendance.clockIn
          ? determineAbsenceStatus(newAttendance.clockIn)
          : "결석";
  
        if (newAttendance.clockIn && newAttendance.clockOut) {
          const workHours = calculateWorkHours(newAttendance.clockIn, newAttendance.clockOut);
          newAttendance.workHours = formatWorkHours(convertWorkHoursToNumber(workHours));
        }
      }
  
      return newAttendance;
    });
  };
  
  

  

  const convertWorkHoursToNumber = (workHoursString: string): number => {
    if (!workHoursString || typeof workHoursString !== "string") return 0;
  
    const regex = /(\d+)시간\s*(\d*)분?/;
    const match = workHoursString.match(regex);
  
    if (match) {
      const hours = parseInt(match[1], 10) || 0;
      const minutes = parseInt(match[2] || "0", 10);
      return parseFloat((hours + minutes / 60).toFixed(2)); // ✅ 소수점 2자리 변환
    }
  
    return 0;
  };
  
  
  



  
  const formatWorkHours = (workHours: string | number): string => {
    if (!workHours || workHours === "0") return "0시간 0분";
  
    const numericHours = typeof workHours === "string" ? parseFloat(workHours) : workHours;
  
    if (isNaN(numericHours)) return "0시간 0분"; // 변환 실패 시 기본값 반환
  
    const hours = Math.floor(numericHours);
    const minutes = Math.round((numericHours % 1) * 60); // 소수점 값을 분 단위로 변환
  
    return `${hours}시간 ${minutes}분`;
  };
  
  


  
  
const fetchAttendances = async () => {
  try {
      const response = await axios.get('http://localhost:8080/honki/api/attendances');
      setAttendances(response.data);
  } catch (error) {
      console.error('🚨 근태 정보 불러오기 실패:', error);
  }
};

const handleSave = async (attendanceNo: number) => {
  try {
    const workHours = calculateWorkHours(editedAttendance.clockIn || "", editedAttendance.clockOut || "");
    const formattedWorkHours = convertWorkHoursToNumber(workHours); // ✅ 숫자로 변환

    const fixedAttendance = {
      ...editedAttendance,
      workHours: isNaN(formattedWorkHours) ? 0 : formattedWorkHours, // ✅ NaN 방지
    };

    console.log("🔹 근태 수정 요청 데이터:", JSON.stringify(fixedAttendance, null, 2));

    const response = await axios.put(
      `http://localhost:8080/honki/api/attendances/${attendanceNo}`,
      fixedAttendance
    );

    console.log("🔹 근태 수정 응답 데이터:", response.data);

    await fetchAttendances(); // ✅ 최신 데이터 반영
    setEditRowId(null);
  } catch (error) {
    console.error("🚨 근태 수정 실패:", error);
    alert("저장에 실패했습니다. 오류 로그를 확인하세요.");
  }
};




  const handleCancel = () => {
    setEditRowId(null);
    setEditedAttendance({});
  };

 
  
// ✅ 날짜 필터링 함수 (기본 데이터에서 필터링)
const filterAttendancesByDate = () => {
  return attendances.filter((attendance) => {
    if (!startDate || !endDate) return true;

    const workDate = new Date(attendance.workDate).toISOString().split("T")[0];
    const start = new Date(startDate).toISOString().split("T")[0];
    const end = new Date(endDate).toISOString().split("T")[0];

    return workDate >= start && workDate <= end;
  });
};

// ✅ 검색 + 날짜 필터링 적용
const handleSearch = () => {
  const filtered = filterAttendancesByDate().filter((attendance) => {
    if (!searchTerm) return true;

    const term = searchTerm.toLowerCase();
    return (
      String(attendance.employeeNo).includes(term) ||
      attendance.name.toLowerCase().includes(term) ||
      attendance.jobTitle.toLowerCase().includes(term)
    );
  });

  setAttendances(filtered);
};

// ✅ 날짜 변경 시 자동 필터링 적용
useEffect(() => {
  setFilteredAttendances(filterAttendancesByDate()); // ✅ 날짜가 변경될 때 필터링 적용
}, [startDate, endDate, attendances]); // ✅ attendances 변경 시 필터링 다시 적용


  
  return (
    <div className="attendance-management">
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
        <div className="content-header">근태 관리</div>

        <div className="date-section">
          <div className="date-label">시작 날짜</div>
          <div className="date-inputs">
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <span>~</span>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <button onClick={resetFilters}>필터 초기화</button>

        </div>

        <div className="search-section">
              <div className="search-box">
                {/* 직급 필터 */}
                <select 
                  className="menu-select"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="">전체</option>
                  {jobTitles.map((title) => (
                    <option key={title} value={title}>{title}</option>
                  ))}
                </select>

                {/* 검색 입력 */}
                <input 
                  type="text" 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  placeholder="사원번호, 이름, 직급 검색" 
                />
                <button onClick={applyFilters}>검색</button>
              </div>
            </div>
          </div>

      <table className="attendance-table">
        <thead>
          <tr>
             <th onClick={() => requestSort("employeeNo")}>사원번호</th>
            <th onClick={() => requestSort("name")} style={{ width: '100px' }}>이름</th>
            <th onClick={() => requestSort("jobTitle")} style={{ width: '100px' }}>직급</th>
            <th onClick={() => requestSort("workDate")}>근무날짜</th>
            <th onClick={() => requestSort("clockIn")} style={{ width: '100px' }}>출근시간</th>
            <th  onClick={() => requestSort("clockOut")} style={{ width: '100px' }}>퇴근시간</th>
            <th>근무시간</th>
            <th>근무상태</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
  {filteredAttendances.map((attendance) => (
    <tr key={attendance.attendanceNo}>
      <td>{attendance.employeeNo}</td>
      <td>{attendance.name}</td>
      <td>{attendance.jobTitle}</td>
      <td>{attendance.workDate || currentDate}</td>
      <td>
  {editRowId === attendance.attendanceNo ? (
      <input 
            type="time" 
            value={editedAttendance.clockIn || ""} 
            onChange={(e) => handleInputChange(e, "clockIn")} 
          />
        ) : (
          attendance.clockIn || "-"
        )}
      </td>
      <td>
        {editRowId === attendance.attendanceNo ? (
          <input 
            type="time" 
            value={editedAttendance.clockOut || ""} 
            onChange={(e) => handleInputChange(e, "clockOut")} 
          />
        ) : (
          attendance.clockOut || "-"
        )}
      </td>
      <td>{formatWorkHours(attendance.workHours)}</td>
      <td>{attendance.absenceStatus || "미등록"}</td>
      <td>
      <div className="button-group">
        {editRowId === attendance.attendanceNo ? (
          <>
            <button className="edit-button" onClick={() => handleSave(attendance.attendanceNo)}>저장</button>
            <button className="delete-button" onClick={handleCancel}>취소</button>
          </>
        ) : (
          <button  className="edit-button1" onClick={() => handleEdit(attendance.attendanceNo)}>수정</button>
        )}
      </div>
      </td>
    </tr>
  ))}
</tbody>




      </table>
    </div>
  );
};

export default AttendanceManagement;