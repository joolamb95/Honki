package com.kh.honki.order.model.vo;
import java.util.List;

import lombok.Data;
@Data
public class OrderDetailDTO {
	 private int orderNo;
	    private int tableNo;
	    private int menuNo;
	    private String menuName;
	    private int totalAmount;  // :흰색_확인_표시: 주문 수량 합산 필드
	    private int totalPrice;   // :흰색_확인_표시: 주문 금액 합산 필드
	    private List<Integer> optionList; // :흰색_확인_표시: 옵션을 , 로 묶은 필드
	    private String orderDate;
	    private int price;
	    private String optionName;
}