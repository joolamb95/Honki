import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../resource/GameSelectionModal.css";
import Quiz from "./Quizs";
import DrinkingGame from "./DrinkingGame";

const GameSelectionModal = ({ onClose }: { onClose?: () => void }) => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [isGameStarted, setIsGameStarted] = useState(false); // ✅ 추가

  const navigate = useNavigate();

  const handleGameSelection = (game: string) => {
    setSelectedGame(game);
    setIsGameStarted(false); // ✅ 모달이 열릴 때 초기화
  };

  return (
    <div className="modal-overlay">
      <div className="game-selection-container">
        {!selectedGame ? (
          <div className="modal-content">
            <h2>🎮 게임 선택</h2>
            <p>어떤 게임을 하시겠습니까?</p>

            <div className="game-buttons">
              <button className="game-button" onClick={() => handleGameSelection("drinking")}>
                🍻 술게임
              </button>
              <button className="game-button" onClick={() => handleGameSelection("quiz")}>
                📝 퀴즈게임
              </button>
            </div>

            <button className="close-button" onClick={onClose}>✖ 닫기</button>
          </div>
        ) : selectedGame === "drinking" ? (
          <DrinkingGame 
            onClose={() => setSelectedGame(null)}
          />
        ) : (
          <Quiz onClose={() => setSelectedGame(null)} />
        )}
      </div>
    </div>
  );
};

export default GameSelectionModal;
