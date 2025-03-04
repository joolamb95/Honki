package com.kh.honki.chat.model.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {
	private String sender;
	private String content;
	private int tableNo;
	private MessageType type;

	public enum MessageType {
		CHAT, JOIN, LEAVE, CALL;
	}

	// Getters and Setters
}
