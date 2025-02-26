package com.kh.honki.hr.model.dao;

import java.util.List;

import org.apache.ibatis.session.SqlSession;
import org.springframework.stereotype.Repository;

import com.kh.honki.hr.model.vo.*;

import jakarta.transaction.Transactional;

@Repository
public class EmployeeDao {
	private final SqlSession sqlSession;

    public EmployeeDao(SqlSession sqlSession) {
        this.sqlSession = sqlSession;
    }

    public List<Employee> findAll() {
        return sqlSession.selectList("EmployeeMapper.findAll");
    }

    public Employee findById(int employeeNo) {
        return sqlSession.selectOne("EmployeeMapper.findById", employeeNo);
    }

    @Transactional
    public void insertEmployee(Employee employee) {
        sqlSession.insert("EmployeeMapper.insertEmployee", employee);

        // ✅ 삽입된 employeeNo 가져오기
        Integer generatedId = sqlSession.selectOne("EmployeeMapper.getGeneratedEmployeeId");
        if (generatedId != null) {
            employee.setEmployeeNo(generatedId);
        } else {
            throw new RuntimeException("사원 번호 생성 실패");
        }

        // ✅ 급여 정보 추가
        sqlSession.insert("EmployeeMapper.insertEmployeeSalary", employee);
    }



    @Transactional
    public void updateEmployee(Employee employee) {
        sqlSession.update("EmployeeMapper.updateEmployee", employee);
        
        Integer count = sqlSession.selectOne("EmployeeMapper.countEmployeeSalary", employee.getEmployeeNo());
        if (count == 0) {
            sqlSession.insert("EmployeeMapper.insertEmployeeSalary", employee);
        } else {
            sqlSession.update("EmployeeMapper.updateEmployeeSalary", employee);
        }
    }


    
   


    public void deleteEmployee(int employeeNo) {
        sqlSession.delete("EmployeeMapper.deleteEmployee", employeeNo);
    }
}
