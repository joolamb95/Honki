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
	private int itemNo;      // MENU_NO 또는 OPTION_NO
	private String itemType; // 'M' 또는 'O'
	private String itemName; // 메뉴명 또는 옵션명
	private int orderQuantity;
	private int orderAmount;
	private String orderDate;
	private String status;
}
