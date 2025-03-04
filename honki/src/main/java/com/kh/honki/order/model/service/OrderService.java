package com.kh.honki.order.model.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kh.honki.order.model.dao.OrderDao;
import com.kh.honki.order.model.vo.Order;
import com.kh.honki.orderdetail.model.dao.OrdersDetailDao;
import com.kh.honki.orderdetail.model.vo.OrdersDetail;
import com.kh.honki.payment.model.dao.PaymentDao;
import com.kh.honki.payment.model.vo.Payment;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderDao orderDao;
    private final OrdersDetailDao ordersDetailDao;
    private final PaymentDao paymentDao;

    public List<Order> getOrdersByTable(int tableNo) {
        return orderDao.getOrdersByTable(tableNo);
    }

    public List<Order> getAllOrders() {
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

}