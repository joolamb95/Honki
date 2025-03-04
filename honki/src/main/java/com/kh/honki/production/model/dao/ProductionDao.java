package com.kh.honki.production.model.dao;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.session.SqlSession;
import org.springframework.stereotype.Repository;

import com.kh.honki.menu.model.vo.Menu;
import com.kh.honki.option.model.vo.Option;
import com.kh.honki.order.model.vo.OrderDetailDTO;

import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class ProductionDao {

	private final SqlSession sqlSession;
	
	public List<Menu> getMenuList() {
		return sqlSession.selectList("production.getMenuList");
	}

	public void addMenu(Menu menu) {
		sqlSession.insert("production.addMenu", menu);
	}

	public void updateMenu(Menu menu) {
		sqlSession.update("production.updateMenu", menu);
	}

	public void deleteMenu(int menuNo) {
		sqlSession.delete("production.deleteMenu", menuNo);
	}

	public List<Option> getOptionList() {
		return sqlSession.selectList("production.getOptionList");
	}

	public void addOption(Option option) {
		sqlSession.insert("production.addOption", option);
	}

	public void updateOption(Option option) {
		sqlSession.update("production.updateOption", option);
	}

	public void deleteOption(int optionNo) {
		sqlSession.delete("production.deleteOption", optionNo);
	}

	public List<OrderDetailDTO> getOrderList(Map<String, Object> params) {
		return sqlSession.selectList("production.getOrderList", params);
	}

}
