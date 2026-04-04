import PrettyMoveSan from "@/components/prettyMoveSan";
import { useChessActions } from "@/hooks/useChessActions";
import { getLineEvalLabel, moveLineUciToSan } from "@/lib/chess";
import { LineEval } from "@/types/eval";
import { List, ListItem, Skeleton, Stack, Typography } from "@mui/material";
import { useAtomValue } from "jotai";
import { playgroundCurrentPositionAtom, playgroundGameAtom } from "./states";

const linesSkeleton: LineEval[] = Array.from({ length: 3 }).map((_, i) => ({
  pv: [`${i}`],
  depth: 0,
  multiPv: i + 1,
}));

export default function PlaygroundEngineLines() {
  const game = useAtomValue(playgroundGameAtom);
  const position = useAtomValue(playgroundCurrentPositionAtom);
  const { addMoves } = useChessActions(playgroundGameAtom);

  const lines = position.eval?.lines?.length
    ? position.eval.lines.slice(0, 3)
    : linesSkeleton;
  const uciToSan = moveLineUciToSan(game.fen());
  const turn = game.turn();

  const getColorFromMoveIdx = (moveIdx: number): "w" | "b" => {
    if (moveIdx % 2 === 0) return turn;
    return turn === "w" ? "b" : "w";
  };

  return (
    <Stack rowGap={2} width="100%">
      <Stack rowGap={0.5} alignItems="center">
        <Typography variant="h6">Stockfish top lines</Typography>
        {position.opening && (
          <Typography variant="body2" color="text.secondary" textAlign="center">
            {position.opening}
          </Typography>
        )}
      </Stack>

      {game.isGameOver() && (
        <Typography align="center" fontSize="0.9rem">
          Game is over
        </Typography>
      )}

      <List sx={{ width: "100%", padding: 0 }}>
        {lines.map((line) => {
          const showSkeleton = line.depth < 6;
          const isBlackEval =
            (line.cp !== undefined && line.cp < 0) ||
            (line.mate !== undefined && line.mate < 0);

          return (
            <ListItem
              key={line.multiPv}
              disablePadding
              sx={{ marginBottom: 1 }}
            >
              <Typography
                marginRight={1.5}
                marginY={0.3}
                paddingY={0.2}
                noWrap
                overflow="visible"
                width="3.5em"
                minWidth="3.5em"
                textAlign="center"
                fontSize="0.8rem"
                sx={{
                  backgroundColor: isBlackEval ? "black" : "white",
                  color: isBlackEval ? "white" : "black",
                }}
                borderRadius="5px"
                border="1px solid #424242"
                fontWeight="500"
              >
                {showSkeleton ? (
                  <Skeleton
                    variant="rounded"
                    animation="wave"
                    sx={{ color: "transparent" }}
                  >
                    placeholder
                  </Skeleton>
                ) : (
                  getLineEvalLabel(line)
                )}
              </Typography>

              <Typography noWrap fontSize="0.9rem">
                {showSkeleton ? (
                  <Skeleton variant="rounded" animation="wave" width="20em" />
                ) : (
                  line.pv.map((uci, i) => (
                    <PrettyMoveSan
                      key={`${line.multiPv}-${uci}-${i}`}
                      san={uciToSan(uci)}
                      color={getColorFromMoveIdx(i)}
                      additionalText={i < line.pv.length - 1 ? "," : ""}
                      boxProps={{
                        onClick: () => addMoves(line.pv.slice(0, i + 1)),
                        sx: {
                          cursor: "pointer",
                          ml: i ? 0.5 : 0,
                          transition: "opacity 0.2s ease-in-out",
                          "&:hover": {
                            opacity: 0.5,
                          },
                        },
                      }}
                    />
                  ))
                )}
              </Typography>
            </ListItem>
          );
        })}
      </List>
    </Stack>
  );
}
