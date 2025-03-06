package com.kh.honki.order.model.dao;

import java.util.List;

import org.apache.ibatis.session.SqlSession;
import org.springframework.stereotype.Repository;

import com.kh.honki.order.model.vo.Order;
import com.kh.honki.order.model.vo.OrderDetailDTO;
import com.kh.honki.orderdetail.model.vo.OrdersDetail;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Repository
@RequiredArgsConstructor
public class OrderDao {

    private final SqlSession sqlSession;

    public int createOrder(Order order) {
        int result = sqlSession.insert("order.insertOrder", order);

        if (result == 0) {
            throw new IllegalStateException("❌ 주문 INSERT 실패");
        }

        Integer orderNo = sqlSession.selectOne("order.getLastOrderNo");

        if (orderNo == null || orderNo == 0) {
            throw new IllegalStateException("❌ ORDER_NO 생성 실패");
        }

        order.setOrderNo(orderNo);
        return orderNo;
    }

    public List<OrderDetailDTO> getOrdersByTable(int tableNo) {
        return sqlSession.selectList("order.getOrdersByTable", tableNo);
    }

    public List<OrdersDetail> getAllOrders() {
        return sqlSession.selectList("order.getAllOrders");
    }


	public List<Integer> getOrderNosByTableNo(int tableNo) {
		return sqlSession.selectList("order.getOrderNosByTableNo",tableNo);
	}
    
	public int clearOrdersByTable(List<Integer> list) {
		return sqlSession.update("order.clearOrdersByTable", list);
	}

	public  int getTotalOrders() {
		return sqlSession.selectOne("order.getTotalOrders");
	}

}
