import { GameSettings, GameState } from "@/types/coordinatesTrainer";
import { useState, useEffect, useCallback } from "react";

export const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
export const ranks = [8, 7, 6, 5, 4, 3, 2, 1];

// This should be made compattible witht the board theme that the user has selected
export const getSquareColor = (file: string, rank: number): string => {
  const isLight = (files.indexOf(file) + ranks.indexOf(rank)) % 2 === 0;
  return isLight ? "#f0d9b5" : "#b58863";
};

export const getDisplayFiles = (orientation: "white" | "black"): string[] => {
  return orientation === "black" ? [...files].reverse() : files;
};

export const getDisplayRanks = (orientation: "white" | "black"): number[] => {
  return orientation === "black" ? [...ranks].reverse() : ranks;
};

const getRandomSquare = (): string => {
  const file = files[Math.floor(Math.random() * 8)];
  const rank = ranks[Math.floor(Math.random() * 8)];
  return `${file}${rank}`;
};

/*  1.This hook serves as the core to the co-ordinates trainer. Following is an overview
    2.Setting and removing feedback text using timeouts.
    3.Generating and verfying target squares.
    4.Handling training start and end.
*/
export const useCoordinateGame = (settings: GameSettings) => {
  const [gameState, setGameState] = useState<GameState>({
    status: "setup",
    score: 0,
    timeLeft: 0,
    targetSquare: getRandomSquare(),
    currentBoardOrientation: "white",
    feedback: null,
    wrongAnswer: false,
  });

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState.status === "playing" && gameState.timeLeft > 0) {
      interval = setInterval(() => {
        setGameState((prev) => {
          if (prev.timeLeft <= 1) {
            return { ...prev, status: "finished", timeLeft: 0 };
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState.status, gameState.timeLeft]);

  // Clear feedback after 2 seconds
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState.feedback) {
      timer = setTimeout(() => {
        setGameState((prev) => ({ ...prev, feedback: null }));
      }, 2000);
    }
    return () => clearTimeout(timer);
  }, [gameState.feedback]);

  const startGame = useCallback(() => {
    const orientation =
      settings.boardColor === "random"
        ? Math.random() > 0.5
          ? "white"
          : "black"
        : (settings.boardColor as "white" | "black");

    setGameState({
      status: "playing",
      score: 0,
      timeLeft: settings.timeControl,
      targetSquare: getRandomSquare(),
      currentBoardOrientation: orientation,
      feedback: null,
      wrongAnswer: false,
    });
  }, [settings]);

  const pauseGame = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      status: prev.status === "paused" ? "playing" : "paused",
    }));
  }, []);

  const stopGame = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      status: "setup",
      score: 0,
      timeLeft: 0,
      feedback: null,
    }));
  }, []);

  const handleSquareClick = useCallback(
    (square: string) => {
      if (gameState.status !== "playing") return;

      if (square === gameState.targetSquare) {
        setGameState((prev) => ({
          ...prev,
          score: prev.score + 1,
          feedback: { message: "✅ Correct!", type: "success" },
          wrongAnswer: false,
          targetSquare: getRandomSquare(),
        }));
      } else {
        setGameState((prev) => ({
          ...prev,
          feedback: { message: "❌ Wrong! Try again", type: "error" },
          wrongAnswer: true,
        }));
      }
    },
    [gameState.status, gameState.targetSquare]
  );

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  return {
    gameState,
    startGame,
    pauseGame,
    stopGame,
    handleSquareClick,
    formatTime,
  };
};

export const timeControls = [
  { label: "30 seconds", value: 30 },
  { label: "1 minute", value: 60 },
  { label: "2 minutes", value: 120 },
  { label: "5 minutes", value: 300 },
  { label: "Unlimited", value: 0 },
];

/*
This hook get the user prefferd settings and passes it to the game state handling hook.
This one hook servers to both the game settings Dialog and the game Setup Form that appears in the start.
Any Change in the settings triggers a respective change in the game state
*/
export const useGameSettings = () => {
  const [settings, setSettings] = useState<GameSettings>({
    timeControl: 60,
    boardColor: "white",
    showCoordinates: false,
  });

  const [showSettings, setShowSettings] = useState(false);

  const updateSettings = (newSettings: Partial<GameSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return {
    settings,
    showSettings,
    setShowSettings,
    updateSettings,
  };
};
