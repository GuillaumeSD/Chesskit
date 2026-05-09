import { MoveClassification } from "./enums";
import { Move } from "chess.js";

export interface GeminiSettings {
  enabled: boolean;
  autoExplain: boolean;
  apiKey?: string;
}

export interface GeminiExplanationData {
  explanation: string;
  classification: MoveClassification;
  timestamp: number;
}

export interface ExplainedMove {
  fen: string;
  move: Move;
  explanation: string;
  classification: MoveClassification;
}

export interface GeminiExplanationRequest {
  fen: string;
  move: Move;
  bestMove?: string;
}

export interface GeminiExplanationResponse {
  explanation: string;
  error?: string;
}
