import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const TableManager = () => {
    const { tableNo } = useParams(); // ✅ URL에서 테이블 번호 가져오기
    const navigate = useNavigate();

    useEffect(() => {
        const storedTable = localStorage.getItem("currentTable");
        console.log("📌 기존 localStorage 테이블 값:", storedTable);

        if (tableNo) {
            console.log("📌 URL에서 테이블 번호 가져옴:", tableNo);
            localStorage.setItem("currentTable", tableNo); // ✅ URL 값으로 업데이트
        } else if (!storedTable) {
            console.warn("❌ 테이블 번호가 설정되지 않아 기본값 1을 사용합니다.");
            localStorage.setItem("currentTable", "1"); // ✅ 기본 테이블 번호 설정
            navigate(`/table/1`); // ✅ 기본 테이블 번호 적용하여 이동
        } else {
            console.log("📌 기존 테이블 번호 유지:", storedTable);
        }
    }, [tableNo, navigate]);

    return null; // ✅ UI에 렌더링할 필요 없음
};

export default TableManager;
