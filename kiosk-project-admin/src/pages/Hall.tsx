import React, { useState } from "react";
import ChatModal from "../components/ChatModal";
import TableDetailModal from "../components/TableDetailModal";
import "../style/Hall.css";

interface TableProps {
  tableNumber: number;
  items?: { name: string; quantity: number; price?: number; subItems?: { name: string; quantity: number; price?: number }[] }[];
  totalAmount?: string;
  time?: string;
  unreadMessages: number;  // 🔥 추가
  onRightClick: (event: React.MouseEvent, tableNumber: number) => void;
  onChatClick: (tableNumber: number) => void;
}

const Table: React.FC<TableProps> = ({
  tableNumber,
  items = [],
  totalAmount,
  time,
  unreadMessages,  // 🔥 props에서 받기
  onRightClick,
  onChatClick
}) => {
  return (
    <div 
      className="table-container"
      onContextMenu={(event) => onRightClick(event, tableNumber)}
    >
      <div className="table-header">
        <span>테이블 {tableNumber}</span>
        {time && <span className="table-time">{time}</span>}
      </div>
      <div className="table-items">
        {items.map((item, index) => (
          <div key={index} className="table-item">
            <span>{item.name}</span>
            <span>{item.quantity}</span>
          </div>
        ))}
      </div>
      {totalAmount && <div className="table-total">{totalAmount}</div>}
      <button className="chat-icon" onClick={() => onChatClick(tableNumber)}>
  💬
  {unreadMessages > 0 && (
    <span className="unread-badge">{unreadMessages}</span>
  )}
</button>
    </div>
  );
};

const ContextMenu: React.FC<{ x: number; y: number; onDetail: () => void; onClear: () => void }> = ({ x, y, onDetail, onClear }) => {
  return (
    <div className="context-menu" style={{ top: y, left: x }}>
      <button onClick={onDetail}>상세보기</button>
      <button onClick={onClear}>비우기</button>
    </div>
  );
};

const Hall: React.FC = () => {
  const [tables, setTables] = useState([
    { tableNumber: 1, items: [{ name: "라면", quantity: 2, price: 4000, subItems: [{ name: "계란", quantity: 1, price: 500 }] }, { name: "진로", quantity: 4, price: 1900 }], totalAmount: "16,100원", time: "2025-02-05 21:49" },
    { tableNumber: 2 },
    { tableNumber: 3 },
    { tableNumber: 4 },
    { tableNumber: 5 },
    { tableNumber: 6 },
    { tableNumber: 7 },
    { tableNumber: 8 },
    { tableNumber: 9 },
  ]);
  const [unreadMessages, setUnreadMessages] = useState<{ [key: number]: number }>({});
  const [selectedChatTable, setSelectedChatTable] = useState<number | null>(null);

  const [selectedDetailTable, setSelectedDetailTable] = useState<{ 
    tableNumber: number; 
    items?: { name: string; quantity: number; price?: number; subItems?: { name: string; quantity: number; price?: number }[] }[]; 
    totalAmount?: string; 
    time?: string; 
  } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; tableNumber: number } | null>(null);
  const [chatMessages, setChatMessages] = useState<{ [key: number]: { sender: string; text: string }[] }>({
    1: [
      { sender: "guest", text: "사장님 노래 신청 가능한가요?" },
      { sender: "owner", text: "네 무엇을 틀어 드릴까요??" }
    ]
  });

  const handleRightClick = (event: React.MouseEvent, tableNumber: number) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY, tableNumber });
  };

  const handleDetailView = () => {
    if (contextMenu) {
      const selectedTableData = tables.find((t) => t.tableNumber === contextMenu.tableNumber) || null;
      setSelectedDetailTable(selectedTableData);
      setContextMenu(null);
    }
  };


  const handleSendMessage = (tableNumber: number, message: string) => {
  setChatMessages(prev => ({
    ...prev,
    [tableNumber]: [...(prev[tableNumber] || []), { sender: "owner", text: message }]
  }));

  // 채팅창이 열려 있지 않다면 읽지 않은 메시지 증가
  if (selectedChatTable !== tableNumber) {
    setUnreadMessages(prev => ({
      ...prev,
      [tableNumber]: (prev[tableNumber] || 0) + 1
    }));
  }
};

// 채팅창을 열 때 읽지 않은 메세지 개수 초기화
const handleChatClick = (tableNumber: number) => {
  setSelectedChatTable(tableNumber);

  // 읽지 않은 메시지 초기화
  setUnreadMessages(prev => ({
    ...prev,
    [tableNumber]: 0
  }));
};

  const handleClearTable = () => {
    if (!contextMenu) return;
    
    const confirmClear = window.confirm("정말로 비우시겠습니까?");
    if (!confirmClear) {
        setContextMenu(null);
        return;
    }
    
    // 주문 내역 삭제
    setTables(tables.map((t) => (t.tableNumber === contextMenu.tableNumber ? { tableNumber: t.tableNumber } : t)));
    
    // 테이블 상세 정보 삭제
    if (selectedDetailTable?.tableNumber === contextMenu.tableNumber) {
      setSelectedDetailTable(null);
    }

    // 채팅 내역 삭제
    setChatMessages(prev => {
      const updatedMessages = { ...prev };
      delete updatedMessages[contextMenu.tableNumber];
      return updatedMessages;
    });
    
    setContextMenu(null);
  };

  return (
    <div className="table-layout" onClick={() => setContextMenu(null)}>
     {tables.map((table) => (
  <Table 
    key={table.tableNumber} 
    {...table} 
    unreadMessages={unreadMessages[table.tableNumber] || 0} // 🔥 추가
    onRightClick={handleRightClick} 
    onChatClick={handleChatClick} 
  />
))}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onDetail={handleDetailView}
          onClear={handleClearTable}
        />
      )}

      {/* 채팅 모달 */}
      <ChatModal 
        tableNumber={selectedChatTable} 
        messages={chatMessages[selectedChatTable || 0] || []} 
        onSendMessage={handleSendMessage} 
        onClose={() => setSelectedChatTable(null)} 
      />

      {/* 테이블 상세 모달 */}
      <TableDetailModal 
      tableNumber={selectedDetailTable?.tableNumber || null} 
      tableData={selectedDetailTable} 
      onClose={() => setSelectedDetailTable(null)} 
    />
    </div>
  );
};

export default Hall;
