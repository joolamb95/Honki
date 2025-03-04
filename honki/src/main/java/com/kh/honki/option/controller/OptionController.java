package com.kh.honki.option.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kh.honki.category.categoryservice.CategoryService;
import com.kh.honki.option.model.vo.Option;
import com.kh.honki.option.service.OptionService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;


@Slf4j
@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/options")
public class OptionController {
	
private final OptionService service;
	
	@GetMapping("/{categoryNo}")
	public ResponseEntity<List<Option>>  getOptionsByCategory(@PathVariable int categoryNo){
		List<Option> options = service.getOptionsByCategory(categoryNo);
		return ResponseEntity.ok(options);
		}
	@GetMapping
	public ResponseEntity <List<Option>> getAllOptions() {
		List<Option> options = service.getAllOptions();
		return ResponseEntity.ok(options);
	}

}
