import React, { useEffect, useMemo, useState } from "react";
import ChatModal from "../components/ChatModal";
import TableDetailModal from "../components/TableDetailModal";
import "../style/Hall.css";
import { setMessages, clearMessages } from "../slice/ChatSlice";
import { RootState } from "../store";
import { useDispatch, useSelector } from "react-redux";
import { useWebSocket } from "../WebSocketContext";

interface TableProps {
  tableNo: number;
  orderNo?: number;
  items?: OrderDetail[];
  totalAmount?: string;
  time?: string;
  onRightClick: (event: React.MouseEvent, tableNo: number) => void;
  onChatClick: (tableNo: number) => void;
  unreadCount?:number;
}

// TableOrder 타입을 반영하여 selectedDetailTable 타입을 수정
interface TableOrder {
  tableNo: number;
  orderNo: number;
  time: string;
  totalAmount: string;
  items: OrderItem[];
}

const Table: React.FC<TableProps> = ({
  tableNo,
  items = [],
  totalAmount,
  time,
  onRightClick,
  onChatClick,
  unreadCount = 0  // 기본값 0으로 설정
}) => {
  return (
    <div 
      className="table-container"
      onContextMenu={(event) => onRightClick(event, tableNo)}
    >
      <div className="table-header">
        <span>테이블 {tableNo}</span>
        {time && <span className="table-time">{time}</span>}
      </div>
      <div className="table-items">
        {items.map((item, index) => (
          <div key={index} className="table-item">
            <span>{item.menuName}</span>
            <span>{item.amount}개</span>
            <span>{item.price.toLocaleString()}원</span>
            {item.optionNo && <span>옵션: {item.optionNo}</span>}
          </div>
        ))}
      </div>
        <div style={{display:'flex',justifyContent:'space-between', alignItems:'center', width:'100%'}}>
          {totalAmount ? <div className="table-total">{totalAmount}</div> : <div className="table-total">0원</div>}
        
              {/* 이모티콘 버튼에 뱃지 추가 */}
              <button 
                        className="chat-icon" 
                        onClick={(e) => {
                          e.stopPropagation();
                          onChatClick(tableNo);
                        }}
                      >
                        💬
                        {unreadCount > 0 && (
                          <span className="unread-badge">{unreadCount}</span>
                        )}
                </button>
          </div>
    </div>
  );
};



interface OrderDetail {
  orderNo: number;
  menuNo: number;
  menuName: string;
  amount: number;
  price: number;
  optionList: string | number | null; // 기존 유지
  optionNo?: string; // 새로운 필드 추가 (문자열로 변환된 옵션)
}

interface OrderItem {
  menuNo: number;
  name: string;
  quantity: number;
  price: number;
  optionNo:string;
}

const ContextMenu: React.FC<{ x: number; y: number; onDetail: () => void; onClear: () => void }> = ({ x, y, onDetail, onClear }) => {
  return (
    <div className="context-menu" style={{ top: y, left: x }}>
      <button onClick={onDetail}>상세보기</button>
      <button onClick={onClear}>비우기</button>
    </div>
  );
};


const Hall: React.FC = () => {
  const { stompClient, orderUpdates } = useWebSocket(); // Context에서 stompClient
  const dispatch = useDispatch();
  // Redux에서 채팅 메시지 가져오기
  const reduxChatMessages = useSelector((state: RootState) => state.chat.messages);
  // 테이블 목록
  const [tables, setTables] = useState<{ tableNo: number;orderNo?:number; items?: OrderDetail[] }[]>([]);
  // 채팅 모달 열려있는 테이블
  const [selectedChatTable, setSelectedChatTable] = useState<number | null>(null);
  // 상세보기 모달
  const [selectedDetailTable, setSelectedDetailTable] = useState<TableOrder | null>(null);

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; tableNo: number } | null>(null);

  const [chatRefreshKey, setChatRefreshKey] = useState(0);


  // =============================
  // 전체 메뉴 불러오기
  const fetchAllOrders = async () => {
    try {
      const response = await fetch("http://localhost:8080/honki/api/orders/all");
      if (!response.ok) {
        console.warn("전체 주문 내역을 불러올 수 없습니다.");
        return;
      }
      const data = await response.json();
      console.log("API 응답 데이터:", data);
  
      if (!Array.isArray(data) || data.length === 0) {
        console.warn("전체 주문 내역이 비어 있거나 올바른 배열이 아닙니다.");
        return;
      }
  
      // 테이블별 데이터 매핑
      const tableOrdersMap: { [key: number]: OrderDetail[] } = {};
  
      data.forEach((order: any) => {
        if (!order) return;
  
        if (!tableOrdersMap[order.tableNo]) {
          tableOrdersMap[order.tableNo] = [];
        }
  
        // 주문 항목 그룹화 (같은 menuNo지만 옵션이 다르면 하나로 묶기)
        const key = `${order.orderNo}-${order.menuNo}`;
  
        let optionString:string = "";
        if (order.optionList) {
          if (Array.isArray(order.optionList)) {
            optionString = (order.optionList as number[]) // 타입 단언 추가
              .filter(opt => opt !== 0) // 숫자인 경우만 처리
              .map(opt => opt.toString()) // string으로 변환
              .join(", ");
          } else {
            optionString = order.optionList.toString();
          }
        }
        const existingItem = tableOrdersMap[order.tableNo].find(
          (i) => `${i.orderNo}-${i.menuNo}` === key
        );
  
        if (existingItem) {
          existingItem.amount += order.totalAmount;
          existingItem.price += order.totalPrice;
  
          if (optionString) {
            existingItem.optionNo = existingItem.optionNo
              ? `${existingItem.optionNo}, ${optionString}`
              : optionString;
          }
        } else {
          tableOrdersMap[order.tableNo].push({
            orderNo: order.orderNo,
            menuNo: order.menuNo,
            menuName: order.menuName,
            amount: order.totalAmount,
            price: order.totalPrice,
            optionList: order.optionList ?? "", // optionList가 없으면 빈 문자열
            optionNo: optionString, // 새로운 필드 추가
          });
        }
      });
  
      console.log("매핑된 테이블 데이터:", tableOrdersMap);
  
      // 상태 업데이트
      setTables(prevTables =>
        prevTables.map(table => {
          const mergedItems = tableOrdersMap[table.tableNo] || [];
  
          if (mergedItems.length === 0) {
            return {
              ...table,
              items: [],
              totalAmount: "0원",
            };
          }
  
          // 총금액 계산
          const newTotal = mergedItems.reduce((acc, it) => acc + it.price, 0);
  
          return {
            ...table,
            items: mergedItems.slice(0, 3), // 최대 3개만 표시
            totalAmount: newTotal.toLocaleString() + "원",
          };
        })
      );
    } catch (error) {
      console.error("전체 주문 정보를 불러오는 중 오류 발생:", error);
    }
  };

  // 채팅 메시지 초기 로딩
  const fetchChatMessages = async (tableNo: number) => {
    try {
      const response = await fetch(`http://localhost:8080/honki/chat/${tableNo}`);
      const data = await response.json();
      dispatch(setMessages({ tableNo, messages: data }));
    } catch (error) {
      console.error("채팅 메시지 불러오기 오류:", error);
    }
  };

  // 초기 테이블 세팅
  useEffect(() => {
    if (selectedChatTable !== null) {
      fetchChatMessages(selectedChatTable);
    }
  }, [selectedChatTable]);
  
  // 처음 렌더링 시 API 호출
  useEffect(() => {
    setTables(Array.from({ length: 9 }, (_, i) => ({ tableNo: i + 1 })));

    // 각 테이블별 주문 내역 가져오기
    for (let i = 1; i <= 9; i++) {
      fetchAllOrders();
    }
  }, []);

  // 주문 업데이트가 감지되면 다시 데이터 불러오기
  useEffect(() => {
    if (orderUpdates) {
        console.log("WebSocket 주문 업데이트 감지, 최신 데이터 반영");
        fetchAllOrders().then(() => {
          setTables((prevTables) => [...prevTables]); // 강제 렌더링 트리거
      });
    }
  }, [orderUpdates]);

   // 3) 우클릭 메뉴
  const handleRightClick = (event: React.MouseEvent, tableNo: number) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY, tableNo });
  };



    // =============================
    // 2) 안 읽은 메시지 계산
    // =============================
    // owner가 아닌(고객이 보낸) 메시지만 count. 모달 열려있으면 0
    const computedUnread = useMemo(() => {
      const newUnread: { [key: number]: number } = {};
      Object.keys(reduxChatMessages).forEach((tableKey) => {
        const tableNo = parseInt(tableKey, 10);
        if (selectedChatTable === tableNo) {
          newUnread[tableNo] = 0;
        } else {
          newUnread[tableNo] = reduxChatMessages[tableNo].filter(
            (msg) => msg.sender !== "owner"
          ).length;
        }
      });
      return newUnread;
    }, [reduxChatMessages, selectedChatTable]);

    // 테이블 상세 정보 가져오기
    const handleDetailView = async () => {
      if (!contextMenu) return;
  
      try {
          const response = await fetch(`http://localhost:8080/honki/api/orders/table/${contextMenu.tableNo}`);
          if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
          }
  
          const data = await response.json();
          console.log("API 응답 데이터:", data);
  
          if (!data || data.length === 0) {
              console.warn("API 응답이 비어 있음");
              setSelectedDetailTable({
                  tableNo: contextMenu.tableNo,
                  orderNo: 0,
                  time: "-",
                  totalAmount: "0원",
                  items: [],
              });
              setContextMenu(null);
              return;
          }
  
          // 주문 항목 그룹화
          const allItems: OrderDetail[] = data.reduce((acc: OrderDetail[], order: any) => {
              return acc.concat(order.orderItems || []);
          }, []);
  
          // 같은 메뉴명을 그룹화하면서 옵션 처리
          const groupedMap = allItems.reduce((acc: { [key: string]: OrderDetail }, item) => {
            
          // 옵션 포함하여 키 생성
          const optionKey = item.optionList && Array.isArray(item.optionList) ? JSON.stringify(item.optionList.sort()) : "no-option";
          const key = `${item.menuName}-${optionKey}`;
              if (!acc[key]) {
                  acc[key] = {
                      ...item,
                      amount: item.amount,
                      price: item.price || 0,  // 가격 0 방지
                  };
              } else {
                acc[key].amount = item.amount || 1;
              }
              return acc;
          }, {});
  
          const mergedItems = Object.values(groupedMap);
  
          setSelectedDetailTable({
            tableNo: data[0]?.tableNo || 0,
            orderNo: data[0]?.orderNo || 0,
            time: data[0]?.orderDate ? new Date(data[0].orderDate).toLocaleDateString() : "-", // 백엔드에서 시분초 를 넘겨받지 못해 임시로 변경 (toLoacleString)
            totalAmount: data[0]?.totalPrice ? data[0].totalPrice.toLocaleString() + "원" : "0원",
            items: mergedItems.map((item: OrderDetail) => ({
                menuNo: item.menuNo,
                name: item.menuName || "알 수 없음",
                quantity: item.amount || 0,
                price: item.price || 0,
                optionNo: Array.isArray(item.optionList) ? item.optionList.join(", ") : item.optionList?.toString() || "",
            })),
        });      
          
      } catch (error) {
          console.error("테이블 상세 정보 가져오기 실패:", error);
          alert("테이블 상세 정보를 불러오는 중 오류가 발생했습니다.");
      }
  
      setContextMenu(null);
  };

  const handleClearTable = async () => {
    if (!contextMenu) return;

    const confirmClear = window.confirm("정말로 비우시겠습니까?");
    if (!confirmClear) {
      setContextMenu(null);
      return;
    }
    try {
      await fetch(`http://localhost:8080/honki/chat/clear/${contextMenu.tableNo}`, {
        method: "DELETE",
      });
      // Redux에서 해당 테이블 메시지 clear
      dispatch(clearMessages(contextMenu.tableNo));
      console.log(`테이블 ${contextMenu.tableNo} 메시지 비우기 완료!`);
    } catch (error) {
      console.error("채팅 내역 삭제 중 오류 발생:", error);
    }

    // 주문내역 삭제 요청
    try {
      // 백엔드 API 호출 (STATUS='N'으로 변경하는 엔드포인트)
      console.log(`${contextMenu.tableNo}`);
      const response = await fetch(`http://localhost:8080/honki/api/orders/clear/${contextMenu.tableNo}`, {
          method: "PUT", // 소프트 삭제를 위해 PUT 방식 사용
          headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
          throw new Error("서버에서 주문 삭제를 실패했습니다.");
      }

      console.log(`테이블 ${contextMenu.tableNo}의 주문 내역 삭제 완료`);

      // UI에서 해당 테이블의 주문 내역 삭제
      setTables((prevTables) =>
          prevTables.map((t) =>
              t.tableNo === contextMenu.tableNo
                  ? { ...t, items: [], totalAmount: "0원" } // UI 업데이트
                  : t
          )
      );

  } catch (error) {
      console.error("테이블 비우기 실패:", error);
      alert("테이블 비우는 중 오류가 발생했습니다.");
  }
    setContextMenu(null);
  };

  // =============================
  // 4) 채팅 기능
  // =============================
  // 사장님이 메시지 전송
  const handleSendMessage = (tableNo: number, content: string) => {
    if (!content.trim()) return;
    const newMessage = {
      tableNo,
      sender: "owner",
      content: content.trim(),
      timestamp: Date.now(),
    };
    console.log("[사장님] 메시지 전송:", newMessage);

    if (stompClient && stompClient.connected) {
      stompClient.publish({
        destination: "/app/chat.sendMessage",
        body: JSON.stringify(newMessage),
      });
    } else {
      console.error("WebSocket 연결이 되어있지 않습니다!");
    }
  };

  // 채팅 모달 열기
  const handleChatClick = (tableNo: number) => {
    setSelectedChatTable(tableNo);
    if (!reduxChatMessages[tableNo] || reduxChatMessages[tableNo].length === 0) {
      fetchChatMessages(tableNo);
    }
    // 모달 열면 해당 테이블 메시지 clear → unread 0
    dispatch(clearMessages(tableNo));
  };

  // 모달 닫기
  const handleChatClose = () => {
    console.log("채팅 모달 닫기");
    if (selectedChatTable !== null) {
      dispatch(clearMessages(selectedChatTable));
    }
    setSelectedChatTable(null);
  };

  return (
        <div className="table-layout" onClick={() => setContextMenu(null)}>
          {tables.map((table) => (
        <Table 
            key={table?.tableNo}             // Optional Chaining 사용
            {...table}
            onRightClick={handleRightClick} 
            onChatClick={handleChatClick} 
            unreadCount={computedUnread[table?.tableNo!] ||0}
        />
        ))}
        
      {/* 우클릭 메뉴 */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onDetail={handleDetailView}
          onClear={handleClearTable}
        />
      )}

      {/* 채팅 모달 */}
      {selectedChatTable && (
        <ChatModal
          key={chatRefreshKey}
          tableNo={selectedChatTable}
          onSendMessage={handleSendMessage}
          onClose={handleChatClose}
        />
      )}

      {/* 상세보기 모달 */}
      <TableDetailModal
        tableNo={selectedDetailTable?.tableNo || null}
        tableData={selectedDetailTable ? { ...selectedDetailTable, orderItems: selectedDetailTable.items || [] } : null}
        onClose={() => setSelectedDetailTable(null)}
      />
    </div>
  );
};

export default Hall;
