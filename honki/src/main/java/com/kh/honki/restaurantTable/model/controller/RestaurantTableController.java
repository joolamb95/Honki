package com.kh.honki.restaurantTable.model.controller;

import java.util.List;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kh.honki.orderdetail.model.controller.OrdersDetailController;
import com.kh.honki.orderdetail.model.service.OrdersDetailService;
import com.kh.honki.restaurantTable.model.serivce.RestaurantTableService;
import com.kh.honki.restaurantTable.model.vo.RestaurantTable;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;


@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/restaurant-table")
@CrossOrigin(origins = "http://localhost:5173") 
public class RestaurantTableController {
    @Autowired
    private RestaurantTableService resService;

    @GetMapping("/{tableNo}/status")
    public ResponseEntity<String> checkTableStatus(@PathVariable int tableNo) {
        String status = resService.getTableStatus(tableNo);
        return ResponseEntity.ok(status);
    }
    
    @GetMapping("/random")
    public ResponseEntity<RestaurantTable> getRandomeTable(){
    	List<RestaurantTable> tables = resService.getAllTables();
    	
    	if(tables.isEmpty()) {
    		return ResponseEntity.notFound().build();
    	}
    	
    	Random random = new Random();
        RestaurantTable randomTable = tables.get(random.nextInt(tables.size()));
    	return ResponseEntity.ok(randomTable);
    }
}
