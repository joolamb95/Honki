package com.kh.honki.hr.model.vo;


import java.sql.Date;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payroll {
    private int employeeNo;  // ✅ EMPLOYEE_NO
    private String jobTitle; // ✅ JOB_TITLE
    private int baseSalary;  // ✅ 변경: basicSalary → baseSalary
    private int bonus;  // ✅ BONUS
    private int totalSalary;  // ✅ TOTAL_SALARY
    private Date lastUpdate;
    private Date paymentDate;
  
}
