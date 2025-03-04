package com.kh.honki.menu.model.dao;

import java.util.List;

import org.apache.ibatis.session.SqlSession;
import org.springframework.stereotype.Repository;

import com.kh.honki.menu.model.vo.Menu;

import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class MenuDao {

    private final SqlSession session;

    public List<Menu> getMenus() {
        return session.selectList("menu.getMenus");
    }

    public List<Menu> findByCategoryNo(int categoryNo) {
        return session.selectList("menu.findByCategoryNo", categoryNo);
    }

    public Menu findByMenuNo(int menuNo) {
        return session.selectOne("menu.findByMenuNo", menuNo);
    }

	public Menu getMenuByName(String menuName) {
		return session.selectOne("menu.getMenuByName",menuName);
	}
}
