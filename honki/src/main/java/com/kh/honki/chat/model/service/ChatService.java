package com.kh.honki.chat.model.service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

import com.kh.honki.chat.model.vo.ChatMessage;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatService {
	private final ConcurrentHashMap<Integer, List<ChatMessage>> chatMessages = new ConcurrentHashMap<>();
	
	public List<ChatMessage> getMessages(int tableNo){
		return chatMessages.getOrDefault(tableNo, new ArrayList<>());
	}
	
	
	public void addMessage(int tableNo, String sender, String content, ChatMessage.MessageType type) {
		ChatMessage message = new ChatMessage (sender, content, tableNo, type);
        chatMessages.computeIfAbsent(tableNo, k -> new ArrayList<>()).add(message);
    }

    public void clearMessages(int tableNo) {
        chatMessages.remove(tableNo);
    }
}
