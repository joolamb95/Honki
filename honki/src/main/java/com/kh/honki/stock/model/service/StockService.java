package com.kh.honki.stock.model.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kh.honki.option.model.vo.Option;
import com.kh.honki.stock.model.dao.StockDao;
import com.kh.honki.stock.model.vo.Stock;
import com.kh.honki.stock.model.vo.StockOrder;
import com.kh.honki.stock.model.vo.StockOption;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StockService {
	
	private final StockDao stockDao;
	
	public List<Stock> StockList() {
		return stockDao.StockList();
	}
	
	public List<StockOption> StockOptionList() {
		return stockDao.StockOptionList();
	}
	
	@Transactional
	public void orderStock(StockOrder stockOrder) {
		stockDao.orderStock(stockOrder);
		
		// 메뉴/옵션 타입에 따라 다른 테이블 업데이트
		if ("M".equals(stockOrder.getItemType())) {
			stockDao.updateStockStatus(stockOrder.getItemNo());
		} else {
			stockDao.updateOptionStatusAfterCancel(stockOrder.getItemNo());
		}
	}

	public List<StockOrder> getPostponeOrders() {
		return stockDao.getPostponeOrders();
	}

	public List<StockOrder> getOrderHistory() {
		return stockDao.getOrderHistory();
	}
	
	@Transactional
	public void approveOrder(int orderId) {
		StockOrder order = stockDao.approveOrder(orderId);
		
		if ("M".equals(order.getItemType())) {
			Stock stock = Stock.builder()
					.menuNo(order.getItemNo())
					.stockQuantity(order.getOrderQuantity())
					.build();
			stockDao.updateStockQuantity(stock);
		} else {
			StockOption stockOption = StockOption.builder()
					.optionNo(order.getItemNo())
					.stockOptionQuantity(order.getOrderQuantity())
					.build();
			stockDao.updateStockOptionQuantity(stockOption);
		}
		
		stockDao.updateOrderStatus(orderId);
	}
		
	@Transactional
	public void cancelOrder(int orderId) {
		// 주문 삭제 전에 주문 정보 가져오기
		StockOrder order = stockDao.getOrderById(orderId);
		
		// 주문 삭제
		stockDao.deleteOrder(orderId);
		
		// 상태 업데이트
		if ("M".equals(order.getItemType())) {
			stockDao.updateMenuStatusAfterCancel(order.getItemNo());
		} else {
			stockDao.updateOptionStatusAfterCancel(order.getItemNo());
		}
	}
	
	public List<Option> getOptionList() {
		return stockDao.getOptionList();
	}

}