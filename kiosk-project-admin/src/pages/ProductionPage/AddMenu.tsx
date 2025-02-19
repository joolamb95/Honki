import React, {useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../style/AddMenu.css';

interface Menu {
    menuNo: number;          // MENU_NO
    menuName: string;        // MENU_NAME
    menuPrice: number;       // MENU_PRICE
    menuImg: string;         // MENU_IMG
    menuStatus: string;      // MENU_STATUS
    categoryNo: number;      // CATEGORY_NO
    engName: string;         // ENG_NAME
}

interface MenuItem {
    menuNo: string;
    categoryName: string;
    menuImg: string;
    menuName: string;
    menuPrice: string;
}

const AddMenu: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [showModal, setShowModal] = useState(false);
    const [ModifyModal, setModifyModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [menuToDelete, setMenuToDelete] = useState<string | null>(null);
    const [menuList, setMenuList] = useState<MenuItem[]>([
        { menuNo: 'M005', categoryName: '탕 류', menuImg: '이미지', menuName: '마라탕', menuPrice: '14,000원' },
        { menuNo: 'M004', categoryName: '음료/주류', menuImg: '이미지', menuName: '진로', menuPrice: '1,900원' },
        { menuNo: 'M003', categoryName: '사이드', menuImg: '이미지', menuName: '계란말이', menuPrice: '8,000원' },
        { menuNo: 'M002', categoryName: '탕 류', menuImg: '이미지', menuName: '김치찌개', menuPrice: '8,000원' },
        { menuNo: 'M001', categoryName: '사이드', menuImg: '이미지', menuName: '라면', menuPrice: '4,000원' },
    ]);
    
    const [menuForm, setMenuForm] = useState<Menu>({
        menuNo: 0,
        categoryNo: 0,
        menuName: '',
        menuPrice: 0,
        menuImg: '',
        menuStatus: 'ACTIVE',
        engName: ''
    });

    const [modifyForm, setModifyForm] = useState<Menu>({
        menuNo: 0,
        categoryNo: 0,
        menuName: '',
        menuPrice: 0,
        menuImg: '',
        menuStatus: 'ACTIVE',
        engName: ''
    });

    const categories = ['선택하세요', '안주류', '음료/주류', '탕류', '사이드'];

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setMenuForm(prev => ({
                    ...prev,
                    menuImg: reader.result as string
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageDelete = () => {
        setMenuForm(prev => ({
            ...prev,
            menuImg: ''
        }));
    };

    const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        // 유효성 검사
        if (menuForm.categoryNo === 0) {
            alert('카테고리를 선택해주세요.');
            return;
        }
        if (!menuForm.menuName.trim()) {
            alert('메뉴 이름을 입력해주세요.');
            return;
        }
        if (menuForm.menuPrice <= 0) {
            alert('메뉴 가격을 입력해주세요.');
            return;
        }

        // 새로운 메뉴 번호 생성
        const lastMenuNo = menuList[0]?.menuNo || 'M000';
        const newMenuNo = `M${String(Number(lastMenuNo.slice(1)) + 1).padStart(3, '0')}`;

        // 새로운 메뉴 아이템 생성
        const newMenuItem: MenuItem = {
            menuNo: newMenuNo,
            categoryName: categories[menuForm.categoryNo],
            menuImg: menuForm.menuImg || '이미지',
            menuName: menuForm.menuName,
            menuPrice: `${menuForm.menuPrice.toLocaleString()}원`
        };

        // 메뉴 리스트 업데이트
        setMenuList(prevList => [newMenuItem, ...prevList]);

        // 초기화
        setMenuForm({
            menuNo: 0,
            categoryNo: 0,
            menuName: '',
            menuPrice: 0,
            menuImg: '',
            menuStatus: 'ACTIVE',
            engName: ''
        });
        setShowModal(false);
    };

    const handleDeleteClick = (menuNo: string) => {
        setMenuToDelete(menuNo);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = () => {
        if (menuToDelete) {
            setMenuList(prevList => prevList.filter(menu => menu.menuNo !== menuToDelete));
            setShowDeleteModal(false);
            setMenuToDelete(null);
        }
    };

    const handleModifyClick = (menu: MenuItem) => {
        const categoryIndex = categories.findIndex(cat => cat === menu.categoryName);
        
        setModifyForm({
            menuNo: Number(menu.menuNo.slice(1)),
            categoryNo: categoryIndex,
            menuName: menu.menuName,
            menuPrice: Number(menu.menuPrice.replace(/[^0-9]/g, '')),
            menuImg: menu.menuImg,
            menuStatus: 'ACTIVE',
            engName: ''
        });
        setModifyModal(true);
    };

    const handleModifySubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        if (modifyForm.categoryNo === 0) {
            alert('카테고리를 선택해주세요.');
            return;
        }
        if (!modifyForm.menuName.trim()) {
            alert('메뉴 이름을 입력해주세요.');
            return;
        }
        if (modifyForm.menuPrice <= 0) {
            alert('메뉴 가격을 입력해주세요.');
            return;
        }

        setMenuList(prevList => prevList.map(menu => {
            if (Number(menu.menuNo.slice(1)) === modifyForm.menuNo) {
                return {
                    ...menu,
                    categoryName: categories[modifyForm.categoryNo],
                    menuName: modifyForm.menuName,
                    menuPrice: `${modifyForm.menuPrice.toLocaleString()}원`,
                    menuImg: modifyForm.menuImg
                };
            }
            return menu;
        }));

        setModifyModal(false);
    };

    return (
        <div className="stock-management">
            <div className="stock-nav">
                <button 
                    className={location.pathname === '/stock/addMenu' ? 'active' : ''}
                    onClick={() => navigate('/stock/addMenu')}
                >
                    메뉴 관리
                </button>
                <button 
                    className={location.pathname === '/stock/addOption' ? 'active' : ''}
                    onClick={() => navigate('/stock/addOption')}
                >
                    옵션 관리
                </button>
                <button 
                    className={location.pathname === '/stock/orderDetails' ? 'active' : ''}
                    onClick={() => navigate('/stock/orderDetails')}
                >
                    주문 내역
                </button>
            </div>

            <div className="button-section">
            <button className="add-menu-btn" onClick={() => {
                    setShowModal(true);
                }}>
                    신규 메뉴 추가
                </button>
            </div>

            <div>
                <table className='production-table'>
                    <thead>
                        <tr>
                            <th>메뉴 번호</th>
                            <th>카테고리</th>
                            <th>메뉴 이미지</th>
                            <th>메뉴 이름</th>
                            <th>메뉴 가격</th>
                            <th>수정/삭제</th>
                        </tr>
                    </thead>
                    <tbody>
                        {menuList.map((menu, index) => (
                            <tr key={index}>
                                <td>{menu.menuNo}</td>
                                <td>{menu.categoryName}</td>
                                <td>{menu.menuImg}</td>
                                <td>{menu.menuName}</td>
                                <td>{menu.menuPrice}</td>
                                <td>
                                    <div className='button-menu'>
                                        <button 
                                            className="edit-btn" 
                                            onClick={() => handleModifyClick(menu)}
                                        >
                                            수정
                                        </button>
                                        <button 
                                            className="delete-btn"
                                            onClick={() => handleDeleteClick(menu.menuNo)}
                                        >
                                            삭제
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>신규 메뉴 추가</h2>
                            <button 
                                type="button"
                                className="close-btn" 
                                onClick={() => setShowModal(false)}
                            >×</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>메뉴 이미지</label>
                                <div className="image-upload-container">
                                    {menuForm.menuImg ? (
                                        <div className="image-preview">
                                            <img 
                                                src={menuForm.menuImg} 
                                                alt="메뉴 이미지" 
                                                className="preview-image"
                                            />
                                            <button 
                                                type="button"
                                                className="image-delete-btn"
                                                onClick={handleImageDelete}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="upload-box">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                id="image-upload"
                                                className="image-input"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="form-group">
                                <label>카테고리</label>
                                <select
                                    value={menuForm.categoryNo}
                                    onChange={(e) => setMenuForm(prev => ({
                                        ...prev,
                                        categoryNo: Number(e.target.value)
                                    }))}
                                >
                                    {categories.map((category, index) => (
                                        <option key={index} value={index}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>메뉴 이름</label>
                                <input 
                                    type="text"
                                    value={menuForm.menuName}
                                    onChange={(e) => setMenuForm(prev => ({
                                        ...prev,
                                        menuName: e.target.value
                                    }))}
                                    placeholder="메뉴 이름을 입력하세요"
                                />
                            </div>
                            <div className="form-group">
                                <label>메뉴 가격</label>
                                <input 
                                    type="number"
                                    value={menuForm.menuPrice}
                                    onChange={(e) => setMenuForm(prev => ({
                                        ...prev,
                                        menuPrice: Number(e.target.value)
                                    }))}
                                    placeholder="가격을 입력하세요"
                                />
                            </div>
                            <div className="form-group">
                                <label>메뉴 설명</label>
                                <textarea
                                    value={menuForm.engName}
                                    onChange={(e) => setMenuForm(prev => ({
                                        ...prev,
                                        engName: e.target.value
                                    }))}
                                    placeholder="메뉴 설명을 입력하세요"
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button 
                                type="button"
                                className="submit-btn" 
                                onClick={handleSubmit}
                            >
                                추가
                            </button>
                            <button 
                                type="button"
                                className="cancel-btn" 
                                onClick={() => setShowModal(false)}
                            >
                                닫기
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>메뉴 삭제</h2>
                            <button 
                                type="button"
                                className="close-btn" 
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setMenuToDelete(null);
                                }}
                            >×</button>
                        </div>
                        <div className="modal-body">
                            <p>정말 이 메뉴를 삭제하시겠습니까?</p>
                        </div>
                        <div className="modal-footer">
                            <button 
                                type="button"
                                className="submit-btn" 
                                onClick={handleDeleteConfirm}
                            >
                                확인
                            </button>
                            <button 
                                type="button"
                                className="cancel-btn" 
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setMenuToDelete(null);
                                }}
                            >
                                취소
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {ModifyModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>메뉴 수정</h2>
                            <button 
                                type="button"
                                className="close-btn" 
                                onClick={() => setModifyModal(false)}
                            >×</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>메뉴 이미지</label>
                                <div className="image-upload-container">
                                    {modifyForm.menuImg ? (
                                        <div className="image-preview">
                                            <img 
                                                src={modifyForm.menuImg} 
                                                alt="메뉴 이미지" 
                                                className="preview-image"
                                            />
                                            <button 
                                                type="button"
                                                className="image-delete-btn"
                                                onClick={() => setModifyForm(prev => ({...prev, menuImg: ''}))}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="upload-box">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            setModifyForm(prev => ({
                                                                ...prev,
                                                                menuImg: reader.result as string
                                                            }));
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                                id="modify-image-upload"
                                                className="image-input"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="form-group">
                                <label>카테고리</label>
                                <select
                                    value={modifyForm.categoryNo}
                                    onChange={(e) => setModifyForm(prev => ({
                                        ...prev,
                                        categoryNo: Number(e.target.value)
                                    }))}
                                >
                                    {categories.map((category, index) => (
                                        <option key={index} value={index}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>메뉴 이름</label>
                                <input 
                                    type="text"
                                    value={modifyForm.menuName}
                                    onChange={(e) => setModifyForm(prev => ({
                                        ...prev,
                                        menuName: e.target.value
                                    }))}
                                    placeholder="메뉴 이름을 입력하세요"
                                />
                            </div>
                            <div className="form-group">
                                <label>메뉴 가격</label>
                                <input 
                                    type="number"
                                    value={modifyForm.menuPrice}
                                    onChange={(e) => setModifyForm(prev => ({
                                        ...prev,
                                        menuPrice: Number(e.target.value)
                                    }))}
                                    placeholder="가격을 입력하세요"
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button 
                                type="button"
                                className="submit-btn" 
                                onClick={handleModifySubmit}
                            >
                                저장
                            </button>
                            <button 
                                type="button"
                                className="cancel-btn" 
                                onClick={() => setModifyModal(false)}
                            >
                                취소
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddMenu;
