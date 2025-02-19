package com.kh.honki.finance.controller;

import java.util.List;

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
	public List<Expend> getExpends(@RequestParam String yearMonth){
		log.info("📌 getExpends() 요청 받음: yearMonth={}", yearMonth); // ✅ 요청 확인 로그
		return service.getExpends(yearMonth);
	}
	
	@GetMapping("/expends/months")
	public List<String> getExpendsMonths() {
	    return service.getExpendsMonths();
	}
	
	
	@PostMapping("/expends")
    public void insertExpend(@RequestBody Expend expend) {
        service.insertExpend(expend);
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
}
