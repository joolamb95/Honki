package com.kh.honki.hr.controller;

import java.sql.Date;
import java.time.Instant;
import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kh.honki.hr.model.service.PayrollService;
import com.kh.honki.hr.model.vo.*;
@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/payrolls")
public class PayrollController {
    private final PayrollService payrollService;

    public PayrollController(PayrollService payrollService) {
        this.payrollService = payrollService;
    }

    @GetMapping
    @CrossOrigin(origins = {"http://localhost:5173"})
    public List<Payroll> getAllPayrolls() {
        return payrollService.getAllPayrolls();
    }

    @GetMapping("/{employeeNo}")
    @CrossOrigin(origins = {"http://localhost:5173"})
    public Payroll getPayrollByEmployeeNo(@PathVariable int employeeNo) {
        return payrollService.getPayrollByEmployeeNo(employeeNo);
    }

    @PostMapping
    @CrossOrigin(origins = {"http://localhost:5173"})
    public void savePayroll(@RequestBody Payroll payroll) {
        payrollService.savePayroll(payroll);
    }
    @PutMapping("/{employeeNo}")
    @CrossOrigin(origins = {"http://localhost:5173"})
    public void updatePayroll(@PathVariable int employeeNo, @RequestBody Payroll payroll) {
        payroll.setEmployeeNo(employeeNo);
        
        // ❌ Java에서 날짜 설정 제거 (SQL에서 자동 처리)
        
        payrollService.updatePayroll(payroll);
    }

    @DeleteMapping("/{employeeNo}")
    @CrossOrigin(origins = {"http://localhost:5173"})
    public void deletePayroll(@PathVariable int employeeNo) {
        payrollService.deletePayroll(employeeNo);
    }
}
