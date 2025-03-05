package com.kh.honki.finance.controller;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.kh.honki.finance.model.service.FinanceService;
import com.kh.honki.finance.model.vo.Expend;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173"})
@RequestMapping("/finance")
public class FinanceController {

	private final FinanceService service;
	
	
	@GetMapping("/expends")
	public Map<String, List<Expend>> getExpends(@RequestParam String yearMonth) {
	    log.info("📌 getExpends() 요청 받음: yearMonth={}", yearMonth);

	    // 🔹 이전 월 계산
	    String prevMonth = getPrevMonth(yearMonth);
	    log.info("📌 이전 월 데이터도 요청: prevMonth={}", prevMonth);

	    // 🔹 현재 월과 이전 월의 데이터를 조회
	    List<Expend> currentExpends = service.getExpends(yearMonth);
	    List<Expend> prevExpends = service.getExpends(prevMonth);

	    // 🔹 결과를 Map 형태로 반환 (프론트에서 쉽게 사용 가능)
	    Map<String, List<Expend>> result = new HashMap<>();
	    result.put("currentMonth", currentExpends);
	    result.put("prevMonth", prevExpends);

	    return result;
	}

	// 🔹 이전 월 계산 로직 추가
	private String getPrevMonth(String yearMonth) {
	    String[] parts = yearMonth.split("-");
	    int year = Integer.parseInt(parts[0]);
	    int month = Integer.parseInt(parts[1]);

	    if (month == 1) {
	        year--;
	        month = 12;
	    } else {
	        month--;
	    }

	    return String.format("%d-%02d", year, month); // 예: "2025-01"
	}

	@GetMapping("/expends/months")
	public List<String> getExpendsMonths() {
	    return service.getExpendsMonths();
	}
	
	
	@PostMapping("/expends")
	public ResponseEntity<?> insertExpend(@RequestBody List<Expend> expends) {
	    if (expends == null || expends.isEmpty()) {
	        return ResponseEntity.badRequest().body("입력 데이터가 비어 있습니다.");
	    }
	    
	    for (Expend expend : expends) {
	        log.info("📌 저장할 데이터: {}", expend);
	        service.insertExpend(expend);
	    }
	    
	    return ResponseEntity.ok("저장 완료");
	}

	
    @PutMapping("/expends/{id}")
    public void updateExpend(@PathVariable int id, @RequestBody Expend expend) {
        expend.setExpendNo(id);
        service.updateExpend(expend);
    }

	
    @DeleteMapping("/expends/{id}")
    public void deleteExpend(@PathVariable int id) {
        service.deleteExpend(id);
    }
    
    @GetMapping("/sales")
    public List<Map<String, Object>> getMonthlySales(@RequestParam String yearMonth) {
        log.info("📌 매출 데이터 요청: yearMonth = {}", yearMonth);
        return service.getMonthlySales(yearMonth);
    }

    
    @GetMapping("/sales/weekly")
    public List<Map<String, Object>> getWeeklySales() {
        log.info("📌 주별 매출 요청");
        return service.getWeeklySales();
    }
    
    @GetMapping("/sales/top-menus")
    public List<Map<String, Object>> getTopMenus() {
        log.info("📌 인기 메뉴 요청");
        return service.getTopMenus();
    }
    
    
    @GetMapping("/totalExpends")
    public ResponseEntity<Integer> getTotalExpends() {
        int totalExpends = service.getTotalExpends();
        return ResponseEntity.ok(totalExpends);
    }
    
    @GetMapping("/monthly-expenses")
    public ResponseEntity<List<Map<String, Object>>> getMonthlyExpenses() {
        try {
            List<Map<String, Object>> expenses = service.getMonthlyExpenses();
            return ResponseEntity.ok(expenses);
        } catch (Exception e) {
            log.error("❌ 월별 지출 데이터 조회 실패: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Collections.emptyList());
        }
    }
    
    
}
