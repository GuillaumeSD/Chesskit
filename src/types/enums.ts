export enum GameOrigin {
  Pgn = "pgn",
  ChessCom = "chesscom",
  Lichess = "lichess",
}

export enum EngineName {
  Stockfish17 = "stockfish_17",
  Stockfish17Lite = "stockfish_17_lite",
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

export enum SoundTheme {
  Standard = "standard",
  Piano = "piano",
  NES = "nes",
  SFX = "sfx",
  Futuristic = "futuristic",
  Lisp = "lisp",
  Woodland = "woodland",
  Robot = "robot",
}
