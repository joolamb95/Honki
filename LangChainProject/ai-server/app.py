# 🔹 필요한 패키지 추가
import json
import random
import os
from fastapi.middleware.cors import CORSMiddleware  
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain


load_dotenv(dotenv_path=".env")


OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
LANGSMITH_API_KEY = os.getenv("LANGSMITH_API_KEY")

if not OPENAI_API_KEY:
    raise ValueError("❌ OpenAI API Key가 설정되지 않았습니다.")


app = FastAPI()

# CORS 미들웨어 추가 (CORS 정책 해결)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)


chat = ChatOpenAI(openai_api_key=OPENAI_API_KEY, model_name="gpt-4", temperature=0.7)


class RecommendationRequest(BaseModel):
    last_item: str
    all_menus: list

@app.get("/check-env")
def check_env():
    return {
        "OPENAI_API_KEY": OPENAI_API_KEY[:10] + "******",
        "LANGSMITH_API_KEY": LANGSMITH_API_KEY[:10] + "******" if LANGSMITH_API_KEY else None
    }

@app.post("/recommend")
async def recommend_menu(data: RecommendationRequest):
    try:
        system_prompt = f"""You are a restaurant menu recommendation assistant.
You can only recommend items from the following list: {', '.join(data.all_menus)}
Provide only a comma-separated list of dish names (no extra text)."""

        user_prompt = f"Given the dish '{data.last_item}', recommend 3 or 4 matching dishes."

        prompt_template = PromptTemplate(
            template=f"{system_prompt}\n\nUser: {user_prompt}\nAssistant:",
            input_variables=["all_menus"]
        )
        chain = LLMChain(llm=chat, prompt=prompt_template)
        result = await chain.arun(all_menus=', '.join(data.all_menus))

        recommended_menus = [menu.strip() for menu in result.split(",") if menu.strip()]
        return {"recommended_menus": recommended_menus[:4]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


try:
    with open("quizzes.json", "r", encoding="utf-8") as f:
        quiz_data = json.load(f)["quiz"]
except FileNotFoundError:
    quiz_data = []

@app.get("/get-quiz")
async def get_quiz():
    try:
        if not quiz_data:
            raise HTTPException(status_code=404, detail="퀴즈 데이터가 없습니다.")
        selected_quiz = random.choice(quiz_data)
        return {"question": selected_quiz["question"], "answer": selected_quiz["answer"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class QuizRequest(BaseModel):
    correctAnswer: str

@app.post("/generate-options")
async def generate_options(data: QuizRequest):
    try:
        print(f"✅ [DEBUG] 정답: {data.correctAnswer}")  

        system_prompt = f"""
You are an AI that generates multiple-choice quiz options.
The correct answer is: {data.correctAnswer}.
Generate 3 incorrect but plausible multiple-choice answers related to the correct answer.
Provide only a comma-separated list of three words.
"""
        response = chat.invoke(system_prompt)

  
        options_text = response.content.strip()
        print(f"✅ [DEBUG] AI 응답: {options_text}")  # AI 응답 확인

        options = options_text.split(", ")
        if len(options) < 3:  
            options = ["광개토대왕", "세종대왕", "이순신"]

        options.append(data.correctAnswer)  
        random.shuffle(options)  

        print(f"✅ [DEBUG] 최종 선택지: {options}")  

        return {"options": options}
    except Exception as e:
        print(f"❌ [ERROR] {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    
def load_drinking_game_data():
    try:
        with open("drinking_game.json", "r", encoding="utf-8") as f:
            data = json.load(f)
        return data.get("choices", []), data.get("punishments", [])
    except FileNotFoundError:
        return [], []

DRINKING_GAME_CHOICES, PUNISHMENTS = load_drinking_game_data()

class DrinkingGameRequest(BaseModel):
    player_count: int

@app.post("/random-drinking-game")
async def random_drinking_game(data: DrinkingGameRequest):
    if data.player_count < 1:
        raise HTTPException(status_code=400, detail="플레이어 수는 1명 이상이어야 합니다.")

    if not DRINKING_GAME_CHOICES or not PUNISHMENTS:
        raise HTTPException(status_code=500, detail="게임 데이터를 불러오지 못했습니다.")


    if data.player_count < 5:
        punishment_count = 1  
    elif data.player_count < 7:
        punishment_count = 2  
    elif data.player_count < 9:
        punishment_count = 3  
    else:
        punishment_count = 5  


    players = [f"Player {i+1}" for i in range(data.player_count)]
    punished_players = random.sample(players, min(punishment_count, len(players)))


    selected_games = random.sample(DRINKING_GAME_CHOICES, min(data.player_count, len(DRINKING_GAME_CHOICES)))
    selected_punishments = random.sample(PUNISHMENTS, len(punished_players))  

    punishment_results = [{"player": punished_players[i], "punishment": selected_punishments[i]} for i in range(len(punished_players))]

    return {
        "selected_games": selected_games if selected_games else [],
        "punishment_results": punishment_results if punishment_results else []
    }




# 서버 실행 코드 uvicorn app:app --host "0.0.0.0" --port 5001 --reload

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5001, reload=True)
