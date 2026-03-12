import { PIECE_SETS, BOARD_SETS } from "@/constants";
import { atomWithStorage } from "jotai/utils";

export const pieceSetAtom = atomWithStorage<(typeof PIECE_SETS)[number]>(
  "pieceSet",
  "maestro"
);
export const boardSetAtom = atomWithStorage<(typeof BOARD_SETS)[number] | "none">(
  "boardSet",
  "none"
);
export const boardHueAtom = atomWithStorage("boardHue", 0);
