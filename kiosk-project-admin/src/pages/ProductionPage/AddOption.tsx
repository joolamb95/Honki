import React, {useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../style/AddOption.css';
import axios from 'axios';

interface Option {
    optionNo: number;          // MENU_NO
    categoryNo: number;         // 카테고리 번호 추가
    optionName: string;        // MENU_NAME
    optionPrice: number;       // MENU_PRICE
}

const AddOption: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [optionToDelete, setOptionToDelete] = useState<string | null>(null);
    const [optionList, setOptionList] = useState<Option[]>([]);
    
    // 카테고리 목록
    const categories = ['선택하세요', '사시미', '구이', '꼬치', '찜', '탕', '식사', '라멘', '튀김', '사이드', '음료/주류'];

    const [optionForm, setOptionForm] = useState<Option>({
        optionNo: 0,
        categoryNo: 0,      // 카테고리 번호 초기값 추가
        optionName: '',
        optionPrice: 0
    });
    const [modifyModal, setModifyModal] = useState(false);
    const [modifyForm, setModifyForm] = useState<Option>({
        optionNo: 0,
        categoryNo: 0,      // 카테고리 번호 초기값 추가
        optionName: '',
        optionPrice: 0
    });

    // 초기 폼 상태 정의
    const initialOptionForm: Option = {
        optionNo: 0,
        optionName: '',
        optionPrice: 0,
        categoryNo: 0
    };

    // 폼 상태를 초기화하는 함수
    const resetForm = () => {
        setOptionForm({...initialOptionForm});
    };

    // 모달 닫기 함수 수정
    const handleCloseModal = () => {
        setShowModal(false);
        resetForm();  // 폼 초기화 추가
    };

    // 저장 후 모달 닫기 수정
    const handleSubmit = async () => {
        try {
            await axios.post('http://localhost:8080/honki/menu/option/add', optionForm);
            alert('옵션이 추가되었습니다.');
            fetchOptionList();
            handleCloseModal();  // 수정된 닫기 함수 사용
        } catch (error) {
            console.error('옵션 추가 실패:', error);
            alert('옵션 추가에 실패했습니다.');
        }
    };

    const handleDeleteClick = (optionNo: string) => {
        setOptionToDelete(optionNo);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (optionToDelete) {
            try {
                const response = await axios.delete(`http://localhost:8080/honki/menu/option/delete/${optionToDelete}`);
                if (response.status === 200) {
                    alert('옵션이 삭제되었습니다.');
                    setShowDeleteModal(false);
                    setOptionToDelete(null);
                    fetchOptionList(); // 옵션 목록 새로고침
                }
            } catch (error) {
                console.error('옵션 삭제 실패:', error);
                alert('옵션 삭제에 실패했습니다.');
            }
        }
    };

    // 수정 버튼 클릭 시 호출되는 함수
    const handleModifyClick = (option: Option) => {
        setModifyForm({
            optionNo: option.optionNo,
            categoryNo: option.categoryNo,
            optionName: option.optionName,
            optionPrice: option.optionPrice
        });
        setModifyModal(true);
    };

    // 수정 저장 버튼 클릭 시 호출되는 함수
    const handleModifySubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        if (!modifyForm.optionName.trim()) {
            alert('옵션 이름을 입력해주세요.');
            return;
        }

        try {
            const response = await axios.put('http://localhost:8080/honki/menu/option/update', modifyForm);
            if (response.status === 200) {
                alert('옵션이 수정되었습니다.');
                setModifyModal(false);
                fetchOptionList(); // 옵션 목록 새로고침
            }
        } catch (error) {
            console.error('옵션 수정 실패:', error);
            alert('옵션 수정에 실패했습니다.');
        }
    };

    // API 연동을 위한 fetchOptionList 함수 추가
    const fetchOptionList = async () => {
        try {
            const response = await axios.get('http://localhost:8080/honki/menu/option/list');
            setOptionList(response.data);
        } catch (error) {
            console.error('옵션 목록 조회 실패:', error);
        }
    };

    useEffect(() => {
        fetchOptionList();
    }, []);

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
                    신규 옵션 추가
                </button>
            </div>

            <table className='production-table'>
                <thead>
                    <tr>
                        <th>옵션 번호</th>
                        <th>카테고리</th>
                        <th>옵션 이름</th>
                        <th>옵션 가격</th>
                        <th>수정/삭제</th>
                    </tr>
                </thead>
                <tbody>
                    {optionList.map((option, index) => (
                        <tr key={index}>
                            <td>{option.optionNo}</td>
                            <td>{categories[option.categoryNo]}</td>
                            <td>{option.optionName}</td>
                            <td>{option.optionPrice.toLocaleString()}원</td>
                            <td>
                                <div className='button-menu'>
                                    <button 
                                        className="edit-btn" 
                                        onClick={() => handleModifyClick(option)}
                                    >
                                        수정
                                    </button>
                                    <button 
                                        className="delete-btn"
                                        onClick={() => handleDeleteClick(option.optionNo.toString())}
                                    >
                                        삭제
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {showModal && (
                <div className="modal-view">
                    <div className="modal-box">
                        <div className="modal-header">
                            <h2>신규 옵션 추가</h2>
                            <button 
                                type="button"
                                className="close-btn" 
                                onClick={handleCloseModal}
                            >×</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>카테고리</label>
                                <select
                                    value={optionForm.categoryNo}
                                    onChange={(e) => setOptionForm(prev => ({
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
                                <label>옵션 이름</label>
                                <input 
                                    type="text"
                                    value={optionForm.optionName}
                                    onChange={(e) => setOptionForm(prev => ({
                                        ...prev,
                                        optionName: e.target.value
                                    }))}
                                    placeholder="옵션 이름을 입력하세요"
                                />
                            </div>
                            <div className="form-group">
                                <label>옵션 가격</label>
                                <input 
                                    type="number"
                                    value={optionForm.optionPrice}
                                    onChange={(e) => setOptionForm(prev => ({
                                        ...prev,
                                        optionPrice: Number(e.target.value)
                                    }))}
                                    placeholder="가격을 입력하세요"
                                />
                            </div>
                            {/* <div className="form-group">
                                <label>메뉴 설명</label>
                                <textarea
                                    value={menuForm.engName}
                                    onChange={(e) => setMenuForm(prev => ({
                                        ...prev,
                                        engName: e.target.value
                                    }))}
                                    placeholder="메뉴 설명을 입력하세요"
                                />
                            </div> */}
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
                <div className="modal-view">
                    <div className="modal-box">
                        <div className="modal-header">
                            <h2>옵션 삭제</h2>
                            <button 
                                type="button"
                                className="close-btn" 
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setOptionToDelete(null);
                                }}
                            >×</button>
                        </div>
                        <div className="modal-body">
                            <p>정말 이 옵션를 삭제하시겠습니까?</p>
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
                                    setOptionToDelete(null);
                                }}
                            >
                                취소
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 수정 모달 추가 */}
            {modifyModal && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <div className="modal-header">
                            <h2>옵션 수정</h2>
                            <button 
                                type="button"
                                className="close-btn" 
                                onClick={() => setModifyModal(false)}
                            >×</button>
                        </div>
                        <div className="modal-body">
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
                                <label>옵션 이름</label>
                                <input 
                                    type="text"
                                    value={modifyForm.optionName}
                                    onChange={(e) => setModifyForm(prev => ({
                                        ...prev,
                                        optionName: e.target.value
                                    }))}
                                    placeholder="옵션 이름을 입력하세요"
                                />
                            </div>
                            <div className="form-group">
                                <label>옵션 가격</label>
                                <input 
                                    type="number"
                                    value={modifyForm.optionPrice}
                                    onChange={(e) => setModifyForm(prev => ({
                                        ...prev,
                                        optionPrice: Number(e.target.value)
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

export default AddOption;