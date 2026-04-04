import { useChessActions } from "@/hooks/useChessActions";
import { setGameHeaders } from "@/lib/chess";
import { Color } from "@/types/enums";
import { Icon } from "@iconify/react";
import { Button, Grid2 as Grid, IconButton, Tooltip } from "@mui/material";
import { useAtom, useAtomValue } from "jotai";
import { Chess } from "chess.js";
import { useState } from "react";
import NewPlaygroundDialog from "./newPlaygroundDialog";
import { playgroundBoardOrientationAtom, playgroundGameAtom } from "./states";

export default function PlaygroundToolbar() {
  const game = useAtomValue(playgroundGameAtom);
  const { undoMove } = useChessActions(playgroundGameAtom);
  const [boardOrientation, setBoardOrientation] = useAtom(
    playgroundBoardOrientationAtom
  );
  const [openDialog, setOpenDialog] = useState(false);

  const handleCopyPgn = () => {
    if (!game.history().length) return;

    const exportGame = new Chess();
    exportGame.loadPgn(game.pgn());
    setGameHeaders(exportGame);
    navigator.clipboard?.writeText?.(exportGame.pgn());
  };

  return (
    <>
      <Grid container justifyContent="center" alignItems="center" gap={1.5}>
        <Grid>
          <Button variant="contained" onClick={() => setOpenDialog(true)}>
            New playground
          </Button>
        </Grid>

        <Tooltip title="Undo move">
          <Grid>
            <span>
              <IconButton
                onClick={() => undoMove()}
                disabled={game.history().length === 0}
                sx={{ paddingX: 1.2, paddingY: 0.5 }}
              >
                <Icon icon="ri:arrow-go-back-line" />
              </IconButton>
            </span>
          </Grid>
        </Tooltip>

        <Tooltip title="Flip board">
          <Grid>
            <IconButton
              onClick={() =>
                setBoardOrientation(
                  boardOrientation === Color.White ? Color.Black : Color.White
                )
              }
              sx={{ paddingX: 1.2, paddingY: 0.5 }}
            >
              <Icon icon="ri:repeat-line" />
            </IconButton>
          </Grid>
        </Tooltip>

        <Tooltip title="Copy pgn">
          <Grid>
            <span>
              <IconButton
                onClick={handleCopyPgn}
                disabled={game.history().length === 0}
                sx={{ paddingX: 1.2, paddingY: 0.5 }}
              >
                <Icon icon="ri:clipboard-line" />
              </IconButton>
            </span>
          </Grid>
        </Tooltip>
      </Grid>

      <NewPlaygroundDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
      />
    </>
  );
}
