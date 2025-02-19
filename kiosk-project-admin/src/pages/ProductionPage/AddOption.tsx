import React, {useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../style/AddOption.css';

interface Option {
    optionNo: number;          // MENU_NO
    optionName: string;        // MENU_NAME
    optionPrice: number;       // MENU_PRICE
}

interface OptionItem {
    optionNo: string;          // MENU_NO
    optionName: string;        // MENU_NAME
    optionPrice: string;       // MENU_PRICE
}

// interface MenuItem {
//     menuNo: string;
//     categoryName: string;
//     menuImg: string;
//     menuName: string;
//     menuPrice: string;
// }

const AddOption: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [optionToDelete, setOptionToDelete] = useState<string | null>(null);
    const [optionList, setOptionList] = useState<OptionItem[]>([
        { optionNo: 'P004', optionName: '당면사리', optionPrice: '2,900원' },
        { optionNo: 'P003', optionName: '고기추가', optionPrice: '2,000원' },
        { optionNo: 'P002', optionName: '계란', optionPrice: '500원' },
        { optionNo: 'P001', optionName: '라면사리', optionPrice: '2,000원' },
    ]);
    
    const [optionForm, setOptionForm] = useState<Option>({
        optionNo: 0,
        optionName: '',
        optionPrice: 0
    });
    const [modifyModal, setModifyModal] = useState(false);
    const [modifyForm, setModifyForm] = useState<Option>({
        optionNo: 0,
        optionName: '',
        optionPrice: 0
    });

    // const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     const file = e.target.files?.[0];
    //     if (file) {
    //         const reader = new FileReader();
    //         reader.onloadend = () => {
    //             setMenuForm(prev => ({
    //                 ...prev,
    //                 menuImg: reader.result as string
    //             }));
    //         };
    //         reader.readAsDataURL(file);
    //     }
    // };

    // const handleImageDelete = () => {
    //     setMenuForm(prev => ({
    //         ...prev,
    //         menuImg: ''
    //     }));
    // };

    const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        // 유효성 검사
        if (!optionForm.optionName.trim()) {
            alert('메뉴 이름을 입력해주세요.');
            return;
        }
        if (optionForm.optionPrice <= 0) {
            alert('메뉴 가격을 입력해주세요.');
            return;
        }

        // 새로운 메뉴 번호 생성
        const lastOptionNo = optionList[0]?.optionNo || 'P000';
        const newOptionNo = `P${String(Number(lastOptionNo.slice(1)) + 1).padStart(3, '0')}`;

        // 새로운 메뉴 아이템 생성
        const newMenuItem: OptionItem = {
            optionNo: newOptionNo,
            optionName: optionForm.optionName,
            optionPrice: `${optionForm.optionPrice.toLocaleString()}원`
        };

        // 메뉴 리스트 업데이트
        setOptionList(prevList => [newMenuItem, ...prevList]);

        // 초기화
        setOptionForm({
            optionNo: 0,
            optionName: '',
            optionPrice: 0
        });
        setShowModal(false);
    };

    const handleDeleteClick = (optionNo: string) => {
        setOptionToDelete(optionNo);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = () => {
        if (optionToDelete) {
            setOptionList(prevList => prevList.filter(option => option.optionNo !== optionToDelete));
            setShowDeleteModal(false);
            setOptionToDelete(null);
        }
    };

    // 수정 버튼 클릭 시 호출되는 함수
    const handleModifyClick = (option: OptionItem) => {
        setModifyForm({
            optionNo: Number(option.optionNo.slice(1)), // 'P001' -> 1
            optionName: option.optionName,
            optionPrice: Number(option.optionPrice.replace(/[^0-9]/g, '')) // '2,000원' -> 2000
        });
        setModifyModal(true);
    };

    // 수정 저장 버튼 클릭 시 호출되는 함수
    const handleModifySubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        if (!modifyForm.optionName.trim()) {
            alert('옵션 이름을 입력해주세요.');
            return;
        }
        if (modifyForm.optionPrice <= 0) {
            alert('옵션 가격을 입력해주세요.');
            return;
        }

        // 옵션 리스트 업데이트
        setOptionList(prevList => prevList.map(option => {
            if (Number(option.optionNo.slice(1)) === modifyForm.optionNo) {
                return {
                    ...option,
                    optionName: modifyForm.optionName,
                    optionPrice: `${modifyForm.optionPrice.toLocaleString()}원`
                };
            }
            return option;
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
                    신규 옵션 추가
                </button>
            </div>

            <table className='production-table'>
                <thead>
                    <tr>
                        <th>옵션 번호</th>
                        {/* <th>카테고리 이름</th> */}
                        <th>옵션 이름</th>
                        <th>옵션 가격</th>
                        <th>수정/삭제</th>
                    </tr>
                </thead>
                <tbody>
                    {optionList.map((option, index) => (
                        <tr key={index}>
                            <td>{option.optionNo}</td>
                            <td>{option.optionName}</td>
                            <td>{option.optionPrice}</td>
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
                                        onClick={() => handleDeleteClick(option.optionNo)}
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
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>신규 옵션 추가</h2>
                            <button 
                                type="button"
                                className="close-btn" 
                                onClick={() => setShowModal(false)}
                            >×</button>
                        </div>
                        <div className="modal-body">
                            {/* <div className="form-group">
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
                            </div> */}
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
                    <div className="modal-content">
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
