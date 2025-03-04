package com.kh.honki.orderdetail.model.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kh.honki.orderdetail.model.service.OrdersDetailService;
import com.kh.honki.orderdetail.model.vo.OrdersDetail;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/orders-detail")
@CrossOrigin(origins = "http://localhost:5173")
public class OrdersDetailController {

	private final OrdersDetailService detailservice;

	@PostMapping("/add")
	public ResponseEntity<Map<String, String>> addOrderDetails(@RequestBody Map<String, Object> requestData) {
		log.info("📌 받은 주문 상세 데이터: {}", requestData);

		long orderNo = ((Number) requestData.get("orderNo")).longValue(); // 🔥 orderNo 추출
		List<LinkedHashMap<String, Object>> detailsList = (List<LinkedHashMap<String, Object>>) requestData
				.get("details");

		if (detailsList == null || detailsList.isEmpty()) {
			return ResponseEntity.badRequest().body(Map.of("message", "❌ 요청 데이터가 비어 있습니다."));
		}

		List<OrdersDetail> orderDetails = new ArrayList<>();
		for (LinkedHashMap<String, Object> detailMap : detailsList) {
			OrdersDetail detail = new OrdersDetail();
			detail.setOrderNo(orderNo);
			detail.setMenuNo((Integer) detailMap.get("menuNo"));
			detail.setAmount((Integer) detailMap.get("amount"));

			Integer price = (Integer) detailMap.get("price") != null
					? Integer.valueOf(detailMap.get("price").toString())
					: 0;
			detail.setPrice(price);

			Integer optionNo = (Integer) detailMap.get("optionNo");

			if (price > 0) {
				detail.setOptionNo(optionNo);
				orderDetails.add(detail);

			} else {
				// optionNo가 null일 경우 해당 데이터를 저장하지 않음

			}

		}

		int result = detailservice.insertOrderDetail(orderDetails);
		if (result > 0) {
			return ResponseEntity.ok(Map.of("message", "✅ 주문 상세 정보 저장 성공"));
		} else {
			return ResponseEntity.badRequest().body(Map.of("message", "❌ 주문 상세 정보 저장 실패"));
		}
	}

}
