package com.kh.honki.payment.model.dao;

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

}
