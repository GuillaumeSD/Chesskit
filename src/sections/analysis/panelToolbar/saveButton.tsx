import { useGameDatabase } from "@/hooks/useGameDatabase";
import { Icon } from "@iconify/react";
import { Grid2 as Grid, IconButton, Tooltip } from "@mui/material";
import { useAtomValue } from "jotai";
import { useRouter } from "next/router";
import { boardAtom, gameAtom, gameEvalAtom } from "../states";
import { getGameToSave } from "@/lib/chess";

export default function SaveButton() {
  const game = useAtomValue(gameAtom);
  const board = useAtomValue(boardAtom);
  const gameEval = useAtomValue(gameEvalAtom);
  const { addGame, setGameEval, gameFromUrl } = useGameDatabase();
  const router = useRouter();

  const enableSave =
    !gameFromUrl && (board.history().length || game.history().length);

  const handleSave = async () => {
    if (!enableSave) return;

    const gameToSave = getGameToSave(game, board);

    const gameId = await addGame(gameToSave);
    if (gameEval) {
      await setGameEval(gameId, gameEval);
    }

    router.replace(
      {
        query: { gameId: gameId },
        pathname: router.pathname,
      },
      undefined,
      { shallow: true, scroll: false }
    );
  };

  return (
    <>
      {gameFromUrl ? (
        <Tooltip title="Game saved in database">
          <Grid>
            <IconButton disabled={true} sx={{ paddingX: 2, paddingY: 1 }}>
              <Icon icon="ri:folder-check-line" />
            </IconButton>
          </Grid>
        </Tooltip>
      ) : (
        <Tooltip title="Save game">
          <Grid>
            <IconButton
              onClick={handleSave}
              disabled={!enableSave}
              sx={{ paddingX: 2, paddingY: 1 }}
            >
              <Icon icon="ri:save-3-line" />
            </IconButton>
          </Grid>
        </Tooltip>
      )}
    </>
  );
}
