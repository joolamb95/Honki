package com.kh.honki.menu.model.service;

import java.util.List;
import org.springframework.stereotype.Service;
import com.kh.honki.menu.model.dao.MenuDao;
import com.kh.honki.menu.model.vo.Menu;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MenuService {

    private final MenuDao dao;

    public List<Menu> getMenus() {
        return dao.getMenus();
    }

    public List<Menu> getMenusByCategory(int categoryNo) {
        return dao.findByCategoryNo(categoryNo);
    }

    public Menu getMenuById(int menuNo) {
        return dao.findByMenuNo(menuNo);
    }

	public Menu getMenuByName(String menuName) {
		return dao.getMenuByName(menuName);
	}
}
