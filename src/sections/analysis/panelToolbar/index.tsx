import { Grid2 as Grid, IconButton, Tooltip } from "@mui/material";
import { Icon } from "@iconify/react";
import { useAtomValue } from "jotai";
import { boardAtom, gameAtom } from "../states";
import { useChessActions } from "@/hooks/useChessActions";
import FlipBoardButton from "./flipBoardButton";
import NextMoveButton from "./nextMoveButton";
import GoToLastPositionButton from "./goToLastPositionButton";
import SaveButton from "./saveButton";
import { useEffect } from "react";
import { getStartingFen } from "@/lib/chess";

export default function PanelToolBar() {
  const board = useAtomValue(boardAtom);
  const { reset: resetBoard, undoMove: undoBoardMove } =
    useChessActions(boardAtom);

  const boardHistory = board.history();
  const game = useAtomValue(gameAtom);
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (boardHistory.length === 0) return;
      if (e.key === "ArrowLeft") {
        undoBoardMove();
      } else if (e.key === "ArrowDown") {
        resetBoard({ fen: getStartingFen({ game: board }) });
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [undoBoardMove, boardHistory, resetBoard, board]);

  return (
    <Grid container justifyContent="center" alignItems="center" size={12}>
      <FlipBoardButton />

      <Tooltip title="Reset board">
        <Grid>
          <IconButton
            onClick={() => resetBoard({ fen: getStartingFen({ game: board }) })}
            disabled={boardHistory.length === 0}
            sx={{ paddingX: 1.2, paddingY: 0.5 }}
          >
            <Icon icon="ri:skip-back-line" />
          </IconButton>
        </Grid>
      </Tooltip>

      <Tooltip title="Go to previous move">
        <Grid>
          <IconButton
            onClick={() => undoBoardMove()}
            disabled={boardHistory.length === 0}
            sx={{ paddingX: 1.2, paddingY: 0.5 }}
          >
            <Icon icon="ri:arrow-left-s-line" height={30} />
          </IconButton>
        </Grid>
      </Tooltip>

      <NextMoveButton />

      <GoToLastPositionButton />
      <Tooltip title="Copy pgn">
        <IconButton
          disabled={game.history().length === 0}
          onClick={() => {
            navigator.clipboard.writeText(game.pgn());
          }}
        >
          <Icon icon="ri:clipboard-line" height={30} />
        </IconButton>
      </Tooltip>
      <SaveButton />
    </Grid>
  );
}
