package com.kh.honki.finance.model.dao;

import java.util.List;
import java.util.Map;

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

	public List<Map<String, Object>> getMonthlySales(String yearMonth) {
		return session.selectList("finance.getMonthlySales",yearMonth);
	}

	public List<Map<String, Object>> getWeeklySales() {
		return session.selectList("finance.getWeeklySales");
	}

	public List<Map<String, Object>> getTopMenus() {
		return session.selectList("finance.getTopMenus");
	}

	public int getTotalExpends() {
		Integer result = session.selectOne("finance.getTotalExpends");
		return (result != null) ? result : 0;
	}

	public List<Map<String, Object>> getMonthlyExpenses() {
		return session.selectList("finance.getMonthlyExpenses");
	}

}
