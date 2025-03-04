package com.kh.honki.order.controller;

import java.util.Collections;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kh.honki.option.service.OptionService;
import com.kh.honki.order.model.service.OrderService;
import com.kh.honki.order.model.vo.Order;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/orders")
@Slf4j

public class OrderController {

	private final OrderService service;

	@PostMapping("/create")
	public ResponseEntity<?> createOrder(@RequestBody Order order) {
	    try {
	        if (order == null || order.getOrderItems().isEmpty()) {
	            return ResponseEntity.badRequest().body("❌ 주문 목록이 비어 있습니다.");
	        }

	        int orderNo = service.createOrder(order); // ✅ 생성된 orderNo 반환
	        return ResponseEntity.ok(Collections.singletonMap("orderNo", orderNo)); // ✅ JSON으로 orderNo 반환

	    } catch (Exception e) {
	        e.printStackTrace();
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("❌ 주문 저장 실패: " + e.getMessage());
	    }
	}
}
