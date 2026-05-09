import { PositionEval } from "@/types/eval";
import {
  getLineWinPercentage,
  getPositionWinPercentage,
} from "./winPercentage";
import { MoveClassification } from "@/types/enums";
import { openings } from "@/data/openings";
import { getIsPieceSacrifice, isHangingPieceCapture } from "@/lib/chess";

// Thresholds for move quality classification (in win percentage points)
// Chess.com seems to adjust these dynamically based on the player's strength... Maybe we could do something similar in the future
const BLUNDER_THRESHOLD = -20;
const MISTAKE_THRESHOLD = -10;
const INACCURACY_THRESHOLD = -5;
const EXCELLENT_THRESHOLD = -2;

export const getMovesClassification = (
  rawPositions: PositionEval[],
  uciMoves: string[],
  fens: string[]
): PositionEval[] => {
  const positionsWinPercentage = rawPositions.map(getPositionWinPercentage);
  let currentOpening: string | undefined = undefined;

  const positions = rawPositions.map((rawPosition, index) => {
    if (index === 0) return rawPosition;

    const currentFen = fens[index].split(" ")[0];

    // Book move: known opening position
    const opening = openings.find((opening) => opening.fen === currentFen);
    if (opening) {
      currentOpening = opening.name;
      return {
        ...rawPosition,
        opening: opening.name,
        moveClassification: MoveClassification.Opening,
      };
    }

    const playedMove = uciMoves[index - 1];
    const prevPosition = rawPositions[index - 1];
    const alternativeLine = prevPosition.lines.find((line) => line.pv[0] !== playedMove);

    // Forced move: only one legal response available
    if (!alternativeLine) {
      return {
        ...rawPosition,
        opening: currentOpening,
        moveClassification: MoveClassification.Forced,
      };
    }

    const isWhiteMove = index % 2 === 1;
    const lastWinPct = positionsWinPercentage[index - 1];
    const currentWinPct = positionsWinPercentage[index];
    const winPctChange = (currentWinPct - lastWinPct) * (isWhiteMove ? 1 : -1);
    const alternativeWinPct = getLineWinPercentage(alternativeLine);
    const alternativeWinPctChange = (alternativeWinPct - lastWinPct) * (isWhiteMove ? 1 : -1);

    if (playedMove === prevPosition.bestMove) {
      const alternativesCollapseSignificantly = alternativeWinPctChange < winPctChange - 10;
      const hangingPieceCapture = isHangingPieceCapture(fens[index - 1], playedMove);
      // Sometimes close to checkmate winPctChange becomes a bad metric, so we also use:
      const alternativeIsUselessSacrifice =
        getIsPieceSacrifice(fens[index - 1], alternativeLine.pv[0], alternativeLine.pv.slice(1)) &&
        alternativeWinPctChange < BLUNDER_THRESHOLD;

      // Best: The move played is the engine's top choice, but not necessarily a brilliant move
      if (hangingPieceCapture || !alternativesCollapseSignificantly || alternativeIsUselessSacrifice) {
        return {
          ...rawPosition,
          opening: currentOpening,
          moveClassification: MoveClassification.Best,
        };
      }

      // Brilliant: The move played involves a piece sacrifice and is the only good move (alternatives collapse significantly)
      if (getIsPieceSacrifice(fens[index - 1], playedMove, rawPosition.lines[0].pv)) {
        return {
          ...rawPosition,
          opening: currentOpening,
          moveClassification: MoveClassification.Splendid,
        };
      }

      // Great: The move played is the only good move (alternatives collapse significantly)
      return {
        ...rawPosition,
        opening: currentOpening,
        moveClassification: MoveClassification.Perfect,
      };
    }

    // Standard classifications
    return {
      ...rawPosition,
      opening: currentOpening,
      moveClassification: classifyByWinPctChange(winPctChange),
    };
  });

  return positions;
};

const classifyByWinPctChange = (winPctChange: number): MoveClassification => {
  if (winPctChange < BLUNDER_THRESHOLD) return MoveClassification.Blunder;
  if (winPctChange < MISTAKE_THRESHOLD) return MoveClassification.Mistake;
  if (winPctChange < INACCURACY_THRESHOLD) return MoveClassification.Inaccuracy;
  if (winPctChange < EXCELLENT_THRESHOLD) return MoveClassification.Okay;
  return MoveClassification.Excellent;
};
