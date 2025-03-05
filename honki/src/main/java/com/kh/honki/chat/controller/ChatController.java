package com.kh.honki.chat.controller;

import java.util.List;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.kh.honki.chat.model.service.ChatService;
import com.kh.honki.chat.model.vo.ChatMessage;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequiredArgsConstructor
@Slf4j  // ✅ 로그 추가
@CrossOrigin(origins = {"http://192.168.30.192:8080","http://192.168.30.192:5173"}) // React에서 API 접근 허용
public class ChatController {
	private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;
    
    //특정 테이블의 메시지 가져오기 (React에서 요청)
    @CrossOrigin("http://localhost:5173")
    @GetMapping("/chat/{tableNo}")
    @ResponseBody
    public List<ChatMessage> getMessages(@PathVariable int tableNo) {
        return chatService.getMessages(tableNo);
    }

    // WebSocket 메시지 처리 (메모리에 저장)
    @CrossOrigin("http://localhost:5173")
    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessage chatMessage) {
        System.out.println("📩 [백엔드] 메시지 수신: " + chatMessage);

        //백엔드에서 content가 비어 있으면 처리 중단
        if (chatMessage.getContent() == null || chatMessage.getContent().trim().isEmpty()) {
            System.err.println("🚨 [백엔드] content가 null 또는 빈 문자열!");
            return;
        }

        //MessageType이 null이면 기본적으로 CHAT으로 설정
        if (chatMessage.getType() == null) {
            chatMessage.setType(ChatMessage.MessageType.CHAT);
        }

        //sender가 null이면 기본값을 "User"로 설정
        if (chatMessage.getSender() == null || chatMessage.getSender().trim().isEmpty()) {
            chatMessage.setSender("User");
        }

        //로그 추가 (전달되는 데이터 확인)
        System.out.println("🚀 [백엔드] 메시지 저장: Sender=" + chatMessage.getSender() + ", Content=" + chatMessage.getContent());

        //서비스에서 채팅 메시지 저장
        chatService.addMessage(chatMessage.getTableNo(), chatMessage.getSender(), chatMessage.getContent(), chatMessage.getType());

        //WebSocket을 통해 메시지 전달
        if ("owner".equals(chatMessage.getSender())) {
            messagingTemplate.convertAndSend("/topic/chat/customer/" + chatMessage.getTableNo(), chatMessage);
            System.out.println("📨 [백엔드] 사장님 메시지 -> 사용자 전달 완료");
        } else {
            messagingTemplate.convertAndSend("/topic/chat/owner/" + chatMessage.getTableNo(), chatMessage);
            System.out.println("📨 [백엔드] 사용자 메시지 -> 사장님 전달 완료");
        }
    }


    // 손님 -> 사장님 호출 메세지
    @CrossOrigin("http://localhost:5173")
    @MessageMapping("/chat.sendServiceRequest")
    public void sendServiceRequest(@Payload ChatMessage chatMessage) {
    	chatMessage.setSender("user");
        chatMessage.setType(ChatMessage.MessageType.CALL); // "서비스 호출" 버튼 메시지 처리
        chatService.addMessage(chatMessage.getTableNo(), chatMessage.getSender(), chatMessage.getContent(), ChatMessage.MessageType.CALL);

        // ✅ 사장님에게 서비스 요청 메시지 전송
        messagingTemplate.convertAndSend("/topic/chat/owner/" + chatMessage.getTableNo(), chatMessage);
        messagingTemplate.convertAndSend("/topic/chat/customer/" + chatMessage.getTableNo(), chatMessage);
       
    }
    
    // 사장님이 받는 호출 메세지
    @CrossOrigin("http://localhost:5173")
    @MessageMapping("/chat.serviceCall")
    public void serviceCall(@Payload ChatMessage chatMessage) {
        
        chatMessage.setSender("user");
        chatMessage.setType(ChatMessage.MessageType.CALL);
        
        chatService.addMessage(chatMessage.getTableNo(), chatMessage.getSender(), chatMessage.getContent(), chatMessage.getType());

        String topic = "/topic/chat/owner/" + chatMessage.getTableNo();
        messagingTemplate.convertAndSend(topic, chatMessage);
    }

    
    @CrossOrigin("http://localhost:5173")
    @DeleteMapping("/chat/clear/{tableNo}")
    @ResponseBody
    public void clearMessages(@PathVariable int tableNo) {
        System.out.println(" 채팅 삭제 요청 도착: 테이블 " + tableNo); //삭제 요청 로그

        chatService.clearMessages(tableNo);

        ChatMessage deleteMessage = ChatMessage.builder()
                .sender("System")
                .content("이 테이블의 채팅 내역이 삭제되었습니다.")
                .tableNo(tableNo)
                .type(ChatMessage.MessageType.LEAVE) // 삭제 메시지 타입 지정
                .build();

        System.out.println("🚀 WebSocket 메시지 전송 (LEAVE): " + deleteMessage); // 로그 추가

        // WebSocket을 통해 삭제 메시지 전송
        messagingTemplate.convertAndSend("/topic/chat/owner/" + tableNo, deleteMessage);
        messagingTemplate.convertAndSend("/topic/chat/customer/" + tableNo, deleteMessage);
    }


    
    
}

