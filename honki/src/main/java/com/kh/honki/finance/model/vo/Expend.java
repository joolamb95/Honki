package com.kh.honki.finance.model.vo;

import java.sql.Date;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Expend {

	private int expendNo;
	private String category;
	private int amount;
	private String description;
	private Date expendDate;
	private String status; // 'N': 정상, 'Y': 삭제됨
}
