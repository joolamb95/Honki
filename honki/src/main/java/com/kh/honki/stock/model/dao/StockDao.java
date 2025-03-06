package com.kh.honki.stock.model.dao;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.ibatis.session.SqlSession;
import org.springframework.stereotype.Repository;

import com.kh.honki.option.model.vo.Option;
import com.kh.honki.stock.model.vo.Stock;
import com.kh.honki.stock.model.vo.StockOrder;
import com.kh.honki.stock.model.vo.StockOption;

import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class StockDao {
	
	private final SqlSession sqlSession;
	
	public List<Stock> StockList() {
		return sqlSession.selectList("stock.stockList");
	}

	public List<StockOption> StockOptionList() {
		return sqlSession.selectList("stock.stockOptionList");
	}

	public void orderStock(StockOrder stockOrder) {
		sqlSession.insert("stock.orderStock", stockOrder);
	}

	public void updateStockQuantity(Stock stock) {
		sqlSession.update("stock.updateStockQuantity", stock);
	}

	public void updateStockOptionQuantity(StockOption stockOption) {
		sqlSession.update("stock.updateStockOptionQuantity", stockOption);
	}

	public void updateStockStatus(int menuNo) {
		sqlSession.update("stock.updateStockStatus", menuNo);
	}

	public void updateOptionStatusAfterCancel(int optionNo) {
		sqlSession.update("stock.updateOptionStatusAfterCancel", optionNo);
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
		sqlSession.update("stock.updateOrderStatus", orderId);
	}

	public void deleteOrder(int orderId) {
		sqlSession.delete("stock.deleteOrder", orderId);
	}

	public void addStock(int menuNo) {
		sqlSession.insert("stock.addStock", menuNo);
	}

	public void deleteStock(int menuNo) {
		sqlSession.delete("stock.deleteStock", menuNo);
	}

	public void deleteStockOrder(int menuNo) {
		sqlSession.delete("stock.deleteStockOrder", menuNo);
	}

	public List<Option> getOptionList() {
		return sqlSession.selectList("stock.optionList");
	}

	public StockOrder getOrderById(int orderId) {
		return sqlSession.selectOne("stock.getOrderById", orderId);
	}

	public void updateMenuStatusAfterCancel(int menuNo) {
		sqlSession.update("stock.updateMenuStatusAfterCancel", menuNo);
	}

	public void addStockOption(int optionNo) {
		sqlSession.insert("stock.addStockOption", optionNo);
	}

	public void deleteStockOption(int optionNo) {
		sqlSession.delete("stock.deleteStockOption", optionNo);
	}

}