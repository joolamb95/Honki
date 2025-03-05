package com.kh.honki.order.controller;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kh.honki.order.model.service.OrderService;
import com.kh.honki.order.model.vo.Order;
import com.kh.honki.order.model.vo.OrderDetailDTO;
import com.kh.honki.orderdetail.model.vo.OrdersDetail;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/orders")
@Slf4j

public class OrderController {

	private final OrderService service;
	private final SimpMessagingTemplate messagingTemplate;

	// 주문 생성
	@PostMapping("/create")
	public ResponseEntity<?> createOrder(@RequestBody Order order) {
	    try {
	        if (order == null || order.getOrderItems().isEmpty()) {
	            return ResponseEntity.badRequest().body("❌ 주문 목록이 비어 있습니다.");
	        }
	        
	        int orderNo = service.createOrder(order); // ✅ 생성된 orderNo 반환
	        messagingTemplate.convertAndSend("/topic/orders/update", service.getOrdersByTable(order.getTableNo()));
	        messagingTemplate.convertAndSend("/topic/orders/update", service.getAllOrders());
	        return ResponseEntity.ok(Collections.singletonMap("orderNo", orderNo)); // ✅ JSON으로 orderNo 반환

	    } catch (Exception e) {
	        e.printStackTrace();
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("❌ 주문 저장 실패: " + e.getMessage());
	    }
	}
	
	// 전체 테이블의 주문 내역 조회 API
	@GetMapping("/all")
	public ResponseEntity<List<OrdersDetail>> getOrders(){
        log.info("📌 [전체 테이블] 주문 내역 조회 요청");
        try {
            List<OrdersDetail> orders = service.getAllOrders();
            log.info("📌 [전체 테이블] 주문 내역 조회 내역 : {}",orders);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            log.error("❌ 주문 내역 조회 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
		
	}
	
	 // ✅ 특정 테이블의 주문 내역 조회 API 추가
    @GetMapping("/table/{tableNo}")
    public ResponseEntity<List<OrderDetailDTO>> getOrdersByTable(@PathVariable int tableNo) {
        log.info("📌 [테이블 {}] 주문 내역 조회 요청", tableNo);
        
        try {
            List<OrderDetailDTO> orders = service.getOrdersByTable(tableNo);
            System.out.println("📌 API 응답 데이터: " + orders); // ✅ 로그 출력
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            log.error("❌ 테이블 {} 주문 내역 조회 실패", tableNo, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    
    // 특정 테이블의 주문 내역 삭제
    @PutMapping("/clear/{tableNo}")
    public ResponseEntity<String> clearOrdersByTable(@PathVariable int tableNo) {
        log.info("🗑 테이블 {}의 주문 내역 삭제 요청", tableNo);
        
        List<Integer> orderNos = service.getOrderNosByTableNo(tableNo);
        
        if (orderNos.isEmpty()) {
            log.warn("⚠️ 테이블 {}의 주문 내역이 존재하지 않습니다.", tableNo);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("테이블 " + tableNo + "의 주문 내역이 없습니다.");
        }

        int result = service.clearOrdersByTable(orderNos);
        
        if(result>0) {
        	 log.info("✅ 테이블 {}의 주문 내역 삭제 완료", tableNo);
        	// ✅ WebSocket을 통해 주문 내역 삭제 알림 전송
             messagingTemplate.convertAndSend("/topic/orders/update", service.getOrdersByTable(tableNo));
        	return ResponseEntity.ok("테이블 " + tableNo + "의 주문 내역이 삭제되었습니다.");	
        } else {
        	return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("테이블 " + tableNo + "의 주문 내역이 없습니다.");
        }
    }
    
    // 사장님 대시보드 총 주문량
    @GetMapping("/totalOrders")
    public ResponseEntity<Integer> getTotalOrders() {
        int totalOrders = service.getTotalOrders();
        return ResponseEntity.ok(totalOrders);
    }
    
    // 사장님 대시보드 총 수입
    @GetMapping("/totalRevenue")
    public ResponseEntity<Integer> getTotalRevenue() {
        int totalRevenue = service.getTotalRevenue();
        return ResponseEntity.ok(totalRevenue);
    }
    
    // 사장님 대시보드 월간 수입 (최근 6개월)
    @GetMapping("/monthly-revenues")
    public ResponseEntity<List<Map<String, Object>>> getMonthlyRevenues() {
        try {
            List<Map<String, Object>> revenues = service.getMonthlyRevenues();
            return ResponseEntity.ok(revenues);
        } catch (Exception e) {
            log.error("❌ 월별 수입 데이터 조회 실패: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Collections.emptyList());
        }
    }
    
    // 사장님 결산 내역 조회
    @GetMapping("/recent-payments")
    public ResponseEntity<List<Map<String, Object>>> getRecentPayments() {
        List<Map<String, Object>> payments = service.getRecentPaymentsWithTax();
        return ResponseEntity.ok(payments);
    }
}
