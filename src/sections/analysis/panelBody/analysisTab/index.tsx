import {
  Grid2 as Grid,
  Grid2Props as GridProps,
  Stack,
  Typography,
} from "@mui/material";
import { useAtomValue } from "jotai";
import { boardAtom, gameAtom, gameEvalAtom } from "../../states";
import PlayersMetric from "./playersMetric";
import MoveInfo from "./moveInfo";
import Opening from "./opening";
import EngineLines from "./engineLines";

export default function AnalysisTab(props: GridProps) {
  const gameEval = useAtomValue(gameEvalAtom);
  const game = useAtomValue(gameAtom);
  const board = useAtomValue(boardAtom);

  const boardHistory = board.history();
  const gameHistory = game.history();

  const isGameOver =
    boardHistory.length > 0 &&
    (board.isCheckmate() ||
      board.isDraw() ||
      boardHistory.join() === gameHistory.join());

  return (
    <Grid
      container
      size={12}
      justifyContent={{ xs: "center", lg: gameEval ? "start" : "center" }}
      alignItems="center"
      flexWrap={{ lg: gameEval ? "nowrap" : undefined }}
      gap={2}
      marginY={{ lg: gameEval ? 1 : undefined }}
      paddingX={{ xs: 0, lg: "calc(4% - 2rem)" }}
      {...props}
      sx={props.hidden ? { display: "none" } : props.sx}
    >
      <Stack
        justifyContent="center"
        alignItems="center"
        rowGap={2}
        minWidth={gameEval ? "min(25rem, 95vw)" : undefined}
        width="100%"
      >
        {gameEval && (
          <PlayersMetric
            title="Accuracy"
            whiteValue={`${gameEval.accuracy.white.toFixed(1)} %`}
            blackValue={`${gameEval.accuracy.black.toFixed(1)} %`}
          />
        )}

        {gameEval?.estimatedElo && (
          <PlayersMetric
            title="Game Rating"
            whiteValue={Math.round(gameEval.estimatedElo.white)}
            blackValue={Math.round(gameEval.estimatedElo.black)}
          />
        )}

        <MoveInfo />

        <Opening />

        {isGameOver && (
          <Typography align="center" fontSize="0.9rem" noWrap>
            Game is over
          </Typography>
        )}

        {/* GeminiExplanation component has been moved to a dialog */}
      </Stack>

      <EngineLines size={{ lg: gameEval ? undefined : 12 }} />
    </Grid>
  );
}
