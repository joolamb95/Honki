package com.kh.honki.production.model.service;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kh.honki.menu.model.vo.Menu;
import com.kh.honki.option.model.vo.Option;
import com.kh.honki.production.model.dao.ProductionDao;
import com.kh.honki.stock.model.dao.StockDao;
import com.kh.honki.order.model.vo.OrderDetailDTO;

import jakarta.servlet.annotation.HttpConstraint;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductionService {
	
	private final ProductionDao productionDao;
	private final StockDao stockDao;
	
	public List<Menu> getMenuList() {
		return productionDao.getMenuList();
	}
	
	@Transactional
	public void addMenu(Menu menu) {
		productionDao.addMenu(menu);
		int menuNo = menu.getMenuNo();
		stockDao.addStock(menuNo);
	}

	@Transactional
	public void updateMenu(Menu menu) {
		productionDao.updateMenu(menu);
	}

	@Transactional
	public void deleteMenu(int menuNo) {
		stockDao.deleteStockOrder(menuNo);
		stockDao.deleteStock(menuNo);
		productionDao.deleteMenu(menuNo);
	}

	public List<Option> getOptionList() {
		return productionDao.getOptionList();
	}
	
	@Transactional
	public void addOption(Option option) {
		// 1. 먼저 MENU_OPTION 테이블에 옵션 추가
		productionDao.addOption(option);
		
		// 2. 추가된 옵션의 번호 가져오기
		int optionNo = option.getOptionNo();
		
		// 3. 그 다음 STOCK_OPTION 테이블에 재고 정보 추가
		stockDao.addStockOption(optionNo);
	}
	
	@Transactional
	public void updateOption(Option option) {
		productionDao.updateOption(option);
	}
	
	@Transactional
	public void deleteOption(int optionNo) {
		stockDao.deleteStockOrder(optionNo);
		stockDao.deleteStockOption(optionNo);
		productionDao.deleteOption(optionNo);
	}

	public List<OrderDetailDTO> getOrderList(String startDate, String endDate, 
			String searchCategory, String searchTerm) {
		Map<String, Object> params = new HashMap<>();
		params.put("startDate", startDate);
		params.put("endDate", endDate);
		params.put("searchCategory", searchCategory);
		params.put("searchTerm", searchTerm);
		
		return productionDao.getOrderList(params);
	}

}
