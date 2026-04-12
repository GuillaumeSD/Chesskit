import { EngineName, MoveClassification } from "./types/enums";

export const MAIN_THEME_COLOR = "#3B9AC6";
export const LINEAR_PROGRESS_BAR_COLOR = "#3B9AC6";

export const CLASSIFICATION_COLORS: Record<MoveClassification, string> = {
  [MoveClassification.Opening]: "#dbac86",
  [MoveClassification.Forced]: "#dbac86",
  [MoveClassification.Splendid]: "#19d4af",
  [MoveClassification.Perfect]: "#3894eb",
  [MoveClassification.Best]: "#22ac38",
  [MoveClassification.Excellent]: "#22ac38",
  [MoveClassification.Okay]: "#74b038",
  [MoveClassification.Inaccuracy]: "#f2be1f",
  [MoveClassification.Mistake]: "#e69f00",
  [MoveClassification.Blunder]: "#df5353",
};

export const DEFAULT_ENGINE: EngineName = EngineName.Stockfish18Lite;
export const STRONGEST_ENGINE: EngineName = EngineName.Stockfish18;

export const ENGINE_LABELS: Record<
  EngineName,
  { small: string; full: string; sizeMb: number }
> = {
  [EngineName.Stockfish18]: {
    full: "Stockfish 18 (108MB)",
    small: "Stockfish 18",
    sizeMb: 108,
  },
  [EngineName.Stockfish18Lite]: {
    full: "Stockfish 18 Lite (7MB)",
    small: "Stockfish 18 Lite",
    sizeMb: 7,
  },
  [EngineName.Stockfish17_1]: {
    full: "Stockfish 17.1 (77MB)",
    small: "Stockfish 17.1",
    sizeMb: 77,
  },
  [EngineName.Stockfish17_1Lite]: {
    full: "Stockfish 17.1 Lite (7MB)",
    small: "Stockfish 17.1 Lite",
    sizeMb: 7,
  },
  [EngineName.Stockfish17]: {
    full: "Stockfish 17 (75MB)",
    small: "Stockfish 17",
    sizeMb: 75,
  },
  [EngineName.Stockfish17Lite]: {
    full: "Stockfish 17 Lite (6MB)",
    small: "Stockfish 17 Lite",
    sizeMb: 6,
  },
  [EngineName.Stockfish16_1]: {
    full: "Stockfish 16.1 (64MB)",
    small: "Stockfish 16.1",
    sizeMb: 64,
  },
  [EngineName.Stockfish16_1Lite]: {
    full: "Stockfish 16.1 Lite (6MB)",
    small: "Stockfish 16.1 Lite",
    sizeMb: 6,
  },
  [EngineName.Stockfish16NNUE]: {
    full: "Stockfish 16 (40MB)",
    small: "Stockfish 16",
    sizeMb: 40,
  },
  [EngineName.Stockfish16]: {
    full: "Stockfish 16 Lite (HCE)",
    small: "Stockfish 16 Lite",
    sizeMb: 2,
  },
  [EngineName.Stockfish11]: {
    full: "Stockfish 11 (HCE)",
    small: "Stockfish 11",
    sizeMb: 2,
  },
};

export const PIECE_SETS = [
  "alpha",
  "anarcandy",
  "caliente",
  "california",
  "cardinal",
  "cburnett",
  "celtic",
  "chess7",
  "chessnut",
  "chicago",
  "companion",
  "cooke",
  "dubrovny",
  "fantasy",
  "firi",
  "fresca",
  "gioco",
  "governor",
  "horsey",
  "icpieces",
  "iowa",
  "kiwen-suwi",
  "kosal",
  "leipzig",
  "letter",
  "maestro",
  "merida",
  "monarchy",
  "mpchess",
  "oslo",
  "pirouetti",
  "pixel",
  "reillycraig",
  "rhosgfx",
  "riohacha",
  "shapes",
  "spatial",
  "staunty",
  "symmetric",
  "tatiana",
  "xkcd",
] as const satisfies string[];
