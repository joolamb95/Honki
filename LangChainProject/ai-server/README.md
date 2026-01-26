# 🧠 Honki AI Server Setup Guide (FastAPI + LangChain)

**이 문서는 Honki AI 서버를 새로운 로컬 환경에서 실행하기 위한 설정 가이드입니다.**
LangChain + OpenAI + FastAPI 조합은 Python 버전과 바이너리 의존성 문제로 실행 오류가 자주 발생하므로, 아래 순서를 그대로 따라주세요.

---

## **1. Python 버전 (중요)** ##

### AI 서버는 Python 3.12.x 기준으로 동작합니다.
❌ Python 3.14 이상은 LangChain/Pydantic/OpenAI SDK와 호환 문제가 발생할 수 있습니다.

### Python 3.12 가상환경 생성
```bash
cd C:\Honki\LangChainProject\ai-server
py -3.12 -m venv venv
venv\Scripts\activate
python --version  # Python 3.12.x 확인
```
---

## **❗ 2. 가상환경 중복 제거 (중요)** ##

### 프로젝트 내에 .venv와 venv가 동시에 존재하면 패키지 충돌이 발생합니다.

PowerShell에서 .venv 삭제:
```powershell
deactivate
Remove-Item -Recurse -Force .venv
```

### VSCode에서도 반드시 다음 인터프리터 선택:
```less
Ctrl + Shift + P → Python: Select Interpreter
→ venv\Scripts\python.exe 선택
```
---

## **📦 3. 필수 패키지 설치** ##
### 기본 패키지
```bash
python -m pip install -U pip setuptools wheel
pip install fastapi uvicorn python-dotenv
pip install langchain langchain-core langchain-community langchain-openai openai
```
---

## **⚙️ 4. 윈도우 필수 바이너리 패키지 (에러 예방용)** ##

### 다음 패키지들은 윈도우에서 종종 import 오류가 발생하므로 바이너리 휠로 강제 설치합니다.
```bash
pip install --only-binary=:all: zstandard
pip install --only-binary=:all: tiktoken
pip install --only-binary=:all: jiter
```

### 문제 발생 시 캐시 제거 후 재설치
```bash
pip cache purge
pip install --no-cache-dir --only-binary=:all: zstandard tiktoken jiter
```

---

## **🔍 5. 설치 확인** ##
```bash
python -c "import zstandard as zstd; print('zstd', zstd.__version__)"
python -c "import tiktoken; import tiktoken._tiktoken as _; print('tiktoken OK')"
python -c "import jiter; print('jiter OK')"
```

---
## **🧩 6. LangChain 최신 import 방식** ##

### 기존 방식 ❌
```python
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
```

### 최신 방식 ✅
```python
from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
```

### LLMChain 대신 Runnable 사용 권장:
```python
prompt = PromptTemplate.from_template("{system}\n\nUser: {user}\nAssistant:")
chain = prompt | chat
resp = chain.invoke({"system": system_prompt, "user": user_prompt})
result = resp.content
```
---

## **🌐 7. 서버 실행 (포트 5001 고정)** ##

### 프론트엔드가 5001번 포트를 사용하므로 AI 서버도 동일 포트로 실행합니다.
```bash
uvicorn app:app --reload --host 0.0.0.0 --port 5001
```

### 정상 실행 시:
```pgsql
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:5001
```

### 브라우저 테스트:
```bash
http://localhost:5001/docs
```
---

## **⚙️ 8. 프론트엔드 연동 (Vite 환경변수)** ##

### 프론트 .env 파일:
```env
VITE_AI_BASE_URL=http://localhost:5001
```

### 프론트 코드:
```ts
const AI_BASE = import.meta.env.VITE_AI_BASE_URL;
fetch(`${AI_BASE}/get-quiz`)
```
---

## 🧯 자주 발생한 오류 & 해결 요약 ##
| 오류 메시지                            | 원인                  | 해결                                    |
| --------------------------------- | ------------------- | ------------------------------------- |
| `pydantic_core._pydantic_core` 없음 | Python 3.14 / 설치 깨짐 | Python 3.12 + 재설치                     |
| `zstandard.backend_c` 없음          | 바이너리 모듈 누락          | `pip install --only-binary zstandard` |
| `tiktoken _tiktoken` 에러           | venv 중복 / 바이너리 누락   | `.venv 삭제 + only-binary 설치`           |
| `langchain.prompts` 없음            | LangChain 구조 변경     | `langchain_core.prompts` 사용           |
| `langchain.chains` 없음             | LLMChain 구식         | Runnable 체인으로 변경                      |
| `jiter.jiter` 없음                  | OpenAI SDK 바이너리 누락  | `pip install --only-binary jiter`     |

---

## ✅ 최종 체크리스트 ##

- Python 3.12 사용 중

- .venv 삭제됨

- venv만 사용 중

- zstandard / tiktoken / jiter 설치 확인

- LangChain import 최신 방식으로 수정

- 서버 --port 5001 로 실행됨

- /docs 접속 가능
