package com.kh.honki.chat.model.dao;

import org.apache.ibatis.session.SqlSession;
import org.springframework.stereotype.Repository;

import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class ChatDao {
	private final SqlSession session;

	public String handleMessage(String message) {
		return session.selectOne("chat.handleMessage", message);
		
	}

}