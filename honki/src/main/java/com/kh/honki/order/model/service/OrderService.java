package com.kh.honki.order.model.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kh.honki.order.model.dao.OrderDao;
import com.kh.honki.order.model.vo.Order;
import com.kh.honki.order.model.vo.OrderDetailDTO;
import com.kh.honki.orderdetail.model.dao.OrdersDetailDao;
import com.kh.honki.orderdetail.model.vo.OrdersDetail;
import com.kh.honki.payment.model.dao.PaymentDao;
import com.kh.honki.payment.model.vo.Payment;
import com.kh.honki.utils.DateUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderDao orderDao;
    private final OrdersDetailDao ordersDetailDao;
    private final PaymentDao paymentDao;

    public List<OrderDetailDTO> getOrdersByTable(int tableNo) {
        return orderDao.getOrdersByTable(tableNo);
    }

    public List<OrdersDetail> getAllOrders() {
        return orderDao.getAllOrders();
    }

	
    
    @Transactional
    public int createOrder(Order order) {
        Payment payment = new Payment();
        payment.setPaymentMethod(order.getPaymentMethod());
        payment.setAmount(order.getTotalPrice());
        payment.setStatus("Y");

        int paymentResult = paymentDao.insertPayment(payment);
        if (paymentResult == 0) {
            throw new IllegalStateException("❌ 결제 정보 저장 실패");
        }

        int paymentId = paymentDao.getLastPaymentId();
        if (paymentId == 0) {
            throw new IllegalStateException("❌ 결제 정보가 정상적으로 저장되지 않았습니다.");
        }
        order.setPaymentId(paymentId);

        // ✅ 주문 저장
        int orderNo = orderDao.createOrder(order);
        order.setOrderNo(orderNo);  // 🔥 직접 설정

        if (order.getOrderNo() == 0) {
            throw new IllegalStateException("❌ 주문 저장 실패");
        }

        for (OrdersDetail detail : order.getOrderItems()) {
            detail.setOrderNo(order.getOrderNo());
        }
        ordersDetailDao.insertOrderDetail(order.getOrderItems());

        return order.getOrderNo();
    }

    public List<Integer> getOrderNosByTableNo(int tableNo) {
    	return orderDao.getOrderNosByTableNo(tableNo);
    }
    
	public int clearOrdersByTable(List<Integer> list) {
		return orderDao.clearOrdersByTable(list);
	}

	public int getTotalOrders() {
		return orderDao.getTotalOrders();
	}

	public int getTotalRevenue() {
		return paymentDao.getTotalRevenue();
	}

	public List<Map<String, Object>> getMonthlyRevenues() {
		List<Map<String, Object>> rawRevenues = paymentDao.getMonthlyRevenues();
		 List<String> lastSixMonths = DateUtils.getLastSixMonths();
		 
		    Map<String, Integer> revenueMap = rawRevenues.stream()
		    	    .collect(Collectors.toMap(m -> (String) m.get("MONTH"), 
                            m -> ((BigDecimal) m.get("TOTAL_REVENUE")).intValue(), 
                            (a, b) -> b));

		    List<Map<String, Object>> result = new ArrayList<>();
		    for (String month : lastSixMonths) {
		        Map<String, Object> data = new HashMap<>();
		        data.put("month", month);
		        data.put("revenue", revenueMap.getOrDefault(month, 0));
		        result.add(data);
		    }
		    return result;
		
	}

	public List<Map<String, Object>> getRecentPaymentsWithTax() {
		List<Map<String, Object>> payments = paymentDao.getRecentPayments();
		
		 return payments.stream().map(payment -> {
	            BigDecimal amount = (BigDecimal) payment.get("AMOUNT");
	            BigDecimal tax = amount.multiply(new BigDecimal("0.1"));
	            BigDecimal netAmount = amount.subtract(tax);

	            return Map.of(
	                "title", payment.get("PAYMENT_METHOD"),
	                "amount", amount.intValue(),
	                "tax", "10%",
	                "total", netAmount.intValue()
	            );
	        }).collect(Collectors.toList());
	}


}