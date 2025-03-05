import React from "react";
import "../style/TableDetailModal.css";

interface SubOrderItem {
  name: string;
  quantity: number;
  price?: number;
}

interface OrderItem {
  menuNo: number;
  name: string;
  quantity: number;
  price: number;
  subItems?: SubOrderItem[];  // ✅ subItems 추가
}

interface TableOrder {
  tableNo: number;
  time: string;
  totalAmount: string;
  orderItems: OrderItem[];
}

interface TableDetailModalProps {
  tableNo: number | null;
  tableData: TableOrder | null; // ✅ tableData 추가
  onClose: () => void;
}

const TableDetailModal: React.FC<TableDetailModalProps> = ({ tableNo, tableData, onClose }) => {

  if (!tableNo || !tableData) return null;  // ✅ 데이터가 없으면 모달을 렌더링하지 않음

   // ✅ 총 가격을 재계산하여 올바르게 반영
   const totalOrderAmount = tableData.orderItems.reduce((acc, item) => {
    const itemTotal = item.price ?? 0; // ✅ finalPrice 적용 (이미 서버에서 계산된 값)
    const subItemTotal = item.subItems
    ? item.subItems.reduce((subAcc, subItem) => subAcc + (subItem.price ? subItem.price * subItem.quantity : 0), 0)
    : 0;
return acc + itemTotal + subItemTotal;
}, 0);

  // ✅ 결제 취소 함수 수정
  const handleCancelPayment = async () => {
    if (!tableNo) return;

    const confirmCancel = window.confirm("정말로 결제를 취소하시겠습니까?");
    if (!confirmCancel) return;

    try {
      const response = await fetch(`http://localhost:8080/honki/api/orders/cancel-payment/${tableNo}`, {
        method: "PUT",
      });

      if (response.ok) {
        alert("결제가 취소되었습니다.");
        onClose(); // 모달 닫기
      } else {
        alert("결제 취소 실패");
      }
    } catch (error) {
      console.error("결제 취소 오류:", error);
      alert("결제 취소 중 오류 발생");
    }
  };

  if (!tableNo || !tableData) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="table-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="detail-header">
          <h2>테이블 {tableNo}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="order-summary">
          <h3>매장식사</h3>
          <div className="total-price">
            <span>총 주문 금액</span>
            <strong>{totalOrderAmount.toLocaleString()}원</strong>
          </div>
        </div>
        <div className="order-details">
          <h3>주문 정보</h3>
          {tableData.orderItems && tableData.orderItems.length > 0 ? (
            tableData.orderItems.map((item, index) => (
              <div key={index} className="order-item">
                <span>{item.name} x {item.quantity}</span>
                <span>{item.price ? (item.price).toLocaleString() + "원" : "-"}</span>
                
                {/* ✅ subItems가 존재할 경우만 표시 */}
                {item.subItems && item.subItems.length > 0 && (
                  <div className="sub-items">
                    {item.subItems.map((subItem, subIndex) => (
                      <div key={subIndex} className="sub-item">
                         {subItem.name} x {subItem.quantity} 
                        <span>{subItem.price ? (subItem.price * subItem.quantity).toLocaleString() + "원" : "-"}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>주문 내역이 없습니다.</p>
          )}
        </div>
        <div className="order-meta">
          <p>테이블 번호 : 테이블 {tableNo}</p>
          <p>주문 시간 : {tableData.time || "-"}</p>
        </div>
        <button className="cancel-payment" onClick={handleCancelPayment}>결제 취소</button>
      </div>
    </div>
  );
};

export default TableDetailModal;
