package com.kh.honki.stock.model.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kh.honki.stock.model.dao.StockDao;
import com.kh.honki.stock.model.vo.Stock;
import com.kh.honki.stock.model.vo.StockOrder;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StockService {
	
	private final StockDao stockDao;
	
	public List<Stock> StockList() {
		return stockDao.StockList();
	}
	
	@Transactional
	public void orderStock(StockOrder stockOrder) {
		stockDao.orderStock(stockOrder);
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
		
		Stock stock = Stock.builder()
				.menuNo(order.getMenuNo())
				.stockQuantity(order.getOrderQuantity())
				.build();
		stockDao.updateStockQuantity(stock);
		
		stockDao.updateOrderStatus(orderId);
		
//		stockDao.deleteOrder(orderId);
	}
		
		@Transactional
		public void cancelOrder(int orderId) {
			// 주문 취소 시 바로 삭제
			stockDao.deleteOrder(orderId);
		}
	

}
