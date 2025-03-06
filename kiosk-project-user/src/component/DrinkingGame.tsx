import React, { useEffect, useState } from "react";
import "../resource/DrinkGame.css";

const API_URL = "http://localhost:5001/random-drinking-game";

const DrinkingGame = ({ onClose }: { onClose?: () => void }) => {
  const [playerCount, setPlayerCount] = useState<number>(4);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [selectedPunishments, setSelectedPunishments] = useState<string[]>([]);
  const [punishedPlayers, setPunishedPlayers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [showResult, setShowResult] = useState(false);

  // ✅ 게임 실행 함수 (3초 후 결과 표시)
  const fetchDrinkingGame = async (customPlayerCount?: number) => {
    setShowStartScreen(false); // "복불복 시작" 화면 숨기기
    setIsLoading(true);
    setIsShuffling(true);
    setGameStarted(false);
    setShowResult(false);

    const updatedPlayerCount = customPlayerCount ?? playerCount;
    setPlayerCount(updatedPlayerCount);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ player_count: updatedPlayerCount }),
      });

      if (!response.ok) throw new Error("게임 데이터를 가져올 수 없습니다.");

      const data = await response.json();

      const shuffledPlayers = Array.from(
        { length: updatedPlayerCount },
        (_, i) => `Player ${i + 1}`
      );

      setSelectedPlayers(shuffledPlayers);
      setPunishedPlayers(data.punishment_results.map((p: any) => p.player));
      setSelectedPunishments(data.punishment_results.map((p: any) => p.punishment));

      setTimeout(() => {
        setGameStarted(true);
        setIsShuffling(false);
        setShowResult(true);
      }, 3000);
    } catch (error) {
      console.error("❌ 게임 로딩 실패:", error);
      setIsShuffling(false);
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="game-modal">
        {showStartScreen ? (
          <div className="start-menu">
            <h2>🍻 랜덤 술게임 복불복</h2>

            <label className="dropdown-label">
              인원 수 선택:
              <select
                value={playerCount}
                onChange={(e) => setPlayerCount(Number(e.target.value))}
                className="player-select"
              >
                {Array.from({ length: 10 }, (_, i) => i + 2).map((num) => (
                  <option key={num} value={num}>
                    {num}명
                  </option>
                ))}
              </select>
            </label>

            <div className="button-group10">
              <button
                className="start-button1"
                onClick={() => fetchDrinkingGame(playerCount)}
                disabled={isShuffling}
              >
                🎲 {isShuffling ? "벌칙 섞는 중..." : "복불복 시작"}
              </button>
              <button className="close-button2" onClick={onClose}>
                ❌ 닫기
              </button>
            </div>
          </div>
        ) : showResult ? (
          <div className="game-result">
            <h2>🍻 술게임 결과</h2>
            <h3>🎯 랜덤 선택된 플레이어:</h3>
            <div className="player-list">
              {selectedPlayers.map((player, index) => (
                <div
                  key={index}
                  className={punishedPlayers.includes(player) ? "punished" : "safe"}
                >
                  {player} {punishedPlayers.includes(player) ? "❌ (벌칙)" : "✅"}
                </div>
              ))}
            </div>

            <h3>🔥 벌칙 내용:</h3>
            <ul className="punishment-text">
              {selectedPunishments.map((punishment, index) => (
                <h4 key={index}>{punishment}</h4>
              ))}
            </ul>

            <div className="button-group3">
              <button className="retry-button3" onClick={() => setShowStartScreen(true)}>
                🔄 다시 하기
              </button>
              <button className="close-button3" onClick={onClose}>
                ✖ 닫기
              </button>
            </div>
          </div>
        ) : (
          <div className="loading-screen">⏳ 벌칙 섞는 중...</div>
        )}
      </div>
    </div>
  );
};

export default DrinkingGame;
