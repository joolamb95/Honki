package com.kh.honki.hr.model.vo;

import java.sql.Date;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Attendance {
	  private int attendanceNo;
	    private int employeeNo;
	    private String name; // ✅ 사원 이름 추가
	    private String jobTitle; // ✅ 직급 추가
	    private Date workDate;
	    private String clockIn;
	    private String clockOut;
	    private double workHours;
	    private String absenceStatus;
	}