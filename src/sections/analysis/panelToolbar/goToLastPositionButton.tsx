import { useAtomValue } from "jotai";
import { boardAtom, gameAtom } from "../states";
import { useChessActions } from "@/hooks/useChessActions";
import { useEffect } from "react";
import { ToolbarButton } from "@/components/ToolbarButton";

export default function GoToLastPositionButton() {
  const { setPgn: setBoardPgn } = useChessActions(boardAtom);
  const game = useAtomValue(gameAtom);
  const board = useAtomValue(boardAtom);

  const gameHistory = game.history();
  const boardHistory = board.history();

  const isButtonDisabled = boardHistory >= gameHistory;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        if (isButtonDisabled) return;
        setBoardPgn(game.pgn());
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isButtonDisabled, setBoardPgn, game]);

  return (
    <ToolbarButton
      tooltip="Go to final position"
      onClick={() => {
        if (isButtonDisabled) return;
        setBoardPgn(game.pgn());
      }}
      icon="ri:skip-forward-line"
      disabled={isButtonDisabled}
    />
  );
}
