package com.kh.honki.chat.model.websocket;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
  @Override
  public void configureMessageBroker(MessageBrokerRegistry config) {
    config.enableSimpleBroker("/topic");
    config.setApplicationDestinationPrefixes("/app");
  }

  @Override
  public void registerStompEndpoints(StompEndpointRegistry registry) {
      registry.addEndpoint("/ws/owner") // 사장님용 WebSocket
      		  .setAllowedOrigins("http://localhost:5173")
      		  .setAllowedOrigins("http://192.168.30.18:8080")  		  
              .setAllowedOriginPatterns("*")
              .withSockJS();

      registry.addEndpoint("/ws/customer") // 손님용 WebSocket
      		  .setAllowedOrigins("http://localhost:5173")
      		  .setAllowedOrigins("http://192.168.30.18:8080")
              .setAllowedOriginPatterns("*")
              .withSockJS();
      
      registry.addEndpoint("/stompServer") // ✅ WebSocket 엔드포인트 추가
      .setAllowedOriginPatterns("*")
      .withSockJS();
  }

}