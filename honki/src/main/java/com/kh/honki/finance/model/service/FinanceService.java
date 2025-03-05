package com.kh.honki.finance.model.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.kh.honki.finance.model.dao.FinanceDao;
import com.kh.honki.finance.model.vo.Expend;
import com.kh.honki.utils.DateUtils;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class FinanceService {

	private final FinanceDao dao;
	
	public List<Expend> getExpends(String yearMonth){
		return dao.getExpends(yearMonth);
	}

	public void insertExpend(Expend expend) {
		dao.insertExpend(expend);
	}

	public void updateExpend(Expend expend) {
		dao.updateExpend(expend);		
	}

	public void deleteExpend(int id) {
		dao.deleteExpend(id);
	}

	public List<String> getExpendsMonths() {
		return dao.getExpendsMonths();
	}

	public List<Map<String, Object>> getMonthlySales(String yearMonth) {
		return dao.getMonthlySales(yearMonth);
	}

	public List<Map<String, Object>> getWeeklySales() {
		return dao.getWeeklySales();
	}

	public List<Map<String, Object>> getTopMenus() {
		
	    // 1. DB로부터 데이터를 조회
	    List<Map<String, Object>> flatList = dao.getTopMenus();
	    log.debug("DB로부터 조회한 데이터 : {}",flatList);
	    // 2. null인 요소는 제외하고, 각 item의 "category"가 null이면 "논알콜"로 치환하여 그룹화
	    Map<String, List<Map<String, Object>>> grouped = flatList.stream()
	    	    .filter(Objects::nonNull)
	    	    .collect(Collectors.groupingBy(item -> {
	    	        // ✅ "CATEGORY" 값이 잘못 들어가는 경우 대비
	    	        String cat = (String) item.get("CATEGORY");
	    	        if (cat == null) return "논알콜";
	    	        return cat;
	    	    }));

	    log.debug("🔹 1차 그룹화된 데이터 (category 기준) : {}", grouped);
	    
	    // 3. 우리가 표시할 3개 카테고리를 미리 지정 (데이터가 없으면 빈 리스트로 처리)
	    List<String> desiredCategories = Arrays.asList("주류", "안주류", "논알콜");
	    List<Map<String, Object>> result = new ArrayList<>();

	    for (String cat : desiredCategories) {
	        // 해당 카테고리 데이터가 없으면 빈 리스트 반환 → 프론트에서 공란 처리 가능
	        List<Map<String, Object>> items = grouped.getOrDefault(cat, new ArrayList<>());

	        // 4. 주문 건수(orders) 내림차순 정렬 (null이면 0으로 처리)
	        items.sort((a, b) -> {
	            int aOrders = a.get("orders") == null ? 0 : ((Number) a.get("orders")).intValue();
	            int bOrders = b.get("orders") == null ? 0 : ((Number) b.get("orders")).intValue();
	            return bOrders - aOrders;
	        });
	        
	        log.debug("2차 그룹화된 데이터 : {}",items);
	        
	        // 5. 상위 3개만 선택
	        List<Map<String, Object>> top3 = items.stream().limit(3).collect(Collectors.toList());

	        log.debug("3차 상위3개 데이터 : {}",top3);
	        
	        // 6. 순위(rank) 부여 (1부터 시작)
	        for (int i = 0; i < top3.size(); i++) {
	            if (top3.get(i) != null) {
	                top3.get(i).put("rank", i + 1);  // 🔹 안전하게 rank 추가
	            }
	        }

	        // 7. 카테고리별 데이터를 "category"와 "items" 구조로 구성
	        Map<String, Object> catData = new HashMap<>();
	        catData.put("category", cat);
	        catData.put("items", top3);
	        result.add(catData);
	    }
	    log.debug("최종 반환 데이터 : {}",result);
	    return result;
	}

	public int getTotalExpends() {
		return dao.getTotalExpends();
	}

	public List<Map<String, Object>> getMonthlyExpenses() {
		List<Map<String, Object>> rawExpenses = dao.getMonthlyExpenses();
		
		List<String> lastSixMonths = DateUtils.getLastSixMonths(); // ✅ 공통 메소드 사용
	    Map<String, Integer> expenseMap = rawExpenses.stream()
	    	    .collect(Collectors.toMap(m -> (String) m.get("MONTH"), 
                        m -> ((BigDecimal) m.get("TOTAL_EXPEND")).intValue(), 
                        (a, b) -> b));

	    List<Map<String, Object>> result = new ArrayList<>();
	    for (String month : lastSixMonths) {
	        Map<String, Object> data = new HashMap<>();
	        data.put("month", month);
	        data.put("expense", expenseMap.getOrDefault(month, 0));
	        result.add(data);
	    }
	    return result;
	}
	
}
