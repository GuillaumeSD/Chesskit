import { BOARD_THEMES, PIECE_SETS } from "@/constants";
import { atomWithStorage } from "jotai/utils";

export const pieceSetAtom = atomWithStorage<(typeof PIECE_SETS)[number]>(
  "pieceSet",
  "maestro"
);

export const boardThemeAtom = atomWithStorage<
  (typeof BOARD_THEMES)[number]["name"]
>("boardTheme", "Green");
