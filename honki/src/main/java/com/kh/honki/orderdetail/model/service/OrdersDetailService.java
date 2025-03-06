package com.kh.honki.orderdetail.model.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kh.honki.orderdetail.model.dao.OrdersDetailDao;
import com.kh.honki.orderdetail.model.vo.OrdersDetail;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RequiredArgsConstructor
@Service
@Slf4j
public class OrdersDetailService {

    private final OrdersDetailDao ordDao;

    /**
     * 주문 상세 정보 저장 (재고 감소 포함)
     */
    @Transactional
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

            log.info("📌 주문 상세 처리 중: {}", detail);

            // ✅ 재고 확인 및 감소 처리
            int stock = ordDao.getStockQuantity(detail.getMenuNo());
            if (stock < detail.getAmount()) {
                throw new IllegalStateException("재고가 부족합니다. (메뉴 번호: " + detail.getMenuNo() + ")");
            }

            int updatedRows = ordDao.decreaseStock(detail.getMenuNo(), detail.getAmount());
            if (updatedRows == 0) {
                throw new IllegalStateException("재고 감소 실패 (다른 트랜잭션에서 변경됨).");
            }
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