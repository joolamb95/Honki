package com.kh.honki.option.model.dao;

import java.util.List;

import org.apache.ibatis.session.SqlSession;
import org.springframework.stereotype.Repository;

import com.kh.honki.option.model.vo.Option;

import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class OptionDao {

	private final SqlSession session;

	public List<Option> getOptionsByCategory(int categoryNo) {
		return session.selectList("option.getOptionsByCategory", categoryNo);
	}

	public List<Option> getAllOptions() {
		return session.selectList("option.getAllOptions");

	}

}
