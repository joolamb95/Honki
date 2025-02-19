package com.kh.honki.stock.model.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class StockOrder {
	private int orderId;
	private int menuNo;
	private String menuName;
	private int orderQuantity;
	private int orderAmount;
	private String orderDate;
}
