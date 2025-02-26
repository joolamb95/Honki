package com.kh.honki.hr.model.service;

import com.kh.honki.hr.model.dao.*;
import com.kh.honki.hr.model.vo.*;
import org.springframework.stereotype.Service;

import java.sql.Date;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class PayrollService {
	private final PayrollDao payrollDao;

	public PayrollService(PayrollDao payrollDao) {
        this.payrollDao = payrollDao;
    }

    public List<Payroll> getAllPayrolls() {
        return payrollDao.findAll();
    }

    public Payroll getPayrollByEmployeeNo(int employeeNo) {
        return payrollDao.findByEmployeeNo(employeeNo);
    }

    public void savePayroll(Payroll payroll) {
    	payrollDao.insertPayroll(payroll);
    }

    public void updatePayroll(Payroll payroll) {
        payrollDao.updatePayroll(payroll);
    }

    public void updatePayrollPaymentDate(int employeeNo) {
        Payroll payroll = payrollDao.findByEmployeeNo(employeeNo);
        if (payroll != null) {
            payrollDao.updatePayroll(payroll);
        }
    }
      
    
    public void deletePayroll(int employeeNo) {
    	payrollDao.deletePayroll(employeeNo);
    }
}
