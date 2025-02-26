package com.kh.honki.hr.controller;

import com.kh.honki.hr.model.vo.*;
import com.kh.honki.hr.model.service.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/attendances")
public class AttendanceController {
    private final AttendanceService attendanceService;
    
    
    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @CrossOrigin(origins = {"http://localhost:5173"})
    @GetMapping
    public List<Attendance> getAllAttendances() {
        return attendanceService.getAllAttendances();
    }

    @GetMapping("/{employeeNo}")
    @CrossOrigin(origins = {"http://localhost:5173"})
    public List<Attendance> getAttendanceByEmployeeNo(@PathVariable int employeeNo) {
        return attendanceService.getAttendanceByEmployeeNo(employeeNo);
    }

    @PostMapping
    @CrossOrigin(origins = {"http://localhost:5173"})
    public void saveAttendance(@RequestBody Attendance attendance) {
        attendanceService.saveAttendance(attendance);
    }

    @PutMapping("/{attendanceNo}")
    @CrossOrigin(origins = {"http://localhost:5173"})
    public void updateAttendance(@PathVariable int attendanceNo, @RequestBody Attendance attendance) {
        attendance.setAttendanceNo(attendanceNo);
        attendanceService.updateAttendance(attendance);
    }

    @DeleteMapping("/{attendanceNo}")
    @CrossOrigin(origins = {"http://localhost:5173"})
    public void deleteAttendance(@PathVariable int attendanceNo) {
        attendanceService.deleteAttendance(attendanceNo);
    }
}
