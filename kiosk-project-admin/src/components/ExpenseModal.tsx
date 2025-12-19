import React, { useState, useEffect } from "react";
import axios from "axios";
import "../style/ExpenseModal.css"; 
import { useDispatch } from "react-redux";
import { AppDispatch } from "../store"; // Redux 스토어 import
import { fetchExpends } from "../slice/expendSlice";

export interface Expense {
  expendNo: number;  
  category: string;
  amount: number;
  expendDate: string; 
  description: string; 
}

interface ExpenseModalProps {
  expenses: Expense[];
  selectedMonth: string;
  onClose: () => void;
}

const ExpenseModal: React.FC<ExpenseModalProps> = ({
  expenses,
  selectedMonth,
  onClose,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [editedExpenses, setEditedExpenses] = useState<Expense[]>([]);
  const [deletedExpenses, setDeletedExpenses] = useState<number[]>([]);

  useEffect(() => {
    setEditedExpenses([...expenses]);
    setDeletedExpenses([]); // 모달 열릴 때 삭제 목록 초기화
  }, [selectedMonth, expenses]);

  // 값 변경 핸들러 (UI에만 반영)
  const handleChange = (index: number, field: keyof Expense, value: string | number) => {
    setEditedExpenses((prev) =>
      prev.map((ex, i) => (i === index ? { ...ex, [field]: value } : ex))
    );
  };

  // 새 지출 내역 추가 (DB 저장 X)
  const handleAddRow = () => {
    setEditedExpenses((prev) => [
      ...prev,
      {
        expendNo: 0, // 새 항목의 경우 DB에서 자동 생성되므로 0 설정
        category: "",
        amount: 0,
        expendDate: new Date().toISOString().split("T")[0], // 오늘 날짜 기본값
        description: "",
      },
    ]);
  };

  // 선택한 지출 내역 삭제 (DB 저장 X)
  const handleDeleteRow = (index: number, expendNo: number) => {
    if (expendNo !== 0) {
      setDeletedExpenses((prev) => [...prev, expendNo]); // 삭제할 데이터 저장
    }
    setEditedExpenses((prev) => prev.filter((_, i) => i !== index)); // UI에서 즉시 제거
  };

  // 저장 버튼 클릭 시 (삭제 + 추가 + 수정 데이터 반영)
  const handleSave = async () => {
    try {
      // 삭제 요청 (deletedExpenses에 있는 expendNo 리스트)
      if (deletedExpenses.length > 0) {
        await Promise.all(
          deletedExpenses.map((id) => axios.delete(`http://localhost:8080/honki/finance/expends/${id}`))
        );
      }

      // 신규 데이터 저장 (expendNo가 0인 경우)
      const newExpenses = editedExpenses.filter((expense) => expense.expendNo === 0);
      if (newExpenses.length > 0) {
        await axios.post("http://localhost:8080/honki/finance/expends", newExpenses);
      }

      // 기존 데이터 업데이트 (수정된 데이터만 반영)
      const updatedExpenses = editedExpenses.filter(
        (expense) =>
          expense.expendNo !== 0 &&
          expenses.some(
            (original) =>
              original.expendNo === expense.expendNo &&
              (original.category !== expense.category ||
                original.amount !== expense.amount ||
                original.expendDate !== expense.expendDate ||
                original.description !== expense.description)
          )
      );

      if (updatedExpenses.length > 0) {
        await Promise.all(
          updatedExpenses.map((expense) =>
            axios.put(`http://localhost:8080/honki/finance/expends/${expense.expendNo}`, expense)
          )
        );
      }

      // Redux 상태 업데이트
      dispatch(fetchExpends(selectedMonth));
      onClose();
    } catch (error) {
      console.error("❌ 저장 실패:", error);
    }
  };

  return (
    <div className="modal-container">
      <div className="expense-modal">
        <h2>{selectedMonth} 지출 내역 수정</h2>

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
                  <tr key={expense.expendNo || index}>
                    <td>
                      <input
                        type="text"
                        value={expense.category || ""}
                        onChange={(e) => handleChange(index, "category", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={expense.amount ?? 0}
                        onChange={(e) => handleChange(index, "amount", Number(e.target.value))}
                      />
                    </td>
                    <td>
                      <input
                        type="date"
                        value={expense.expendDate || ""}
                        onChange={(e) => handleChange(index, "expendDate", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={expense.description || ""}
                        onChange={(e) => handleChange(index, "description", e.target.value)}
                      />
                    </td>
                    <td>
                      <button className="delete-button" onClick={() => handleDeleteRow(index, expense.expendNo)}>
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="button-group">
          <button className="save-button" onClick={handleSave}>저장</button>
          <button className="cancel-button" onClick={onClose}>취소</button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseModal;
