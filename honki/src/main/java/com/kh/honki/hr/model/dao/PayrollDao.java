package com.kh.honki.hr.model.dao;

import java.util.List;

import org.apache.ibatis.session.SqlSession;
import org.springframework.stereotype.Repository;

import com.kh.honki.hr.model.vo.*;

@Repository
public class PayrollDao {
    private final SqlSession sqlSession;

    public PayrollDao(SqlSession sqlSession) {
        this.sqlSession = sqlSession;
    }

    public List<Payroll> findAll() {
        return sqlSession.selectList("PayrollMapper.findAll");
    }

    public Payroll findByEmployeeNo(int employeeNo) {
        return sqlSession.selectOne("PayrollMapper.findByEmployeeNo", employeeNo);
    }

    public void insertPayroll(Payroll payroll) {
        sqlSession.insert("PayrollMapper.insertPayroll", payroll);
    }

    public void updatePayroll(Payroll payroll) {
        sqlSession.update("PayrollMapper.updatePayroll", payroll);
    }


    public void deletePayroll(int employeeNo) {
        sqlSession.delete("PayrollMapper.deletePayroll", employeeNo);
    }
}