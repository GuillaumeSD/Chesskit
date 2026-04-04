import { CurrentPosition, SavedEvals } from "@/types/eval";
import { Color } from "@/types/enums";
import { setGameHeaders } from "@/lib/chess";
import { Chess } from "chess.js";
import { atom } from "jotai";

export const createPlaygroundGame = (fen?: string) =>
  setGameHeaders(new Chess(fen), {
    white: { name: "White" },
    black: { name: "Black" },
  });

export const playgroundGameAtom = atom(createPlaygroundGame());
export const playgroundCurrentPositionAtom = atom<CurrentPosition>({});
export const playgroundSavedEvalsAtom = atom<SavedEvals>({});
export const playgroundBoardOrientationAtom = atom<Color>(Color.White);
