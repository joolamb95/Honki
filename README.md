# 🍻 TableOrder Project - Honki

## **개요**
주류 음식점 운영을 위한 통합 테이블 오더 & 매장 관리 플랫폼으로
실시간 주문, 결제, 채팅, 매출·재고·인사 관리와 AI 기반 메뉴 추천까지 포함한 멀티 서버 풀스택 팀 프로젝트입니다. 

Frontend는 **React + TypeScript + Python**, Backend는 **Spring Boot + MyBatis**, DB는 **Oracle DB**, 결제는 **TossPayments API**, 실시간 통신은 **WebSocket**기반으로 설계되었습니다.

---

## 🔧 **기술 스택 (Tech Stack)**

### 🖥️ Backend
- Java 17
- Spring Boot MVC
- Maven
- MyBatis
- WebSocket (실시간 채팅/주문 상태)
- Tomcat (버전 제한 없음)
- JDK 17+

### 🎨 Frontend
- React
- TypeScript
- Vite
- Recharts.js (매출 차트)
- Redux Toolkit (상태 관리)
- Axios
- Python
- LangChain
- OpenAI API(ChatGPT)
- dotenv
- FastAPI
- HTML/CSS

### 🗄️ Database & Infra
- Oracle DB
- MyBatis Mapper XML
- TossPayments API (결제)
- WebSocket
- Local / Dev 환경 분리 구성

---

## 📂 **프로젝트 구조 (Multi-Server Architecture)**

Spring Boot + React 기반 분리형 구조:
```angular2html
[ kiosk-project-user ]    → 손님용 테이블오더 (React)
        ↓ REST / WebSocket
[ kiosk-project-admin ]   → 사장님용 관리자 페이지 (React)
        ↓ REST / WebSocket
[ Honki Backend ]         → 공통 백엔드 API 서버 (Spring Boot)
        ↓
[ Oracle DB ]

[ LangChainProject ]      → AI 메뉴 추천 및 미니게임 서버 (Python)
        ↑
     OpenAI API\
```


- **Controller** : REST API, WebSocket 엔드포인트
- **Service** : 손님/사장님 비즈니스 로직
- **DAO** : DB 접근
- **MyBatis Mapper** : SQL 관리
- **React** : 화면 렌더링, 차트, 실시간 UI 갱신

---
##  **디렉토리 구조**

📂 전체 프로젝트 디렉토리 구조
```angular2html
Honki/
├── honki/                         ★ Spring Boot 공통 백엔드
├── kiosk-project-user/            ★ 손님(테이블오더) 프론트
├── kiosk-project-admin/           ★ 사장님(관리자) 프론트
└── LangChainProject/              ★ AI 메뉴 추천 서버

```

🖥️ Backend (Spring Boot)
```angular2html
src/main/java/com/kh/honki
 ├ category            ★ 시스템 카테고리 관리
 ├ chat                ★ 실시간 채팅 (손님 ↔ 사장님)
 ├ config              ★ 멀티 서버 설정 (CORS / WebSocket)
 ├ finance             ★ 매출 · 지출 · 재무 관리
 ├ hr                  ★ 인사 관리
 ├ menu                ★ 메뉴 관리
 ├ option              ★ 메뉴 옵션 관리
 ├ order               ★ 주문 관리
 ├ orderdetail         ★ 주문 상세 정보
 ├ payment             ★ 결제 관리
 ├ production          ★ 생산 관리
 ├ restaurantTable     ★ 테이블 관리
 ├ stock               ★ 재고 관리
 ├ utils               ★ 백엔드 공통 유틸
 └ HonkiApplication.java

# 상세구조 예시
finance
 ├ controller           ★ 재무 관련 API 엔드포인트
 └ model
      ├ vo               ★ 재무 데이터 VO
      ├ service          ★ 재무 비즈니스 로직
      └ dao              ★ 재무 DB 접근 (MyBatis)


src/main/resources
 ├ mapper                ★ MyBatis XML
 │   ├ finance
 │   ├ order
 │   └ payment
 ├ application.yml
 └ mybatis-config.xml
```

🎨 Frontend (React) --- 사장님
```angular2html
src
 ├ api                   ★ Axios API 모듈
 ├ components            ★ 공통 컴포넌트
 ├ pages
 │   ├ Hall.tsx           ★ 테이블/주문 관리
 │   ├ Dashboard.tsx      ★ 매출 대시보드
 │   ├ SalesAnalysis.tsx  ★ 매출 분석
 │   └ ExpendManagement.tsx ★ 지출 관리
 ├ store                 ★ Redux Toolkit
 ├ styles
 └ utils

```

🎨 Frontend (React) --- 손님
```angular2html
src
 ├ api                   ★ Axios API 모듈
 ├ components            ★ 공통 컴포넌트
 ├ pages
 │   ├ Hall.tsx           ★ 테이블/주문 관리
 │   ├ Dashboard.tsx      ★ 매출 대시보드
 │   ├ SalesAnalysis.tsx  ★ 매출 분석
 │   └ ExpendManagement.tsx ★ 지출 관리
 ├ store                 ★ Redux Toolkit
 ├ styles
 └ utils

```


---

## 📌 **주요 기능 (Key Features)**
### 🍻 주문 & 운영
- 테이블별 주문 관리
- 실시간 주문 상태 반영
- WebSocket 기반 채팅 (홀 ↔ 사장님)

### 💳 결제
- TossPayments API 연동
- 결제 정보 DB 저장
- 결제 기준 매출 집계

### 📊 매출 & 재무 관리
- 일(Daily)/주(Weekly)/월(Monthly) 매출 통계
- 시간대별(AM/PM)·요일별 매출 분석
- 지출 관리 (Expend Management)
- 차트 기반 시각화 (Recharts)

## 🖼️ **화면 설계서 (UI Design)**
👉 Figma 화면 설계 링크:  
**[🎨 피그마 링크]**
(추후 업로드 예정)
---

## 🗺️ **ERD (Database Schema)**
(추후 업로드 예정)
---


## 🔄 **동작 흐름 (Request Flow)**

1. React 화면에서 사용자 이벤트 발생
2. Axios / WebSocket 요청
3. Spring Controller 수신
4. Service → DAO → MyBatis
5. Oracle DB 처리
6. JSON 응답 or 실시간 이벤트 전송
7. React 상태 갱신 및 화면 반영

---

## 🛠️ **로컬 실행 방법 (How to Run)**
### 1️⃣ Backend
```bash
# JDK 17 설치
# Oracle DB 실행
# application.yml DB 정보 수정

```

### 2️⃣ Frontend 손님/사장님 공통(vite)
```bash
npm install
npm run dev

```

### 3️⃣ LangChain(ai-server)
```bash
cd LangChainProject

# 가상환경 생성
python -m venv venv

# 활성화
# Windows
venv\Scripts\activate

# Mac / Linux
source venv/bin/activate

# 패키지 설치
pip install -r requirements.txt

# 환경변수 설정 (.env)
OPENAI_API_KEY=your_api_key

# 서버 실행
python app.py
```

### 4️⃣ 접속
```arduino
http://localhost:8080

```

---

## 📝 **시연 스크린샷**
(추후 업로드 예정)

---

## 🤔💭 **프로젝트 회고**
(추후 업로드 예정)
