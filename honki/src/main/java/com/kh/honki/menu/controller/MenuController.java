package com.kh.honki.menu.controller;

import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.kh.honki.menu.model.service.MenuService;
import com.kh.honki.menu.model.vo.Menu;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/menus")
@CrossOrigin(origins = "http://192.168.30.192:5173")
public class MenuController {
	private final MenuService service;

	@GetMapping("/category/{categoryNo}")
	public ResponseEntity<List<Menu>> getMenusByCategory(@PathVariable int categoryNo, HttpServletResponse response) {
		log.debug("카테고리별 메뉴 조회 요청 : categoryNo = {}", categoryNo);

		List<Menu> list = service.getMenusByCategory(categoryNo);

		if (list.isEmpty()) {
			return ResponseEntity.noContent().build();
		}
		response.setHeader(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "http://192.168.30.192:5173");
		return ResponseEntity.ok(list);

	}

	@GetMapping
	public ResponseEntity<List<Menu>> getAllMenus(HttpServletResponse response) {
		log.debug("전체 메뉴 조회 요청");

		List<Menu> list = service.getMenus();

		if (list.isEmpty()) {
			return ResponseEntity.noContent().build();
		}
		response.setHeader(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "http://192.168.30.192:5173");
		return ResponseEntity.ok(list);
	}
	@GetMapping("/{menuNo}")
	public ResponseEntity<Menu> getMenuById(@PathVariable("menuNo") int menuNo){
		log.debug("메뉴 상세 조회 요청 : menuNo = {}", menuNo);
		
		Menu menu = service.getMenuById(menuNo);
		
		if(menu == null) {
			return ResponseEntity.notFound().build();
		}
		return ResponseEntity.ok(menu);
	}
	
	@GetMapping("/getByName")
	public ResponseEntity<Menu> getMenuByName(@RequestParam String menuName) {
        log.debug("메뉴 이름으로 조회 요청: name = {}", menuName);
        Menu menu = service.getMenuByName(menuName);

        if (menu == null) {
            return ResponseEntity.notFound().build();
        }
        log.debug("📌 메뉴 정보 반환: {}", menu); 
        return ResponseEntity.ok(menu);
    }
}
