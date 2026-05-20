export interface GameSettings {
  timeControl: number;
  boardColor: "random" | "white" | "black";
  showCoordinates: boolean;
}

export interface GameState {
  status: "setup" | "playing" | "paused" | "finished";
  score: number;
  timeLeft: number;
  targetSquare: string;
  currentBoardOrientation: "white" | "black";
  feedback: {
    message: string;
    type: "success" | "error";
  } | null;
  wrongAnswer: boolean;
}
