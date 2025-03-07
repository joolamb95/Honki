package com.kh.honki.order.model.vo;

import java.sql.Date;
import java.util.List;

import com.kh.honki.orderdetail.model.vo.OrdersDetail;

import lombok.Data;


@Data
public class Order {
    private int orderNo;        // 주문 번호
    private int tableNo;        // 테이블 번호
    private int paymentId;      // 결제 번호 
    private int totalPrice;     // 총 가격 
    private String paymentMethod = "신용카드"; // 결제 방법 
    private Date orderDate;     // 주문 날짜
    
    private List<OrdersDetail> orderItems;
}