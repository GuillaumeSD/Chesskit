import { DEFAULT_ENGINE } from "@/constants";
import { getRecommendedWorkersNb } from "@/lib/engine/worker";
import { EngineName } from "@/types/enums";
import { CurrentPosition, GameEval, SavedEvals } from "@/types/eval";
import { GeminiSettings } from "@/types/gemini";
import { Chess } from "chess.js";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export const gameEvalAtom = atom<GameEval | undefined>(undefined);
export const gameAtom = atom(new Chess());
export const boardAtom = atom(new Chess());
export const currentPositionAtom = atom<CurrentPosition>({});

export const boardOrientationAtom = atom(true);
export const showBestMoveArrowAtom = atom(true);
export const showPlayerMoveIconAtom = atom(true);

export const engineNameAtom = atom<EngineName>(DEFAULT_ENGINE);
export const engineDepthAtom = atom(14);
export const engineMultiPvAtom = atom(3);
export const engineWorkersNbAtom = atomWithStorage(
  "engineWorkersNb",
  getRecommendedWorkersNb()
);
export const evaluationProgressAtom = atom(0);

export const savedEvalsAtom = atom<SavedEvals>({});

// Gemini integration
export const geminiSettingsAtom = atomWithStorage<GeminiSettings>(
  "geminiSettings",
  {
    enabled: true,
    autoExplain: false,
  }
);
export const currentExplanationAtom = atom<string>("");
export const isLoadingExplanationAtom = atom<boolean>(false);
