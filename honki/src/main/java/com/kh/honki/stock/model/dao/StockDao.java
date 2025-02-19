package com.kh.honki.stock.model.dao;

import java.util.List;

import org.apache.ibatis.session.SqlSession;
import org.springframework.stereotype.Repository;

import com.kh.honki.stock.model.vo.Stock;

import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class StockDao {
	
	private final SqlSession sqlSession;
	
	public List<Stock> StockList() {
		return sqlSession.selectList("stock.stockList");
	}

}
