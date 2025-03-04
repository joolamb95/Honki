package com.kh.honki.orderdetail.model.service;

import java.util.List;

import org.springframework.stereotype.Service;
import com.kh.honki.orderdetail.model.dao.OrdersDetailDao;
import com.kh.honki.orderdetail.model.vo.OrdersDetail;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RequiredArgsConstructor
@Service
@Slf4j
public class OrdersDetailService {

    private final OrdersDetailDao ordDao;

    public int insertOrderDetail(List<OrdersDetail> orderDetails) {
        if (orderDetails == null || orderDetails.isEmpty()) {
            log.error("❌ 주문 상세 정보가 비어 있음!");
            return 0;
        }

        for (OrdersDetail detail : orderDetails) {
            if (detail.getMenuNo() <= 0 || detail.getAmount() <= 0 || detail.getPrice() < 0) {
                log.error("❌ 유효하지 않은 주문 데이터 발견! {}", detail);
                return 0; 
            }
            
            if (detail.getOptionNo() == null) {
                detail.setOptionNo(0);
            }

            log.info("📌 저장할 주문 상세 데이터: {}", detail);
        }

        try {
            int result = ordDao.insertOrderDetail(orderDetails);
            if (result > 0) {
                log.info("✅ 주문 상세 정보 저장 성공! 저장된 개수: {}", result);
            } else {
                log.error("❌ 주문 상세 정보 저장 실패!");
            }
            return result;
        } catch (Exception e) {
            log.error("🚨 주문 상세 정보 저장 중 예외 발생!", e);
            return 0; 
        }
    }
}
