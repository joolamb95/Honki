package com.kh.honki.order.controller;


import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;

import com.kh.honki.order.model.vo.Order;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Controller
public class OrderWebSocketController {

	@CrossOrigin(origins= {"localhost:5173"})
    @MessageMapping("/orders/send") // ✅ 클라이언트가 메시지를 보낼 때 사용하는 경로
    @SendTo("/topic/orders/update") // ✅ 구독 중인 모든 클라이언트에게 메시지 전송
    public Order sendOrderUpdate(Order order) {
        log.info("📡 새로운 주문 업데이트: {}", order);
        return order; // WebSocket을 통해 모든 클라이언트에 주문 정보 전송
    }
}