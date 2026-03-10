import { Icon } from "@iconify/react";
import {
  Alert,
  Grid2 as Grid,
  IconButton,
  Snackbar,
  Tooltip,
} from "@mui/material";
import { useAtomValue } from "jotai";
import { useState } from "react";
import { boardAtom, boardOrientationAtom, gameAtom } from "../states";
import { getGameToSave } from "@/lib/chess";
import { buildShareUrl } from "@/lib/shareGame";

export default function ShareButton() {
  const game = useAtomValue(gameAtom);
  const board = useAtomValue(boardAtom);
  const orientation = useAtomValue(boardOrientationAtom);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "warning";
  }>({ open: false, message: "", severity: "success" });

  const hasGame = game.history().length > 0 || board.history().length > 0;

  const handleShare = () => {
    const gameToShare = getGameToSave(game, board);
    const url = buildShareUrl(gameToShare.pgn(), orientation);

    navigator.clipboard?.writeText?.(url);
    setSnackbar({
      open: true,
      message: "Link copied to clipboard!",
      severity: "success",
    });
  };

  return (
    <>
      <Tooltip title="Share game link">
        <Grid>
          <IconButton
            onClick={handleShare}
            disabled={!hasGame}
            sx={{ paddingX: 1.2, paddingY: 0.5 }}
          >
            <Icon icon="ri:link" />
          </IconButton>
        </Grid>
      </Tooltip>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
