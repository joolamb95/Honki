import React from "react";
import "../style/TableDetailModal.css";

interface OrderItem {
  name: string;
  quantity: number;
  price?: number;
  subItems?: { name: string; quantity: number; price?: number }[];
}

interface TableDetailModalProps {
  tableNumber: number | null;
  tableData: {
    tableNumber: number;
    items?: OrderItem[];
    totalAmount?: string;
    time?: string;
  } | null;
  onClose: () => void;
}

const TableDetailModal: React.FC<TableDetailModalProps> = ({ tableNumber, tableData, onClose }) => {
  if (!tableNumber || !tableData) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="table-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="detail-header">
          <h2>테이블 {tableNumber}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="order-summary">
          <h3>매장식사</h3>
          <div className="total-price">
            <span>총 주문 금액</span>
            <strong>{tableData.totalAmount || "0원"}</strong>
          </div>
        </div>
        <div className="order-details">
          <h3>주문 정보</h3>
          {tableData.items && tableData.items.length > 0 ? (
            tableData.items.map((item, index) => (
              <div key={index} className="order-item">
                <span>{item.name} x {item.quantity}</span>
                <span>{item.price ? (item.price * item.quantity).toLocaleString() + "원" : "-"}</span>
                {item.subItems?.map((subItem, subIndex) => (
                  <div key={subIndex} className="sub-item">
                    └ {subItem.name} x {subItem.quantity} <span>{subItem.price ? (subItem.price * subItem.quantity).toLocaleString() + "원" : "-"}</span>
                  </div>
                ))}
              </div>
            ))
          ) : (
            <p>주문 내역이 없습니다.</p>
          )}
        </div>
        <div className="order-meta">
          <p>테이블 번호 : 테이블 {tableNumber}</p>
          <p>주문 시간 : {tableData.time || "-"}</p>
        </div>
        <button className="cancel-payment">결제 취소</button>
      </div>
    </div>
  );
};

export default TableDetailModal;
