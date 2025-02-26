package com.kh.honki.hr.model.service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.kh.honki.hr.model.dao.AttendanceDao;
import com.kh.honki.hr.model.dao.EmployeeDao;
import com.kh.honki.hr.model.vo.*;


import jakarta.annotation.PostConstruct;

@Service
public class AttendanceService {
    private final AttendanceDao attendanceDao;
    private final EmployeeDao employeeDao;

    @Autowired
    public AttendanceService(AttendanceDao attendanceDao, EmployeeDao employeeDao) {
        this.attendanceDao = attendanceDao;
        this.employeeDao = employeeDao;
    }

    public List<Attendance> getAllAttendances() {
        return attendanceDao.findAllAttendances();
    }

    public List<Attendance> getAttendanceByEmployeeNo(int employeeNo) {
        return attendanceDao.findByEmployeeNo(employeeNo);
    }

    public void saveAttendance(Attendance attendance) {
        attendanceDao.insertAttendance(attendance);
    }

    public void updateAttendance(Attendance attendance) {
        attendanceDao.updateAttendance(attendance);
    }

    public void deleteAttendance(int attendanceNo) {
        attendanceDao.deleteAttendance(attendanceNo);
    }

    // ✅ 서버가 시작될 때 오늘 날짜의 근태 데이터가 없는 경우 자동 추가
    @PostConstruct
    public void initializeTodayAttendance() {
        LocalDate today = LocalDate.now();
        addDailyAttendanceIfNeeded(today);
    }

    // ✅ 매일 자정에 실행되는 근태 자동 추가 로직
    @Scheduled(cron = "0 0 0 * * *") // 매일 자정 실행
    public void addDailyAttendance() {
        LocalDate today = LocalDate.now();
        addDailyAttendanceIfNeeded(today);
    }

    // ✅ 오늘 날짜의 근태 데이터가 없을 경우에만 추가
    private void addDailyAttendanceIfNeeded(LocalDate date) {
        String todayStr = date.toString();

        // ✅ 오늘 날짜의 근태 데이터를 먼저 조회
        List<Attendance> todayAttendances = attendanceDao.findAttendanceByDate(todayStr);
        List<Integer> existingEmployeeNos = todayAttendances.stream()
            .map(Attendance::getEmployeeNo)
            .collect(Collectors.toList()); // ✅ 이미 등록된 사원 번호 리스트 생성

        // ✅ 기존 findAll() 사용 (이미 직급 포함)
        List<Employee> employees = employeeDao.findAll();

        for (Employee employee : employees) {
            // ✅ 이미 추가된 사원인지 확인
            if (!existingEmployeeNos.contains(employee.getEmployeeNo())) {
                Attendance newAttendance = new Attendance();
                newAttendance.setEmployeeNo(employee.getEmployeeNo());
                newAttendance.setName(employee.getName());
                newAttendance.setJobTitle(employee.getSalary().getJobTitle()); // ✅ 이제 정상적으로 동작!
                newAttendance.setWorkDate(java.sql.Date.valueOf(date));
                newAttendance.setClockIn(null);
                newAttendance.setClockOut(null);
                newAttendance.setWorkHours(0.0);
                newAttendance.setAbsenceStatus("결석"); // ✅ 기본값 설정

                attendanceDao.insertAttendance(newAttendance);
            }
        }
    }
}
