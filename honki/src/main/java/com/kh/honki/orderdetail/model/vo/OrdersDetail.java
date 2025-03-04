package com.kh.honki.orderdetail.model.vo;

import java.util.List;

import lombok.Data;

@Data
public class OrdersDetail {
	private int detailNo;
	private long orderNo;          
    private int menuNo;         
    private int amount;   
    private Integer optionNo=0;// null 사용할 수 있어서 Integer로 허용했슴
    private int price;          
    private String status = "Y";
    

}

