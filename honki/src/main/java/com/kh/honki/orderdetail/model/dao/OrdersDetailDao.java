package com.kh.honki.orderdetail.model.dao;

import java.util.List;

import org.apache.ibatis.session.SqlSession;
import org.springframework.stereotype.Repository;

import com.kh.honki.orderdetail.model.vo.OrdersDetail;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Repository
@RequiredArgsConstructor
public class OrdersDetailDao {

    private final SqlSession session;

    public int insertOrderDetail(List<OrdersDetail> orderDetails) {
        if (orderDetails == null || orderDetails.isEmpty()) {
            log.error("❌ 저장할 주문 상세 정보가 비어 있음!");
            return 0;
        }

        int count = 0;
        for (OrdersDetail detail : orderDetails) {
            try {
                int result = session.insert("ordersDetail.insertOrderDetail", detail);
                if (result > 0) count++;
            } catch (Exception e) {
                log.error("🚨 주문 상세 정보 저장 중 예외 발생! 데이터: {}", detail, e);
            }
        }
        return count;
    }

	public int getStockQuantity(int menuNo) {
		return session.selectOne("ordersDetail.getStockQuantity",menuNo);
	} 
	
	public int decreaseStock(int menuNo, int amount) {
		  return session.update("ordersDetail.decreaseStock",new OrdersDetail(menuNo, amount)); 
	}
}
