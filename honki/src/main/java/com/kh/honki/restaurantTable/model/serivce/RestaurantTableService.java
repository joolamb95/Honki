package com.kh.honki.restaurantTable.model.serivce;

import java.util.List;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.kh.honki.restaurantTable.model.dao.RestaurantTableDao;
import com.kh.honki.restaurantTable.model.vo.RestaurantTable;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class RestaurantTableService {
    
    private final RestaurantTableDao resDao;

    // 테이블 상태 확인
    public String getTableStatus(int tableNo) {
        String status = resDao.getTableStatus(tableNo);
        return (status != null) ? status : "Y"; // 상태가 없다면 기본 상태는 "Y" (비어 있음)
    }

    // 모든 테이블 정보 가져오기
    public List<RestaurantTable> getAllTables() {
        return resDao.getAllTables(); // DB에서 모든 테이블 정보를 가져옴
    }

    // 랜덤 테이블 선택
    public RestaurantTable getRandomTable() {
        List<RestaurantTable> tables = getAllTables();
        if (tables.isEmpty()) {
            return null; // 테이블이 없으면 null 반환
        }
        
        // 랜덤으로 테이블을 선택
        Random random = new Random();
        return tables.get(random.nextInt(tables.size())); // 테이블 목록에서 랜덤으로 하나 선택
    }
}
