package com.kh.honki.stock.controller;

import java.util.List;
import java.util.ArrayList;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.kh.honki.option.model.vo.Option;
import com.kh.honki.stock.model.service.StockService;
import com.kh.honki.stock.model.vo.Stock;
import com.kh.honki.stock.model.vo.StockOrder;
import com.kh.honki.stock.model.vo.StockOption;


import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.RequestParam;


@Slf4j
@RestController
@RequiredArgsConstructor
public class StockController {
	
	private final StockService stockService;
	
	@GetMapping("/stock")
	@CrossOrigin(origins = "http://localhost:5173")
	public ResponseEntity<List<Stock>> getStockList() {
		try {
			List<Stock> stockList = stockService.StockList();
			return ResponseEntity.ok(stockList);
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
		}
	}
	
	@PostMapping("/stock/order")
	@CrossOrigin(origins = "http://localhost:5173")
	public ResponseEntity<String> orderStock(@RequestBody StockOrder stockOrder) {
		try {
//			log.info("재고 주문 요청: {}", stockOrder);
			stockService.orderStock(stockOrder);
//			log.info("재고 주문 성공");
			return ResponseEntity.ok("재고 주문 성공");
		} catch(Exception e) {
			log.error("재고 주문 실패: ", e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("재고 주문 실패");
		}
	}
	
	@GetMapping("/stock/postpone")
	@CrossOrigin(origins = "http://localhost:5173")
	public ResponseEntity<List<StockOrder>> getPostponeOrders() {
		return ResponseEntity.ok(stockService.getPostponeOrders());
	}
	
	@GetMapping("/stock/history")
	@CrossOrigin(origins = "http://localhost:5173")
	public ResponseEntity<List<StockOrder>> getOrderHistory() {
		return ResponseEntity.ok(stockService.getOrderHistory());
	}
	
	@PostMapping("/stock/orders/{orderId}/approve")
	@CrossOrigin(origins = "http://localhost:5173")
	public ResponseEntity<String> approveOrder(@PathVariable int orderId) {
		stockService.approveOrder(orderId);
		return ResponseEntity.ok("주문이 승인되었습니다.");
	}
	
	@PostMapping("/stock/orders/{orderId}/cancel")
	@CrossOrigin(origins = "http://localhost:5173")
	public ResponseEntity<String> cancelOrder(@PathVariable int orderId) {
		stockService.cancelOrder(orderId);
		return ResponseEntity.ok("주문이 취소되었습니다.");
	}
	
	@GetMapping("/stock/options")
	@CrossOrigin(origins = "http://localhost:5173")
	public ResponseEntity<List<StockOption>> getStockOptionList() {
		try {
			List<StockOption> stockOptionList = stockService.StockOptionList();
			return ResponseEntity.ok(stockOptionList);
		} catch(Exception e) {
			log.error("옵션 재고 목록 조회 실패: ", e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
		}
	}
	
}