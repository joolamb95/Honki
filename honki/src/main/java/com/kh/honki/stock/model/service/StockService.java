package com.kh.honki.stock.model.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.kh.honki.stock.model.dao.StockDao;
import com.kh.honki.stock.model.vo.Stock;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StockService {
	
	public final StockDao stockDao;
	
	public List<Stock> StockList() {
		return stockDao.StockList();
	}

}
