export enum GameOrigin {
  Pgn = "pgn",
  ChessCom = "chesscom",
  Lichess = "lichess",
  Fen = "fen",
}

export enum EngineName {
  Stockfish17 = "stockfish_17",
  Stockfish17Lite = "stockfish_17_lite",
  Stockfish16_1 = "stockfish_16_1",
  Stockfish16_1Lite = "stockfish_16_1_lite",
  Stockfish16NNUE = "stockfish_16_nnue",
  Stockfish16 = "stockfish_16",
  Stockfish11 = "stockfish_11",
}

export enum MoveClassification {
  Blunder = "blunder",
  Mistake = "mistake",
  Inaccuracy = "inaccuracy",
  Okay = "okay",
  Excellent = "excellent",
  Best = "best",
  Forced = "forced",
  Opening = "opening",
  Perfect = "perfect",
  Splendid = "splendid",
}

export enum Color {
  White = "w",
  Black = "b",
}
