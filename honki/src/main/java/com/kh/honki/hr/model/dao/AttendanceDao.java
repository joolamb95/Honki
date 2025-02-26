package com.kh.honki.hr.model.dao;

import com.kh.honki.hr.model.vo.*;
import org.apache.ibatis.session.SqlSession;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public class AttendanceDao {
    private final SqlSession sqlSession;

    public AttendanceDao(SqlSession sqlSession) {
        this.sqlSession = sqlSession;
    }

    // ✅ 기존 findAll() 대신 findAllAttendances() 호출하도록 변경
    public List<Attendance> findAllAttendances() {
        return sqlSession.selectList("AttendanceMapper.findAllAttendances");
    }

    public List<Attendance> findByEmployeeNo(int employeeNo) {
        return sqlSession.selectList("AttendanceMapper.findByEmployeeNo", employeeNo);
    }

    public void insertAttendance(Attendance attendance) {
        sqlSession.insert("AttendanceMapper.insertAttendance", attendance);
    }

    public void updateAttendance(Attendance attendance) {
        sqlSession.update("AttendanceMapper.updateAttendance", attendance);
    }

    public void deleteAttendance(int attendanceNo) {
        sqlSession.delete("AttendanceMapper.deleteAttendance", attendanceNo);
    }
    public List<Attendance> findAttendanceByDate(String workDate) {
        return sqlSession.selectList("AttendanceMapper.findAttendanceByDate", workDate);
    }
    
}
