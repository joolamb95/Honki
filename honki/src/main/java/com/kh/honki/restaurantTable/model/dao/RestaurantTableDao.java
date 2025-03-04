package com.kh.honki.restaurantTable.model.dao;

import java.util.List;

import org.apache.ibatis.session.SqlSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.kh.honki.restaurantTable.model.vo.RestaurantTable;

import lombok.RequiredArgsConstructor;

@Repository
public class RestaurantTableDao {
	
	 @Autowired
	private SqlSession session;

	    public String getTableStatus(int tableNo) {
	        return session.selectOne("res.getTableStatus", tableNo);
	    }

	    public List<RestaurantTable> getAllTables() {
	        return session.selectList("res.getAllTables");
	    }

}
