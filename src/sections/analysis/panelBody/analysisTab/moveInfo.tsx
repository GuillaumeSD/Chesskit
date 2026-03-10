import { Button, Skeleton, Stack, Typography } from "@mui/material";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import StopIcon from "@mui/icons-material/Stop";
import { useAtomValue } from "jotai";
import { boardAtom, currentPositionAtom } from "../../states";
import { useMemo } from "react";
import { moveLineUciToSan } from "@/lib/chess";
import { MoveClassification } from "@/types/enums";
import Image from "next/image";
import { useTTS } from "@/hooks/useTTS";
import PrettyMoveSan from "@/components/prettyMoveSan";

export default function MoveInfo() {
  const position = useAtomValue(currentPositionAtom);
  const board = useAtomValue(boardAtom);

  const bestMove = position?.lastEval?.bestMove;
  const explanationText = position.eval?.explanation || "";
  const { speak, stop, isPlaying, isSupported } = useTTS(explanationText);

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
    <Stack direction="column" minHeight="60px" justifyContent="center" width="100%" alignItems="center">
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="center"
        columnGap={4}
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

      <Typography 
        fontSize="0.8rem" 
        color="text.secondary" 
        width="100%" 
        textAlign="center" 
        mt={0.5} 
        minHeight="1.2rem"
      >
        {explanationText}
      </Typography>

      {isSupported && explanationText && (
        <Button
          size="small"
          onClick={isPlaying ? stop : speak}
          startIcon={isPlaying ? <StopIcon /> : <VolumeUpIcon />}
          sx={{ mt: 1, textTransform: "none", alignSelf: "center", borderRadius: "16px" }}
          variant="outlined"
          color="inherit"
        >
          {isPlaying ? "Stop Listening" : "Listen Explanation"}
        </Button>
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
