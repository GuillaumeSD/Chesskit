import { DEFAULT_ENGINE } from "@/constants";
import { Color, EngineName, SoundTheme } from "@/types/enums";
import { CurrentPosition } from "@/types/eval";
import { Chess } from "chess.js";
import { atom } from "jotai";

export const gameAtom = atom(new Chess());
export const gameDataAtom = atom<CurrentPosition>({});
export const playerColorAtom = atom<Color>(Color.White);
export const enginePlayNameAtom = atom<EngineName>(DEFAULT_ENGINE);
export const engineEloAtom = atom(1320);
export const isGameInProgressAtom = atom(false);
export const soundThemeAtom = atom<SoundTheme>(SoundTheme.Standard);
