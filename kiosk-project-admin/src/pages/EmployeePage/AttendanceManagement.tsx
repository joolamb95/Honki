import React, { useContext, useState, useEffect, useCallback } from 'react';
import { EmployeeContext } from './Employees';
import '../../style/AttendanceManagement.css';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import TimePicker from './TimPicker';

// ✅ Attendance 인터페이스
interface Attendance {
  attendanceNo: number;
  employeeNo: number;
  name: string;
  jobTitle: string;
  workDate: string;
  clockIn: string;    // "09:00 AM" 등 AM/PM 형식이라고 가정
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
  const [filteredAttendances, setFilteredAttendances] = useState<Attendance[]>([]);
  const [sortedAttendances, setSortedAttendances] = useState<Attendance[]>([]);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState(''); // 직급 필터

  const [editRowId, setEditRowId] = useState<number | null>(null);
  const [editedAttendance, setEditedAttendance] = useState<Partial<Attendance>>({});

  const navigate = useNavigate();
  const location = useLocation();

  const [sortConfig, setSortConfig] = useState<{
    key: keyof Attendance | null;
    direction: 'asc' | 'desc';
  }>({
    key: null,
    direction: 'asc',
  });

  // 오늘 날짜(한국 시간 기준) 가져오기
  const getLocalDate = () => {
    const now = new Date();
    now.setHours(now.getHours() + 9); // ✅ 한국 시간 (KST)으로 보정
    return now.toISOString().split('T')[0];
  };
  const [currentDate] = useState<string>(getLocalDate());

  // =====================
  // 1) 서버에서 근태 데이터 가져오기
  // =====================
  useEffect(() => {
    axios
      .get('http://localhost:8080/honki/api/attendances')
      .then((response) => {
        console.log('🔹 서버 응답 데이터:', response.data);

        // workHours를 "X시간 X분" 형태로 맞춰주는 예시
        const formattedData = response.data.map((att: Attendance) => ({
          ...att,
          workHours: formatWorkHours(att.workHours),
        }));

        setAttendances(formattedData);

        // 처음엔 오늘 날짜만 필터링해서 표시
        const todayAttendances = formattedData.filter(
          (att: Attendance) =>
            new Date(att.workDate).toISOString().split('T')[0] === currentDate
        );
        setFilteredAttendances(todayAttendances);

        // 날짜 선택도 오늘 날짜로 맞춤
        setStartDate(currentDate);
        setEndDate(currentDate);
      })
      .catch((error) => {
        console.error('🚨 근태 정보 불러오기 실패:', error);
      });
  }, [currentDate]);

  // 직급 목록 추출
  const jobTitles = Array.from(
    new Set(attendances.map((att) => att.jobTitle).filter(Boolean))
  );

  // =====================
  // 2) 필터 로직
  // =====================
  const applyFilters = () => {
    let filtered = [...attendances];

    // (1) 날짜 필터
    if (startDate && endDate) {
      filtered = filtered.filter((attendance) => {
        const workDate = new Date(attendance.workDate)
          .toISOString()
          .split('T')[0];
        return workDate >= startDate && workDate <= endDate;
      });
    } else {
      // 시작/종료 날짜가 없으면, 오늘 날짜만 보여주기
      filtered = attendances.filter(
        (att) =>
          new Date(att.workDate).toISOString().split('T')[0] === currentDate
      );
    }

    // (2) 직급 필터
    if (filter) {
      filtered = filtered.filter((att) => att.jobTitle === filter);
    }

    // (3) 검색어 필터 (사번, 이름, 직급)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((attendance) => {
        const name = attendance.name || '';
        const jobTitle = attendance.jobTitle || '';
        return (
          String(attendance.employeeNo).includes(term) ||
          name.toLowerCase().includes(term) ||
          jobTitle.toLowerCase().includes(term)
        );
      });
    }

    setFilteredAttendances(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [searchTerm, startDate, endDate, filter, attendances]);

  // 필터 초기화
  const resetFilters = () => {
    setStartDate('');
    setEndDate('');
    setFilter('');
    setSearchTerm('');

    // 초기화 시 전체 보이려면:
    // setFilteredAttendances([...attendances]);
    // 오늘만 보이려면:
    const todayAttendances = attendances.filter(
      (att) =>
        new Date(att.workDate).toISOString().split('T')[0] === currentDate
    );
    setFilteredAttendances(todayAttendances);
  };

  // =====================
  // 3) 정렬 로직
  // =====================
  useEffect(() => {
    if (!sortConfig.key) {
      setSortedAttendances([...filteredAttendances]);
      return;
    }

    let sorted = [...filteredAttendances];
    sorted.sort((a, b) => {
      const key = sortConfig.key as keyof Attendance;
      let aValue = a[key] as string | number;
      let bValue = b[key] as string | number;

      // clockIn / clockOut 정렬 시 "hh:mm AM/PM" 문자열을 분으로 바꿔 비교
      if (key === 'clockIn' || key === 'clockOut') {
        const timeToMinutes = (time: string) => {
          if (!time || time === '-') return 0;
          const match = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
          if (!match) return 0;
          let [_, hh, mm, period] = match;
          let h = parseInt(hh, 10);
          let m = parseInt(mm, 10);
          period = period.toUpperCase();

          if (period === 'PM' && h !== 12) h += 12;
          if (period === 'AM' && h === 12) h = 0;
          return h * 60 + m;
        };
        aValue = timeToMinutes(aValue as string);
        bValue = timeToMinutes(bValue as string);
      }

      // workHours 정렬 시 "X시간 X분"을 숫자로
      if (key === 'workHours') {
        aValue = convertWorkHoursToNumber(aValue as string);
        bValue = convertWorkHoursToNumber(bValue as string);
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
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

  // =====================
  // 4) 페이징 로직 (클라이언트 사이드)
  // =====================
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10; // 한 페이지에 10개씩
  const totalPages = Math.ceil(sortedAttendances.length / itemsPerPage);

  // 현재 페이지에 해당하는 attendances만 slice
  const paginatedAttendances = sortedAttendances.slice(
    (currentPage - 1) * itemsPerPage,
    (currentPage - 1) * itemsPerPage + itemsPerPage
  );

  // =====================
  // 5) 근태 수정 로직
  // =====================
  // (a) 수정 모드 진입
  const handleEdit = (attendanceNo: number) => {
    setEditRowId(attendanceNo);
    const attendance = attendances.find(
      (item) => item.attendanceNo === attendanceNo
    );
    if (attendance) {
      // 기존에 DB에서 가져온 clockIn, clockOut을 그대로 넣어준다
      setEditedAttendance({
        clockIn: attendance.clockIn || '',
        clockOut: attendance.clockOut || '',
      });
    }
  };

  // (b) TimePicker로부터 입력 받기
  const handleInputChange = useCallback((field: keyof Attendance, value: string) => {
    setEditedAttendance((prevState) => {
      if (prevState[field] === value) return prevState; // 값이 안 바뀌면 업데이트 X

      let newAttendance = { ...prevState, [field]: value };

      if (field === 'clockIn' || field === 'clockOut') {
        newAttendance.absenceStatus = newAttendance.clockIn
          ? determineAbsenceStatus(newAttendance.clockIn)
          : '결석';

        if (newAttendance.clockIn && newAttendance.clockOut) {
          newAttendance.workHours = calculateWorkHours(
            newAttendance.clockIn,
            newAttendance.clockOut
          );
        }
      }
      return newAttendance;
    });
  }, []);

  // (c) 저장
  const handleSave = async (attendanceNo: number) => {
    try {
      const workHours = calculateWorkHours(
        editedAttendance.clockIn || '',
        editedAttendance.clockOut || ''
      );
      const formattedWorkHours = convertWorkHoursToNumber(workHours);

      // absenceStatus 값이 없을 경우 자동으로 설정
      const absenceStatus = editedAttendance.clockIn
        ? determineAbsenceStatus(editedAttendance.clockIn)
        : '결석';

      const fixedAttendance = {
        ...editedAttendance,
        workHours: isNaN(formattedWorkHours) ? 0 : formattedWorkHours,
        absenceStatus,
      };

      console.log('🔹 근태 수정 요청 데이터:', JSON.stringify(fixedAttendance, null, 2));

      await axios.put(
        `http://localhost:8080/honki/api/attendances/${attendanceNo}`,
        fixedAttendance
      );

      // 수정 후 최신 데이터 다시 불러오기
      const response = await axios.get('http://localhost:8080/honki/api/attendances');
      setAttendances(response.data);

      setEditRowId(null);
    } catch (error) {
      console.error('🚨 근태 수정 실패:', error);
      alert('저장에 실패했습니다. 오류 로그를 확인하세요.');
    }
  };

  // (d) 취소
  const handleCancel = () => {
    setEditRowId(null);
    setEditedAttendance({});
  };

  // =====================
  // 6) 유틸 함수
  // =====================
  // "09:00 AM", "10:30 PM" 등으로부터 근무시간 "X시간 X분" 계산
  const calculateWorkHours = (clockIn: string | null, clockOut: string | null): string => {
    if (!clockIn || !clockOut || clockIn === '-' || clockOut === '-') {
      return '0시간 0분';
    }

    const parseTime = (time: string) => {
      const match = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!match) return NaN;
      let [_, hh, mm, period] = match;
      let h = parseInt(hh, 10);
      let m = parseInt(mm, 10);
      period = period.toUpperCase();

      if (period === 'PM' && h !== 12) h += 12;
      if (period === 'AM' && h === 12) h = 0;
      return h * 60 + m;
    };

    let clockInMinutes = parseTime(clockIn);
    let clockOutMinutes = parseTime(clockOut);

    if (isNaN(clockInMinutes) || isNaN(clockOutMinutes)) {
      return '0시간 0분';
    }

    // 퇴근이 출근보다 이른 경우(자정 넘기는 야근 등) 24시간 추가
    if (clockOutMinutes < clockInMinutes) {
      clockOutMinutes += 24 * 60;
    }

    const totalMinutes = clockOutMinutes - clockInMinutes;
    return `${Math.floor(totalMinutes / 60)}시간 ${totalMinutes % 60}분`;
  };

  // 지각/결석/정상 여부 판별
  const determineAbsenceStatus = (clockIn: string | undefined): string => {
    if (!clockIn) return '결석';

    const match = clockIn.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return '결석';
    let [_, hh, mm, period] = match;
    let h = parseInt(hh, 10);
    let m = parseInt(mm, 10);
    period = period.toUpperCase();

    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;

    const total = h * 60 + m;
    // 9시 = 540분
    return total > 540 ? '지각' : '정상';
  };

  // "X시간 X분" → 숫자(소수점) 변환
  const convertWorkHoursToNumber = (workHoursString: string): number => {
    if (!workHoursString || typeof workHoursString !== 'string') return 0;
    const regex = /(\d+)시간\s*(\d+)분/;
    const match = workHoursString.match(regex);
    if (match) {
      const hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      return parseFloat((hours + minutes / 60).toFixed(2));
    }
    return 0;
  };

  // DB나 API가 "5.5"처럼 숫자를 준다면, "5시간 30분" 형태로 바꾸는 예시
  const formatWorkHours = (workHours: string | number): string => {
    if (!workHours || workHours === '0') return '0시간 0분';

    const numeric = typeof workHours === 'string' ? parseFloat(workHours) : workHours;
    if (isNaN(numeric)) return '0시간 0분';

    const hours = Math.floor(numeric);
    const minutes = Math.round((numeric % 1) * 60);
    return `${hours}시간 ${minutes}분`;
  };

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

        {/* 날짜 필터 */}
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
          <button onClick={resetFilters}>필터 초기화</button>
        </div>

        {/* 검색/직급 필터 */}
        <div className="search-section">
          <div className="search-box">
            <select
              className="menu-select"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="">전체</option>
              {jobTitles.map((title) => (
                <option key={title} value={title}>
                  {title}
                </option>
              ))}
            </select>
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
            <th onClick={() => requestSort('employeeNo')}style={{ width: '50px' }}>사원번호</th>
            <th onClick={() => requestSort('name')} style={{ width: '100px' }}>
              이름
            </th>
            <th onClick={() => requestSort('jobTitle')} style={{ width: '100px' }}>
              직급
            </th>
            <th onClick={() => requestSort('workDate')}>근무날짜</th>
            <th onClick={() => requestSort('clockIn')} style={{ width: '130px' }}>
              출근시간
            </th>
            <th onClick={() => requestSort('clockOut')} style={{ width: '130px' }}>
              퇴근시간
            </th>
            <th onClick={() => requestSort('workHours')}style={{ width: '30x' }}>근무시간</th>
            <th>근무상태</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {paginatedAttendances.map((attendance) => (
            <tr key={attendance.attendanceNo}>
              <td>{attendance.employeeNo}</td>
              <td>
                {attendance.name}
                {employees.find(emp => emp.employeeNo === attendance.employeeNo)?.employeeStatus === "false" && (
                  <span className="resigned-label"> (퇴사)</span>
                )}
              </td>
              <td>{attendance.jobTitle}</td>
              <td>{attendance.workDate || currentDate}</td>
              <td>
                {editRowId === attendance.attendanceNo ? (
                  <TimePicker
                    value={
                      editedAttendance.clockIn !== undefined
                        ? editedAttendance.clockIn
                        : attendance.clockIn || ''
                    }
                    onChange={(newTime: string) => handleInputChange('clockIn', newTime)}
                  />
                ) : (
                  attendance.clockIn || '-'
                )}
              </td>
              <td>
                {editRowId === attendance.attendanceNo ? (
                  <TimePicker
                    value={
                      editedAttendance.clockOut !== undefined
                        ? editedAttendance.clockOut
                        : attendance.clockOut || ''
                    }
                    onChange={(newTime: string) => handleInputChange('clockOut', newTime)}
                  />
                ) : (
                  attendance.clockOut || '-'
                )}
              </td>
              <td>{calculateWorkHours(attendance.clockIn, attendance.clockOut)}</td>
              <td>{attendance.absenceStatus || '미등록'}</td>
              <td>
                <div className="button-group">
                  {editRowId === attendance.attendanceNo ? (
                    <>
                      <button
                        className="edit-button"
                        onClick={() => handleSave(attendance.attendanceNo)}
                      >
                        저장
                      </button>
                      <button className="delete-button" onClick={handleCancel}>
                        취소
                      </button>
                    </>
                  ) : (
                    <button
                      className="edit-button1"
                      onClick={() => handleEdit(attendance.attendanceNo)}
                    >
                      수정
                    </button>
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

export default AttendanceManagement;
