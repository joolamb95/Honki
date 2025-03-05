import React, {useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../style/AddMenu.css';
import axios from 'axios';

// DB 테이블 구조에 맞는 인터페이스
interface Menu {
    menuNo: number;          // MENU_NO (NUMBER)
    menuName: string;        // MENU_NAME (VARCHAR2(100))
    menuPrice: number;       // MENU_PRICE (NUMBER)
    menuImg: string;         // MENU_IMG (VARCHAR2(100))
    menuStatus: string;      // MENU_STATUS (VARCHAR2(50))
    categoryNo: number;      // CATEGORY_NO (NUMBER)
    categoryName: string;    // CATEGORY_NAME from JOIN
    engName: string;         // ENG_NAME (VARCHAR2(60))
}

const AddMenu: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [showModal, setShowModal] = useState(false);
    const [ModifyModal, setModifyModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [menuToDelete, setMenuToDelete] = useState<number | null>(null);
    const [menuList, setMenuList] = useState<Menu[]>([]);
    
    const [menuForm, setMenuForm] = useState<Menu>({
        menuNo: 0,
        menuName: '',
        menuPrice: 0,
        menuImg: '',
        menuStatus: 'Y',
        categoryNo: 0,
        categoryName: '',
        engName: ''
    });

    const [modifyForm, setModifyForm] = useState<Menu>({
        menuNo: 0,
        menuName: '',
        menuPrice: 0,
        menuImg: '',
        menuStatus: 'Y',
        categoryNo: 0,
        categoryName: '',
        engName: ''
    });

    // 실제 DB에서 가져올 카테고리 목록
    const categories = ['선택하세요', '사시미', '구이', '꼬치', '찜', '탕', '식사', '라멘', '튀김', '사이드', '음료/주류'];

    // 초기 폼 상태 정의
    const initialMenuForm: Menu = {
        menuNo: 0,
        menuName: '',
        menuPrice: 0,
        menuImg: '',
        menuStatus: 'Y',
        categoryNo: 0,
        categoryName: '',
        engName: ''
    };

    // 폼 상태를 초기화하는 함수
    const resetForm = () => {
        setMenuForm({...initialMenuForm});
        setModifyForm({...initialMenuForm});
    };

    // 모달 닫기 함수 수정
    const handleCloseModal = () => {
        setShowModal(false);
        resetForm();  // 폼 초기화 추가
    };

    // 수정 모달 닫기 함수 수정
    const handleCloseModifyModal = () => {
        setModifyModal(false);
        resetForm();  // 폼 초기화 추가
    };

    // 저장 후 모달 닫기 수정
    const handleSubmit = async () => {
        try {
            await axios.post('http://localhost:8080/honki/menu/add', menuForm);
            alert('메뉴가 추가되었습니다.');
            fetchMenuList();
            handleCloseModal();  // 수정된 닫기 함수 사용
        } catch (error) {
            console.error('메뉴 추가 실패:', error);
            alert('메뉴 추가에 실패했습니다.');
        }
    };

    const fetchMenuList = async () => {
        try {
            const response = await axios.get('http://localhost:8080/honki/menu/list');
            setMenuList(response.data);
        } catch (error) {
            console.error('메뉴 목록 조회 실패:', error);
        }
    };

    useEffect(() => {
        fetchMenuList();
    }, []);

    const handleDeleteClick = (menuNo: number) => {
        setMenuToDelete(menuNo);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (menuToDelete) {
            try {
                const response = await axios.delete(`http://localhost:8080/honki/menu/delete/${menuToDelete}`);
                if (response.status === 200) {
            setMenuList(prevList => prevList.filter(menu => menu.menuNo !== menuToDelete));
                    alert('메뉴가 삭제되었습니다.');
                }
            } catch (error) {
                console.error('메뉴 삭제 실패:', error);
                alert('메뉴 삭제에 실패했습니다.');
            }
            setShowDeleteModal(false);
            setMenuToDelete(null);
        }
    };

    const handleModifyClick = (menu: Menu) => {
        setModifyForm({
            menuNo: menu.menuNo,
            menuName: menu.menuName,
            menuPrice: menu.menuPrice,
            menuImg: menu.menuImg,
            menuStatus: menu.menuStatus,
            categoryNo: menu.categoryNo,
            categoryName: menu.categoryName,
            engName: menu.engName
        });
        setModifyModal(true);
    };

    const handleModifySubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        // 유효성 검사
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

        try {
            const response = await axios.put('http://localhost:8080/honki/menu/update', modifyForm);
            if (response.status === 200) {
                alert('메뉴가 수정되었습니다.');
                setModifyModal(false);
                fetchMenuList(); // 메뉴 목록 새로고침
            }
        } catch (error) {
            console.error('메뉴 수정 실패:', error);
            alert('메뉴 수정에 실패했습니다.');
        }
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
                        {menuList.map((menu) => (
                            <tr key={menu.menuNo}>
                                <td>{menu.menuNo}</td>
                                <td>{menu.categoryName || '미분류'}</td>
                                <td className="menu-image-cell">
                                    <img 
                                        src={menu.menuImg} 
                                        alt={menu.menuName}
                                        className="menu-image"
                                        onError={(e) => {
                                            e.currentTarget.src = '/default-menu.png'  // 이미지 로드 실패시 기본 이미지
                                        }}
                                    />
                                </td>
                                <td>{menu.menuName}</td>
                                <td>{menu.menuPrice.toLocaleString()}원</td>
                                <td>
                                    <div className='button-menu'>
                                        <button className="edit-btn" onClick={() => handleModifyClick(menu)}>
                                            수정
                                        </button>
                                        <button className="delete-btn" onClick={() => handleDeleteClick(menu.menuNo)}>
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
                <div className="modal-view">
                    <div className="modal-box">
                        <div className="modal-header">
                            <h2>신규 메뉴 추가</h2>
                            <button 
                                type="button"
                                className="close-btn" 
                                onClick={handleCloseModal}
                            >×</button>
                        </div>
                        <div className="modal-body">
                            
                            <div className="form-group">
                                <label>메뉴 이미지</label>
                                <input 
                                    type="text"
                                    value={menuForm.menuImg}
                                    onChange={(e) => setMenuForm(prev => ({
                                        ...prev,
                                        menuImg: e.target.value
                                    }))}
                                    placeholder="메뉴 이미지의 주소를 입력해주세요"
                                />
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
                                <label>영어 명칭</label>
                                <input 
                                    type="text" 
                                    value={menuForm.engName}
                                    onChange={(e) => setMenuForm(prev => ({
                                        ...prev,
                                        engName: e.target.value
                                    }))}
                                    placeholder="메뉴 영어 이름을 작성하세요"
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button 
                                type="button"
                                className="submit-btn" 
                                onClick={handleSubmit}
                            >
                                저장
                            </button>
                            <button 
                                type="button"
                                className="cancel-btn" 
                                onClick={handleCloseModal}
                            >
                                취소
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
                <div className="modal-view">
                    <div className="modal-box">
                        <div className="modal-header">
                            <h2>메뉴 수정</h2>
                            <button 
                                type="button"
                                className="close-btn" 
                                onClick={handleCloseModifyModal}
                            >×</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>메뉴 이미지</label>
                                <input 
                                    type="text"
                                    value={modifyForm.menuImg}
                                    onChange={(e) => setModifyForm(prev => ({
                                        ...prev,
                                        menuImg: e.target.value
                                    }))}
                                    placeholder="메뉴 이미지의 주소를 입력해주세요"
                                />
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
                            <div className="form-group">
                                <label>영어 명칭</label>
                                <input 
                                    type="text" 
                                    value={menuForm.engName}
                                    onChange={(e) => setModifyForm(prev => ({
                                        ...prev,
                                        engName: e.target.value
                                    }))}
                                    placeholder="메뉴 영어 이름을 작성하세요"
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
                                onClick={handleCloseModifyModal}
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
