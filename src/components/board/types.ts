import { Square } from "react-chessboard/dist/chessboard/types";

export interface CapturedSquare {
  square: Square;
  piece: string;
  timestamp: number;
}

export interface ClickedSquare {
  square: Square;
  color: string;
}
