import React, { useEffect, useState } from "react";
import "../resource/Quiz.css";

const API_URL = "http://localhost:5001/get-quiz";
const AI_URL = "http://localhost:5001/generate-options"; 

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

  // ✅ (중요) 컴포넌트가 열리자마자 퀴즈를 불러오는 useEffect
  useEffect(() => {
    // 매번 새 게임을 시작하고 싶다면 여기서 상태를 초기화
    setQuizCount(0);
    setCorrectCount(0);
    setStreak(0);
    setGameOver(false);

    fetchQuiz();
  }, []);

  // ✅ 퀴즈 불러오기 함수
  const fetchQuiz = async () => {
    if (quizCount >= 10) {
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
    } catch (error) {
      console.error("❌ 퀴즈 로딩 실패:", error);
      setQuestion("퀴즈를 가져오는 데 실패했습니다.");
      setAnswer(null);
    } finally {
      setIsLoading(false);
    }
  };

  // 정답 제출
  const handleCheckAnswer = () => {
    if (!selectedOption) return;
    setIsAnswered(true);
    setQuizCount((prev) => prev + 1);

    if (selectedOption === answer) {
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
    if (quizCount >= 10) {
      setGameOver(true);
    } else {
      fetchQuiz();
    }
  };

  return (
    <div className="quiz-container">
      {!gameOver ? (
        <>
          {/* "새 퀴즈 받기" 버튼 (원한다면 숨겨도 됨) */}
          <button className="quiz-button" onClick={fetchQuiz}>
            🎲 새 퀴즈 받기
          </button>

          {/* 퀴즈 모달 */}
          <div className="modal-overlay">
            <div className="modal-content">
              <h2 className="modal-title">📝 랜덤 상식 퀴즈</h2>

              {isLoading ? (
                <p className="loading-text">⏳ 퀴즈를 불러오는 중...</p>
              ) : (
                <div className="quiz-content">
                  <h3 className="question-text">❓ {question}</h3>

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
                      onClick={handleCheckAnswer}
                      disabled={!selectedOption}
                    >
                      🔍 정답 제출
                    </button>
                  )}

                  <div className="stats">
                    <p>📊 총 도전 횟수: {quizCount}/10</p>
                    <p>🏆 맞춘 개수: {correctCount}</p>
                    <p>🔥 연속 정답: {streak}</p>
                  </div>
                </div>
              )}

              {/* 닫기 버튼 → 부모에서 onClose를 받아 호출 */}
              <button className="close-button" onClick={onClose}>✖ 닫기</button>
            </div>
          </div>

          {/* 정답/오답 결과 모달 */}
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
        // gameOver === true → 게임 종료 화면
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">🎉 게임 종료 🎉</h2>
            <p>총 도전 횟수: 10</p>
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