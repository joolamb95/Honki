package com.kh.honki.category.model.dao;

import java.util.List;

import org.apache.ibatis.session.SqlSession;
import org.springframework.stereotype.Repository;

import com.kh.honki.category.model.vo.Category;
import com.kh.honki.menu.model.service.MenuService;

import lombok.RequiredArgsConstructor;


@Repository
@RequiredArgsConstructor
public class CategoryDao {
	private final SqlSession session;

	public List<Category> getAllCategories() {
		return session.selectList("category.getAllCategories");
		
	}

}
