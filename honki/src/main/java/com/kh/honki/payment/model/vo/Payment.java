package com.kh.honki.payment.model.vo;

import java.sql.Date;

import com.kh.honki.option.model.vo.Option;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class Payment {
	private int paymentId;
	private Date paymentDate;
	private int amount;
	private String paymentMethod;
	private String status;

}
