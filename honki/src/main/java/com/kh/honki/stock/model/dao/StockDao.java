package com.kh.honki.stock.model.dao;

import java.util.List;

import org.apache.ibatis.session.SqlSession;
import org.springframework.stereotype.Repository;

import com.kh.honki.stock.model.vo.Stock;
import com.kh.honki.stock.model.vo.StockOrder;

import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class StockDao {
	
	private final SqlSession sqlSession;
	
	public List<Stock> StockList() {
		return sqlSession.selectList("stock.stockList");
	}

	public void orderStock(StockOrder stockOrder) {
		sqlSession.insert("stock.orderStock", stockOrder);
	}

	public void updateStockQuantity(Stock stock) {
		sqlSession.update("stock.updateStockQuantity",stock);
	}

	public List<StockOrder> getPostponeOrders() {
		return sqlSession.selectList("stock.getPostponeOrders");
	}

	public List<StockOrder> getOrderHistory() {
		return sqlSession.selectList("stock.getOrderHistory");
	}

	public StockOrder approveOrder(int orderId) {
		return sqlSession.selectOne("stock.approveOrder", orderId);
	}

	public void updateOrderStatus(int orderId) {
		sqlSession.update("stock.updateOrderStatus",orderId);
	}

	public void deleteOrder(int orderId) {
		sqlSession.delete("stock.deleteOrder", orderId);
	}
	
	

}
