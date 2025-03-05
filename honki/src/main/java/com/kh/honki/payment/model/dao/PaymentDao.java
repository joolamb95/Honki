package com.kh.honki.payment.model.dao;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.session.SqlSession;
import org.springframework.stereotype.Repository;

import com.kh.honki.payment.model.vo.Payment;

import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class PaymentDao {

	private final SqlSession session;

	public int insertPayment(Payment payment) {
		return session.insert("payment.insertPayment", payment);
	}

	public int getLastPaymentId() {
		Integer lastPaymentId = session.selectOne("payment.getLastPaymentId");
		return (lastPaymentId != null) ? lastPaymentId : 0; // null이면 0 반환
	}

	public int getTotalRevenue() {
		return session.selectOne("payment.getTotalRevenue");
	}

	public List<Map<String, Object>> getMonthlyRevenues() {
		return session.selectList("payment.getMonthlyRevenues");
	}

	public List<Map<String, Object>> getRecentPayments() {
		return session.selectList("payment.getRecentPayments");
	}
	
}
