import React, { useEffect, useState } from "react";
import "../resource/Quiz.css";

// const API_URL = "http://192.168.30.192:5001/get-quiz";
// const AI_URL = "http://192.168.30.192:5001/generate-options";
const AI_BASE = import.meta.env.VITE_AI_BASE_URL;

const API_URL = `${AI_BASE}/get-quiz`;
const AI_URL  = `${AI_BASE}/generate-options`;

// 부모(Menus)에서 onClose를 받아옴
const Quiz = ({ onClose }: { onClose?: () => void }) => {
  const [question, setQuestion] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [quizCount, setQuizCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState(7);

  useEffect(() => {
    setQuizCount(0);
    setCorrectCount(0);
    setStreak(0);
    setGameOver(false);
    fetchQuiz();
  }, []);

  useEffect(() => {
    if (isAnswered || gameOver) return; // 이미 답변 제출했거나 게임 종료 시 실행 X

    if (timeLeft === 0) {
      handleCheckAnswer(true); // 오답 처리
      return;
    }

    const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);

    return () => clearTimeout(timer); // 클린업 함수
  }, [timeLeft, isAnswered, gameOver]);



// ✅ 퀴즈 불러오기 함수
const fetchQuiz = async () => {
  if (quizCount >= 5) {
    setGameOver(true);
    return;
  }

  try {
    setIsLoading(true);
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("퀴즈를 가져올 수 없습니다.");

    const data = await response.json();
    setQuestion(data.question);
    setAnswer(data.answer);

    // 보기(Options)는 AI_URL에서 생성
    const optionsResponse = await fetch(AI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correctAnswer: data.answer }),
    });
    const optionsData = await optionsResponse.json();
    setOptions(optionsData.options);

    setSelectedOption(null);
    setIsAnswered(false);
    setShowResultModal(false);
    setTimeLeft(7);

  } catch (error) {
    console.error("❌ 퀴즈 로딩 실패:", error);
    setQuestion("퀴즈를 가져오는 데 실패했습니다.");
    setAnswer(null);
  } finally {
    setIsLoading(false);
  }
};

const handleCheckAnswer = (autoFail = false) => {
  if (!selectedOption && !autoFail) return;
  setIsAnswered(true);
  setQuizCount((prev) => prev + 1);

  if (!autoFail && selectedOption === answer) {
    setCorrectCount((prev) => prev + 1);
    setStreak((prev) => prev + 1);
    setResultMessage("🎉 정답입니다!");
  } else {
    setStreak(0);
    setResultMessage(`❌ 오답입니다! 정답: ${answer}`);
  }
  setShowResultModal(true);
};

// 다음 문제로 이동
const handleNextQuestion = () => {
  setShowResultModal(false);
  if (quizCount >= 5) {
    setGameOver(true);
  } else {
    fetchQuiz();
  }
};

return (
  <div className="quiz-container">
    {!gameOver ? (
      <>
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">📝 랜덤 상식 퀴즈</h2>

            {isLoading ? (
              <p className="loading-text">⏳ 퀴즈를 불러오는 중...</p>
            ) : (
              <div className="quiz-content">
                <h3 className="question-text">❓ {question}</h3>

                {/* ⏳ 남은 시간 UI 추가 */}
                <p className="timer">⏳ 남은 시간: <strong>{timeLeft}초</strong></p>

                <div className="options-container">
                  {options.map((opt, index) => (
                    <button
                      key={index}
                      className={`option-button ${selectedOption === opt ? "selected" : ""}`}
                      onClick={() => setSelectedOption(opt)}
                      disabled={isAnswered}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                {!isAnswered && (
                  <button
                    className="answer-button"
                    onClick={() => handleCheckAnswer(false)}
                    disabled={isAnswered || !selectedOption} 
                  >
                    🔍 정답 제출
                  </button>
                )}

                <div className="stats">
                  <p>📊 총 도전 횟수: {quizCount}/5</p>
                  <p>🏆 맞춘 개수: {correctCount}</p>
                  <p>🔥 연속 정답: {streak}</p>
                </div>
              </div>
            )}

            <button className="close-button" onClick={onClose}>✖ 닫기</button>
          </div>
        </div>

        {showResultModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2 className="modal-title">{resultMessage}</h2>
              <button className="next-button" onClick={handleNextQuestion}>
                다음 문제 ➡️
              </button>
            </div>
          </div>
        )}
      </>
    ) : (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2 className="modal-title">🎉 게임 종료 🎉</h2>
          <p>총 도전 횟수: 5</p>
          <p>🏆 맞춘 개수: {correctCount}개</p>
          <p>🔥 최고 연속 정답: {streak}개</p>

          <button className="close-button" onClick={onClose}>✖ 닫기</button>
        </div>
      </div>
    )}
  </div>
);
};

export default Quiz;