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

export default function PanelToolBar() {
  const board = useAtomValue(boardAtom);
  const { resetToStartingPosition: resetBoard, undoMove: undoBoardMove } =
    useChessActions(boardAtom);

  const boardHistory = board.history();
  const game = useAtomValue(gameAtom);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (boardHistory.length === 0) return;
      if (e.key === "ArrowLeft") {
        undoBoardMove();
      } else if (e.key === "ArrowDown") {
        resetBoard();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [undoBoardMove, boardHistory, resetBoard, board]);

  return (
    <Grid container justifyContent="space-around" columns={2} xs={12}>
	<Grid container item justifyContent="center" alignItems="center" xs={8}>
      <FlipBoardButton />

      <Tooltip title="Reset board">
        <Grid>
          <IconButton
            onClick={() => resetBoard()}
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
	
	<Tooltip title="Go to previous key moment">
	<Grid>
    <IconButton
      onClick={() => {}}
		  sx={{ paddingX: 1.2, paddingY: 0.5 }}
		>
		  <Icon icon="solar:file-left-broken" width={24} height={24} />
		</IconButton>
	  </Grid>
	</Tooltip>

      	<Tooltip title="Go to next key moment">
	<Grid>
    <IconButton
      onClick={() => {}}
		  sx={{ paddingX: 1.2, paddingY: 0.5 }}
		>
		  <Icon icon="solar:file-right-broken" width={24} height={24} />
		</IconButton>
	  </Grid>
	</Tooltip>
	  	  
      <GoToLastPositionButton />
      </Grid>
      <Grid container item justifyContent="right" alignItems="center" xs={4}>
      <Tooltip title="Copy pgn">
        <Grid>
          <IconButton
            disabled={game.history().length === 0}
            onClick={() => {
              navigator.clipboard?.writeText?.(game.pgn());
            }}
            sx={{ paddingX: 1.2, paddingY: 0.5 }}
          >
            <Icon icon="ri:clipboard-line" />
          </IconButton>
        </Grid>
      </Tooltip>

      <SaveButton />
      </Grid>
    </Grid>
  );
}