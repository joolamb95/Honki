package com.kh.honki.option.service;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.kh.honki.option.model.dao.OptionDao;
import com.kh.honki.option.model.vo.Option;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OptionService {
	
	private final OptionDao dao;

	public  List<Option> getOptionsByCategory(int categoryNo) {
		return dao.getOptionsByCategory(categoryNo);
	}

	public  List<Option> getAllOptions() {
		return dao.getAllOptions();
	}

}
