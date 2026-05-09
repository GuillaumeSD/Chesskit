import { Box, Skeleton, Stack, Tooltip, Typography } from "@mui/material";
import { useAtomValue } from "jotai";
import {
  boardAtom,
  currentPositionAtom,
  geminiSettingsAtom,
} from "../../states";
import { useMemo } from "react";
import { moveLineUciToSan } from "@/lib/chess";
import { MoveClassification } from "@/types/enums";
import Image from "next/image";
import PrettyMoveSan from "@/components/prettyMoveSan";
import { Icon } from "@iconify/react";

export default function MoveInfo() {
  const position = useAtomValue(currentPositionAtom);
  const board = useAtomValue(boardAtom);
  const geminiSettings = useAtomValue(geminiSettingsAtom);

  const bestMove = position?.lastEval?.bestMove;

  const bestMoveSan = useMemo(() => {
    if (!bestMove) return undefined;

    const lastPosition = board.history({ verbose: true }).at(-1)?.before;
    if (!lastPosition) return undefined;

    return moveLineUciToSan(lastPosition)(bestMove);
  }, [bestMove, board]);

  if (board.history().length === 0) return null;

  if (!bestMoveSan) {
    return (
      <Stack direction="row" alignItems="center" columnGap={5} marginTop={0.8}>
        <Skeleton
          variant="rounded"
          animation="wave"
          width={"12em"}
          sx={{ color: "transparent", maxWidth: "7vw" }}
        >
          <Typography align="center" fontSize="0.9rem">
            placeholder
          </Typography>
        </Skeleton>
      </Stack>
    );
  }

  const moveClassification = position.eval?.moveClassification;

  const showBestMoveLabel =
    moveClassification !== MoveClassification.Best &&
    moveClassification !== MoveClassification.Opening &&
    moveClassification !== MoveClassification.Forced &&
    moveClassification !== MoveClassification.Splendid &&
    moveClassification !== MoveClassification.Perfect;

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="center"
      columnGap={4}
      marginTop={0.5}
      flexWrap="wrap"
    >
      {moveClassification && (
        <Stack direction="row" alignItems="center" spacing={1}>
          <Image
            src={`/icons/${moveClassification}.png`}
            alt="move-icon"
            width={16}
            height={16}
            style={{
              maxWidth: "3.5vw",
              maxHeight: "3.5vw",
            }}
          />

          <Box display="flex" alignItems="center">
            <PrettyMoveSan
              typographyProps={{
                fontSize: "0.9rem",
              }}
              san={position.lastMove?.san ?? ""}
              color={position.lastMove?.color ?? "w"}
              additionalText={
                " is " + moveClassificationLabels[moveClassification]
              }
            />

            {geminiSettings.enabled && (
              <Tooltip title="Scroll down for AI explanation">
                <Box
                  component="span"
                  sx={{ ml: 1, display: "inline-flex", alignItems: "center" }}
                >
                  <Icon
                    icon="ic:baseline-psychology-alt"
                    style={{
                      color: "#1976d2",
                      opacity: 0.7,
                      width: 16,
                      height: 16,
                    }}
                  />
                </Box>
              </Tooltip>
            )}
          </Box>
        </Stack>
      )}

      {showBestMoveLabel && (
        <Stack direction="row" alignItems="center" spacing={1}>
          <Image
            src={"/icons/best.png"}
            alt="move-icon"
            width={16}
            height={16}
            style={{
              maxWidth: "3.5vw",
              maxHeight: "3.5vw",
            }}
          />
          <PrettyMoveSan
            typographyProps={{
              fontSize: "0.9rem",
            }}
            san={bestMoveSan}
            color={position.lastMove?.color ?? "w"}
            additionalText=" was the best move"
          />
        </Stack>
      )}
    </Stack>
  );
}

const moveClassificationLabels: Record<MoveClassification, string> = {
  [MoveClassification.Opening]: "an opening move",
  [MoveClassification.Forced]: "forced",
  [MoveClassification.Splendid]: "splendid !!",
  [MoveClassification.Perfect]: "the only good move !",
  [MoveClassification.Best]: "the best move",
  [MoveClassification.Excellent]: "excellent",
  [MoveClassification.Okay]: "an okay move",
  [MoveClassification.Inaccuracy]: "an inaccuracy",
  [MoveClassification.Mistake]: "a mistake",
  [MoveClassification.Blunder]: "a blunder",
};
