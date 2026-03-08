import { Chess } from "chess.js";
import { PrimitiveAtom, useAtomValue } from "jotai";
import { useEffect, useRef } from "react";
import { soundThemeAtom } from "@/sections/play/states";

export const useGameSound = (gameAtom: PrimitiveAtom<Chess>) => {
  const game = useAtomValue(gameAtom);
  const soundTheme = useAtomValue(soundThemeAtom);
  const previousMoveCount = useRef(game.history().length);

  useEffect(() => {
    const history = game.history({ verbose: true });
    const currentMoveCount = history.length;

    if (currentMoveCount === previousMoveCount.current) {
      return;
    }

    previousMoveCount.current = currentMoveCount;

    const lastMove = history.at(-1);
    if (!lastMove) return;

    let soundFile = "Move.mp3";

    if (game.isGameOver()) {
      if (game.isCheckmate()) {
        soundFile = "Checkmate.mp3";
      } else if (game.isDraw()) {
        soundFile = "Draw.mp3";
      } else {
        soundFile = "Error.mp3";
      }
    } else if (game.inCheck()) {
      soundFile = "Check.mp3";
    } else if (lastMove.captured || lastMove.promotion) {
      soundFile = "Capture.mp3";
    }

    const audio = new Audio(`/sound/${soundTheme}/${soundFile}`);
    audio.play().catch((e) => console.error("Error playing sound:", e));
  }, [game, soundTheme]);
};
