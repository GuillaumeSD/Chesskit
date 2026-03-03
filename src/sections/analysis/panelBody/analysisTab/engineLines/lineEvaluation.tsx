import { LineEval } from "@/types/eval";
import { ListItem, Skeleton, Typography } from "@mui/material";
import { useAtomValue, useSetAtom } from "jotai";
import { boardAtom, boardAnimationDurationAtom } from "../../../states";
import { getLineEvalLabel, moveLineUciToSan } from "@/lib/chess";
import { useChessActions } from "@/hooks/useChessActions";
import PrettyMoveSan from "@/components/prettyMoveSan";

interface Props {
  line: LineEval;
}

export default function LineEvaluation({ line }: Props) {
  const board = useAtomValue(boardAtom);
  const { addMoves } = useChessActions(boardAtom);
  const setAnimationDuration = useSetAtom(boardAnimationDurationAtom);
  const lineLabel = getLineEvalLabel(line);

  const isBlackCp =
    (line.cp !== undefined && line.cp < 0) ||
    (line.mate !== undefined && line.mate < 0);

  const showSkeleton = line.depth < 6;

  const uciToSan = moveLineUciToSan(board.fen());
  const turn = board.turn();

  const getColorFromMoveIdx = (moveIdx: number): "w" | "b" => {
    const moveColor = moveIdx % 2 === 0 ? turn : turn === "w" ? "b" : "w";
    return moveColor;
  };

  return (
    <ListItem disablePadding>
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
          backgroundColor: isBlackCp ? "black" : "white",
          color: isBlackCp ? "white" : "black",
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
          lineLabel
        )}
      </Typography>

      <Typography noWrap fontSize="0.9rem">
        {showSkeleton ? (
          <Skeleton variant="rounded" animation="wave" width="20em" />
        ) : (
          line.pv.map((uci, i) => {
            const san = uciToSan(uci);
            const moveColor = getColorFromMoveIdx(i);

            return (
              <PrettyMoveSan
                key={i}
                san={san}
                color={moveColor}
                additionalText={i < line.pv.length - 1 ? "," : ""}
                boxProps={{
                  onClick: () => {
                    setAnimationDuration(150);
                    addMoves(line.pv.slice(0, i + 1));
                  },
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
            );
          })
        )}
      </Typography>
    </ListItem>
  );
}
