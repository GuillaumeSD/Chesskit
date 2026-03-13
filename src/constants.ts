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

export const DEFAULT_ENGINE: EngineName = EngineName.Stockfish17Lite;
export const STRONGEST_ENGINE: EngineName = EngineName.Stockfish17;

export const ENGINE_LABELS: Record<
  EngineName,
  { small: string; full: string; sizeMb: number }
> = {
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

export const BOARD_THEMES = [
  { name: "Green", lightSquare: "#eeeed2", darkSquare: "#769656" },
  { name: "Brown", lightSquare: "#f0d9b5", darkSquare: "#b58863" },
  { name: "Blue", lightSquare: "#dee3e6", darkSquare: "#8ca2ad" },
  { name: "Purple", lightSquare: "#e8dff5", darkSquare: "#7b61a6" },
  { name: "Red", lightSquare: "#f0d8bf", darkSquare: "#ba5546" },
  { name: "Icy Sea", lightSquare: "#d9e8ef", darkSquare: "#5a8fa1" },
  { name: "Wood", lightSquare: "#d4a76a", darkSquare: "#8b5e34" },
  { name: "Walnut", lightSquare: "#dcc6a0", darkSquare: "#876e4c" },
  { name: "Marble", lightSquare: "#ebebd4", darkSquare: "#7d9c7d" },
  { name: "Newspaper", lightSquare: "#ffffff", darkSquare: "#cccccc" },
  { name: "Sky", lightSquare: "#d4e5f7", darkSquare: "#6a9cc7" },
  { name: "Stone", lightSquare: "#d6cec3", darkSquare: "#918a81" },
  { name: "Orange", lightSquare: "#f5d5a0", darkSquare: "#d08b18" },
  { name: "Pink", lightSquare: "#f5d5e0", darkSquare: "#d47c9e" },
  { name: "Sand", lightSquare: "#e8d8b8", darkSquare: "#b8976a" },
  { name: "Tan", lightSquare: "#efe4d4", darkSquare: "#b3956a" },
  { name: "Bubblegum", lightSquare: "#f5d5e8", darkSquare: "#c76db3" },
  { name: "Neon", lightSquare: "#ccffcc", darkSquare: "#33cc33" },
  { name: "Metal", lightSquare: "#c0c0c0", darkSquare: "#808080" },
  { name: "Dark Blue", lightSquare: "#b4c1d2", darkSquare: "#3d5a80" },
  { name: "Tournament", lightSquare: "#eeeed2", darkSquare: "#4a7a4a" },
  {
    name: "Translucent",
    lightSquare: "rgba(255,255,255,0.8)",
    darkSquare: "rgba(0,0,0,0.35)",
  },
  { name: "Checkers", lightSquare: "#f0d0b0", darkSquare: "#c04040" },
  { name: "Graffiti", lightSquare: "#e0d8c8", darkSquare: "#6b6056" },
  { name: "Lolz", lightSquare: "#f0e68c", darkSquare: "#da70d6" },
  { name: "Parchment", lightSquare: "#f5eedc", darkSquare: "#cdba91" },
  { name: "Dash", lightSquare: "#ebecd0", darkSquare: "#779954" },
  {
    name: "Glass",
    lightSquare: "rgba(230,230,230,0.85)",
    darkSquare: "rgba(100,120,140,0.75)",
  },
  { name: "8-Bit", lightSquare: "#ababab", darkSquare: "#696969" },
  { name: "Bases", lightSquare: "#f0edd4", darkSquare: "#6d9b58" },
] as const;
