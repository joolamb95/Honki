package com.kh.honki.category.categoryservice;

import java.util.List;

import org.springframework.stereotype.Service;

import com.kh.honki.category.model.dao.CategoryDao;
import com.kh.honki.category.model.vo.Category;
import com.kh.honki.menu.model.service.MenuService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CategoryService {
	
	private final CategoryDao dao;

	public List<Category> getAllCategories() {
		return dao.getAllCategories();
	}

}
