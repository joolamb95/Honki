package com.kh.honki.finance.model.dao;

import java.util.List;

import org.apache.ibatis.session.SqlSession;
import org.springframework.stereotype.Repository;

import com.kh.honki.finance.model.vo.Expend;

import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class FinanceDao {

	private final SqlSession session;

	public List<Expend> getExpends(String yearMonth) {
		return session.selectList("finance.getExpends", yearMonth);
	}

	public void insertExpend(Expend expend) {
		session.insert("finance.insertExpend", expend);
	}

	public void updateExpend(Expend expend) {
		session.update("finance.updateExpend",expend);
	}

	public void deleteExpend(int id) {
		session.update("finance.deleteExpend",id);
	}

	public List<String> getExpendsMonths() {
		return session.selectList("finance.getExpendsMonths");
	}
	
	
}
