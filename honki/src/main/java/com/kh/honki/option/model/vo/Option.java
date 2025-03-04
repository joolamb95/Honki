package com.kh.honki.option.model.vo;

import com.kh.honki.category.model.vo.Category;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Option {
	
	private int optionNo;
	private int categoryNo;
	private String optionName;
	private int optionPrice;

}
