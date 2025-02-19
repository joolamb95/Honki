package com.kh.honki.finance.model.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.kh.honki.finance.model.dao.FinanceDao;
import com.kh.honki.finance.model.vo.Expend;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FinanceService {

	private final FinanceDao dao;
	
	public List<Expend> getExpends(String yearMonth){
		return dao.getExpends(yearMonth);
	}

	public void insertExpend(Expend expend) {
		dao.insertExpend(expend);
	}

	public void updateExpend(Expend expend) {
		dao.updateExpend(expend);		
	}

	public void deleteExpend(int id) {
		dao.deleteExpend(id);
	}

	public List<String> getExpendsMonths() {
		return dao.getExpendsMonths();
	}
	
	
	
	
}
