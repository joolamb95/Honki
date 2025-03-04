package com.kh.honki.production.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kh.honki.menu.model.vo.Menu;
import com.kh.honki.option.model.vo.Option;
import com.kh.honki.production.model.service.ProductionService;
import com.kh.honki.stock.model.service.StockService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.http.HttpStatus;

import com.kh.honki.order.model.dto.OrderDetailDto;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/menu")
public class ProductionController {
	private final ProductionService productionService;
	private final StockService stockService;
	
	@GetMapping("/list")
	@CrossOrigin(origins = "http://localhost:5173")
	public ResponseEntity<List<Menu>> getMenuList() {
		return ResponseEntity.ok(productionService.getMenuList());
	}
	
	@PostMapping("/add")
	@CrossOrigin(origins = "http://localhost:5173")
	public ResponseEntity<String> addMenu(@RequestBody Menu menu) {
		try {
			productionService.addMenu(menu);
			return ResponseEntity.ok("메뉴가 추가되었습니다.");
		} catch (Exception e) {
			log.error("메뉴 추가 실패: ", e);
			return ResponseEntity.badRequest().body("메뉴 추가에 실패했습니다.");
		}
	}
	
	@PutMapping("/update")
	@CrossOrigin(origins = "http://localhost:5173")
	public ResponseEntity<String> updateMenu(@RequestBody Menu menu){
		try {
			productionService.updateMenu(menu);
			return ResponseEntity.ok("메뉴가 수정되었습니다.");
		} catch (Exception e) {
			log.error("메뉴 수정 실패: ", e);
			return ResponseEntity.badRequest().body("메뉴 수정에 실패했습니다.");
		}
	}
	
	@DeleteMapping("/delete/{menuNo}")
	@CrossOrigin(origins = "http://localhost:5173")
	public ResponseEntity<String> deleteMenu(@PathVariable int menuNo){
		try {
			productionService.deleteMenu(menuNo);
			return ResponseEntity.ok("메뉴가 삭제되었습니다.");
		} catch (Exception e) {
			log.error("메뉴 삭제 실패: ", e);
			return ResponseEntity.badRequest().body("메뉴 삭제에 실패했습니다.");
		}
	}
	
	@GetMapping("/option/list")
	@CrossOrigin(origins = "http://localhost:5173")
	public ResponseEntity<List<Option>> getOptionList() {
		return ResponseEntity.ok(productionService.getOptionList());
	}
	
	@PostMapping("/option/add")
	@CrossOrigin(origins = "http://localhost:5173")
	public ResponseEntity<String> addOption(@RequestBody Option option) {
		try {
			productionService.addOption(option);
			return ResponseEntity.ok("옵션이 추가되었습니다.");
		} catch (Exception e) {
			log.error("옵션 추가 실패: ", e);
			return ResponseEntity.badRequest().body("옵션 추가에 실패했습니다.");
		}
	}
	
	@PutMapping("/option/update")
	@CrossOrigin(origins = "http://localhost:5173")
	public ResponseEntity<String> updateOption(@RequestBody Option option) {
		try {
			productionService.updateOption(option);
			return ResponseEntity.ok("옵션이 수정되었습니다.");
		} catch (Exception e) {
			log.error("옵션 수정 실패: ", e);
			return ResponseEntity.badRequest().body("옵션 수정에 실패했습니다.");
		}
	}
	
	@DeleteMapping("/option/delete/{optionNo}")
	@CrossOrigin(origins = "http://localhost:5173")
	public ResponseEntity<String> deleteOption(@PathVariable int optionNo){
		try {
			productionService.deleteOption(optionNo);
			return ResponseEntity.ok("옵션이 삭제되었습니다.");
		} catch (Exception e) {
			log.error("옵션 삭제 실패: ", e);
			return ResponseEntity.badRequest().body("옵션 삭제에 실패했습니다.");
		}
	}
	
	@GetMapping("/orders/list")
	@CrossOrigin(origins = "http://localhost:5173")
	public ResponseEntity<?> getOrderList(
			@RequestParam(required = false) String startDate,
			@RequestParam(required = false) String endDate,
			@RequestParam(required = false) String searchCategory,
			@RequestParam(required = false) String searchTerm) {
		
		log.info("주문 내역 조회 요청 시작");
		log.info("파라미터 - startDate: {}, endDate: {}, category: {}, term: {}", 
				startDate, endDate, searchCategory, searchTerm);

		try {
			List<OrderDetailDto> orders = productionService.getOrderList(startDate, endDate, searchCategory, searchTerm);
			log.info("조회된 주문 내역 수: {}", orders.size());
			
			if (orders.isEmpty()) {
				log.info("조회된 주문 내역이 없습니다.");
			} else {
				log.info("첫 번째 주문 데이터: {}", orders.get(0));
			}
			
			return ResponseEntity.ok(orders);
		} catch (Exception e) {
			log.error("주문 내역 조회 실패: ", e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("주문 내역 조회에 실패했습니다. 에러: " + e.getMessage());
		}
	}
	
	@PostMapping("/order/complete")
	@CrossOrigin(origins = "http://localhost:5173")
	public ResponseEntity<String> decreaseStock(@RequestBody Map<String, Object> orderData) {
		try {
			int orderNo = (Integer) orderData.get("orderNo");
			int amount = (Integer) orderData.get("amount");
			
			stockService.decreaseStock(orderNo, amount);
			
			return ResponseEntity.ok("재고 차감 성공");
		} catch (Exception e) {
			return ResponseEntity.badRequest().body("재고 차감 실패: " + e.getMessage());
		}
	}
}
