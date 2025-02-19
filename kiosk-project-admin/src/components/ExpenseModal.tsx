import React, { useState, useEffect } from "react";
import "../style/ExpenseModal.css"; // ✅ CSS 파일 적용

export interface Expense {
  expendNo: number;  // ✅ 기존 id → expendNo로 변경
  category: string;
  amount: number;
  expendDate: string; // ✅ 기존 date → expendDate로 변경
  description: string; // ✅ 기존 note → description으로 변경
}

interface ExpenseModalProps {
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  selectedMonth: string;
  onClose: () => void;
}

const ExpenseModal: React.FC<ExpenseModalProps> = ({ expenses, setExpenses, selectedMonth, onClose }) => {
  const [editedExpenses, setEditedExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    setEditedExpenses([...expenses]); // ✅ 모달 열릴 때만 초기화
  }, [selectedMonth, expenses]);

  // ✅ 값 변경 핸들러 (부모 상태는 변경하지 않음)
  const handleChange = (index: number, field: keyof Expense, value: string | number) => {
    const updatedExpenses = [...editedExpenses];
    updatedExpenses[index] = { ...updatedExpenses[index], [field]: value };
    setEditedExpenses(updatedExpenses);
  };

  // ✅ 행 추가 (부모 상태 변경 X)
  const handleAddRow = () => {
    const newExpense: Expense = {
      expendNo: Date.now(), // ✅ 기존 id → expendNo
      category: "",
      amount: 0,
      expendDate: "", // ✅ 기존 date → expendDate
      description: "", // ✅ 기존 note → description
    };
    setEditedExpenses([...editedExpenses, newExpense]);
  };

  // ✅ 행 삭제 (부모 상태 변경 X)
  const handleDeleteRow = (index: number) => {
    const updatedExpenses = editedExpenses.filter((_, i) => i !== index);
    setEditedExpenses(updatedExpenses);
  };

  // ✅ 저장 버튼 (여기서만 부모 상태 변경)
  const handleSave = () => {
    setExpenses([...editedExpenses]); // ✅ 부모 상태 업데이트
    onClose();
  };

  return (
    <div className="modal-container">
    <div className="expense-modal">
      <h2>{selectedMonth} 지출 내역 수정</h2>
  
      {/* ✅ 모달 내부에 세로 스크롤 적용 (가로 스크롤 제거) */}
      <div className="expense-modal-content">
        
        <div className="add-row-container">
          <button onClick={handleAddRow} className="add-row-button">+ 행 추가</button>
        </div>
  
        <div className="expense-table-container">
          <table className="expense-table">
            <thead>
              <tr>
                <th>지출 항목</th>
                <th>지출 금액</th>
                <th>지출 날짜</th>
                <th>비고</th>
                <th>삭제</th>
              </tr>
            </thead>
            <tbody>
              {editedExpenses.map((expense, index) => (
                <tr key={expense.expendNo}>
                <td><input type="text" value={expense.category} onChange={(e) => handleChange(index, "category", e.target.value)} /></td>
                <td><input type="number" value={expense.amount} onChange={(e) => handleChange(index, "amount", Number(e.target.value))} /></td>
                <td><input type="date" value={expense.expendDate} onChange={(e) => handleChange(index, "expendDate", e.target.value)} /></td>
                <td><input type="text" value={expense.description} onChange={(e) => handleChange(index, "description", e.target.value)} /></td>
                <td><button className="delete-button" onClick={() => handleDeleteRow(index)}>삭제</button></td>
              </tr>
              ))}
            </tbody>
          </table>
        </div>
  
      </div>
  
      {/* ✅ 버튼은 스크롤 영향을 받지 않도록 고정 */}
      <div className="button-group">
        <button className="save-button" onClick={handleSave}>저장</button>
        <button className="cancel-button" onClick={onClose}>취소</button>
      </div>
    </div>
  </div>
  );
};

export default ExpenseModal;
