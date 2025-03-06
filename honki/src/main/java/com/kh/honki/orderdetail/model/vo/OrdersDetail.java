package com.kh.honki.orderdetail.model.vo;

import java.util.List;

import lombok.Data;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class OrdersDetail {
	private Integer detailId; // null 값 처리
	private long orderNo;          
    private int menuNo;
    private String menuName; // 메뉴이름을 저장할 필드
    private int amount;   
    private Integer optionNo=0;// null 사용할 수 있어서 Integer로 허용했슴
    private int price;
    private int totalPrice;
    private String status = "Y";
    
    public OrdersDetail(int menuNo, int amount) {
        this.menuNo = menuNo;
        this.amount = amount;
    }
    
}

