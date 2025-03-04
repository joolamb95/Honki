package com.kh.honki.menu.model.vo;

import com.kh.honki.category.model.vo.Category;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Menu extends Category{
	private int menuNo;
	private String menuName;
	private int menuPrice;
	private String menuImg;
	private String menuStatus;
	private int categoryNo;
	private String engName;
	
	

}
