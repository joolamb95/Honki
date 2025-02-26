package com.kh.honki.hr.model.vo;

import java.sql.Date;
import java.time.LocalDateTime;

import jakarta.persistence.PreUpdate;
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
public class Employee {
	private Integer employeeNo;  // ✅ EMPLOYEE_NO
    private String name;  // ✅ NAME
    private Date birthDate;  // ✅ BIRTH_DATE
    private String gender;  // ✅ GENDER
    private String phone;  // ✅ 변경: contact → phone
    private String address;  // ✅ ADDRESS
    private Date hireDate;  // ✅ HIRE_DATE
    private Date resignDate;  // ✅ RESIGN_DATE
    private String employeeStatus;  // ✅ 변경: status → employeeStatus
    private LocalDateTime lastUpdate; 
    private Payroll salary;

    @PreUpdate
    public void preUpdate() {
    	this.lastUpdate = LocalDateTime.now();
    }
    public String getJobTitle() {
        return salary != null ? salary.getJobTitle() : null;
    }

}

	