package com.kh.honki.stock.controller;

import java.util.List;
import java.util.ArrayList;
import org.springframework.http.HttpHeaders;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kh.honki.stock.model.service.StockService;
import com.kh.honki.stock.model.vo.Stock;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequiredArgsConstructor
public class StockController {
	
	private final StockService stockService;
	
	@GetMapping("/stock")
	@CrossOrigin(origins = "http://localhost:5173")
	public List<Stock> StockList(HttpServletResponse response) {
		try {
			log.debug("재고 목록 조회 요청");
			
			List<Stock> stockList = stockService.StockList();
			log.debug("stockList : {}", stockList);
			
			return stockList;
		} catch(Exception e) {
			log.error("재고 목록 조회 실패: ", e);
			return new ArrayList<>();
		}
	}
}
