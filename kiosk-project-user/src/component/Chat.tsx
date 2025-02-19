import React, { useState, useEffect } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

type ChatProps = {
    tableId: number;
};

const Chat: React.FC<ChatProps> = ({ tableId }) => {
    const [stompClient, setStompClient] = useState<Client | null>(null);
    const [messages, setMessages] = useState<{ sender: string; content: string }[]>([]);
    const [message, setMessage] = useState("");
    const [username, setUsername] = useState("User");
    const [isModalOpen, setIsModalOpen] = useState(false);  // ✅ 모달 상태 추가

    useEffect(() => {
        let client: Client | null = null;

        const connectWebSocket = () => {
            const socket = new SockJS("http://localhost:8080/honki/stompServer");
            client = new Client({
                webSocketFactory: () => socket,
                reconnectDelay: 5000,
                onConnect: () => {
                    console.log(`✅ WebSocket 연결 성공! - Table ${tableId}`);

                    client!.subscribe(`/topic/table/${tableId}`, (msg) => {
                        const newMessage = JSON.parse(msg.body);
                        setMessages((prev) => [...prev, newMessage]);
                    });

                    client!.publish({
                        destination: "/app/chat.addUser",
                        body: JSON.stringify({ sender: username, tableId, type: "JOIN" })
                    });

                    setStompClient(client);
                },
                onStompError: (frame) => {
                    console.error("🚨 STOMP 프로토콜 에러:", frame);
                    setTimeout(connectWebSocket, 5000);
                },
                onWebSocketClose: () => {
                    console.warn("⚠️ WebSocket 연결 종료됨, 5초 후 재연결...");
                    setTimeout(connectWebSocket, 5000);
                }
            });

            client.activate();
        };

        connectWebSocket();

        return () => {
            if (client) {
                client.deactivate();
                setStompClient(null);
            }
        };
    }, [tableId]);  // ✅ WebSocket과 모달은 독립적으로 유지

    return (
        <div>
            <h2>Chat Room - Table {tableId}</h2>
            <button onClick={() => setIsModalOpen(true)}>Open Chat</button> {/* ✅ 모달 열기 버튼 추가 */}
            
            {isModalOpen && (  // ✅ 모달을 상태에 따라 렌더링
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={() => setIsModalOpen(false)}>&times;</span>
                        <h3>Chat</h3>
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type a message..."
                        />
                        <button onClick={() => {
                            if (stompClient) {
                                stompClient.publish({
                                    destination: "/app/chat.sendMessage",
                                    body: JSON.stringify({ sender: username, content: message, tableId, type: "CHAT" })
                                });
                            }
                        }}>Send</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chat;
