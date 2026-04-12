import { useAtomValue } from "jotai";
import { boardAtom, gameAtom } from "../states";
import { useChessActions } from "@/hooks/useChessActions";
import { useCallback, useEffect } from "react";
import { ToolbarButton } from "@/components/ToolbarButton";

export default function NextMoveButton() {
  const { playMove: playBoardMove } = useChessActions(boardAtom);
  const game = useAtomValue(gameAtom);
  const board = useAtomValue(boardAtom);

  const gameHistory = game.history();
  const boardHistory = board.history();

  const isButtonEnabled =
    boardHistory.length < gameHistory.length &&
    gameHistory.slice(0, boardHistory.length).join() === boardHistory.join();

  const addNextGameMoveToBoard = useCallback(() => {
    if (!isButtonEnabled) return;

    const nextMoveIndex = boardHistory.length;
    const nextMove = game.history({ verbose: true })[nextMoveIndex];
    const comment = game
      .getComments()
      .find((c) => c.fen === nextMove.after)?.comment;

    if (nextMove) {
      playBoardMove({
        from: nextMove.from,
        to: nextMove.to,
        promotion: nextMove.promotion,
        comment,
      });
    }
  }, [isButtonEnabled, boardHistory, game, playBoardMove]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        addNextGameMoveToBoard();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [addNextGameMoveToBoard]);

  return (
    <ToolbarButton
      tooltip="Go to next move"
      onClick={() => addNextGameMoveToBoard()}
      icon="ri:arrow-right-s-line"
      disabled={!isButtonEnabled}
      iconHeight={30}
    />
  );
}
