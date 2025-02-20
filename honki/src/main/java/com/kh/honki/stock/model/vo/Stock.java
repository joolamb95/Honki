package com.kh.honki.stock.model.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Stock {
	private int menuNo;
	private String menuName;
	private int stockQuantity;
	private String stockLastUpdate;
	private String stockStatus;
}
