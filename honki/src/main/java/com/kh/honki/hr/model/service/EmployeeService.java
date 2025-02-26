package com.kh.honki.hr.model.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.kh.honki.hr.model.dao.AttendanceDao;
import com.kh.honki.hr.model.dao.EmployeeDao;
import com.kh.honki.hr.model.vo.*;

@Service
public class EmployeeService {
    private final EmployeeDao employeeDao;
    private final AttendanceDao attendanceDao;

    @Autowired
    public EmployeeService(EmployeeDao employeeDao, AttendanceDao attendanceDao) {
        this.employeeDao = employeeDao;
        this.attendanceDao = attendanceDao;
    }

    public List<Employee> getAllEmployees() {
        return employeeDao.findAll();
    }

    public Employee getEmployeeById(int employeeNo) {
        return employeeDao.findById(employeeNo);
    }

    public void saveEmployee(Employee employee) {
        employeeDao.insertEmployee(employee); // ✅ 사원 추가
        addAttendanceForNewEmployee(employee.getEmployeeNo()); // ✅ 근태 기록 추가
    }

    public void updateEmployee(Employee employee) {
        employee.setLastUpdate(LocalDateTime.now());
        employeeDao.updateEmployee(employee);
    }

    public void deleteEmployee(int employeeNo) {
        employeeDao.deleteEmployee(employeeNo);
    }

    // ✅ 새 직원 추가 시 자동으로 근태 정보도 추가
    private void addAttendanceForNewEmployee(int employeeNo) {
        Attendance attendance = new Attendance();
        attendance.setEmployeeNo(employeeNo);
        attendance.setWorkDate(java.sql.Date.valueOf(LocalDate.now())); // ✅ 오늘 날짜
        attendance.setClockIn(null); // 출근시간 없음
        attendance.setClockOut(null); // 퇴근시간 없음
        attendance.setWorkHours(0.0);
        attendance.setAbsenceStatus("결석");

        attendanceDao.insertAttendance(attendance); // ✅ DB에 근태 데이터 추가
    }
}
