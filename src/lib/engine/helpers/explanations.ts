import { Chess } from "chess.js";
import { MoveClassification } from "@/types/enums";
import { PositionEval } from "@/types/eval";
import { uciMoveParams, moveLineUciToSan } from "@/lib/chess";

export const generateMoveExplanation = (
  fenBefore: string,
  playedUci: string,
  moveClassification: MoveClassification,
  prevPositionEval: PositionEval,
  currentPositionEval: PositionEval
): string | undefined => {
  let explanation = "";

  if (moveClassification === MoveClassification.Opening) {
    return "This is a standard book move in the opening.";
  } else if (moveClassification === MoveClassification.Forced) {
    return "This was a forced move.";
  } else if (moveClassification === MoveClassification.Perfect) {
    return "This was the only good move in the position!";
  } else if (moveClassification === MoveClassification.Splendid) {
    return "Splendid move! You found a brilliant sacrifice or tactic.";
  }

  const gameBefore = new Chess(fenBefore);
  const colorToMove = gameBefore.turn();
  const opponentColorStr = colorToMove === "w" ? "Black" : "White";

  const bestLine = prevPositionEval.lines[0];
  const bestMoveUci = bestLine?.pv[0];

  const sanMoveParams = uciMoveParams(playedUci);
  const gameAfterPlayed = new Chess(fenBefore);
  let playedMove;
  try {
    playedMove = gameAfterPlayed.move(sanMoveParams);
  } catch (e) {
    return undefined;
  }

  if (moveClassification === MoveClassification.Best) {
    return "This is considered the best move in this position.";
  }

  const opponentBestLine = currentPositionEval.lines[0];
  const opponentBestResponseUci = opponentBestLine?.pv[0];
  const opponentBestResponseParams = opponentBestResponseUci
    ? uciMoveParams(opponentBestResponseUci)
    : undefined;

  let tacticalIssueDetected = false;

  const prevEvalMate = bestLine?.mate;
  const currentEvalMate = opponentBestLine?.mate;

  const isMateForPlayer =
    (colorToMove === "w" && prevEvalMate && prevEvalMate > 0) ||
    (colorToMove === "b" && prevEvalMate && prevEvalMate < 0);

  if (isMateForPlayer) {
    const isStillMateForPlayer =
      (colorToMove === "w" && currentEvalMate && currentEvalMate > 0) ||
      (colorToMove === "b" && currentEvalMate && currentEvalMate < 0);
    if (!isStillMateForPlayer) {
      explanation = "You missed a checkmate opportunity.";
      tacticalIssueDetected = true;
    }
  }

  if (!tacticalIssueDetected && opponentBestResponseParams) {
    try {
      const responseMove = gameAfterPlayed.move(opponentBestResponseParams);
      if (responseMove && responseMove.captured) {
        if (opponentBestResponseParams.to === sanMoveParams.to) {
          const pieceName = getPieceName(playedMove.piece);
          explanation = `This move leaves your ${pieceName} undefended. ${opponentColorStr} can capture it with ${responseMove.san}.`;
          tacticalIssueDetected = true;
        } else {
          const pieceName = getPieceName(responseMove.captured);
          explanation = `This move leaves your ${pieceName} hanging. ${opponentColorStr} can capture it with ${responseMove.san}.`;
          tacticalIssueDetected = true;
        }
      }
      gameAfterPlayed.undo();
    } catch (e) {
      gameAfterPlayed.undo();
    }
  }

  if (!tacticalIssueDetected) {
    const cpBefore = bestLine?.cp ?? 0;
    const cpAfter = opponentBestLine?.cp ?? 0;

    const evalDiff =
      colorToMove === "w" ? cpBefore - cpAfter : cpAfter - cpBefore;

    let engineLineStr = "";
    if (opponentBestLine?.pv && opponentBestLine.pv.length > 0) {
      const tempGame = new Chess(fenBefore);
      try {
        tempGame.move(sanMoveParams);
        const sans = [];
        for (const r of opponentBestLine.pv.slice(0, 3)) {
          const m = tempGame.move(uciMoveParams(r));
          sans.push(m.san);
        }
        if (sans.length > 0) {
          engineLineStr = " after " + sans.join(" ");
        }
      } catch (e) {
      
      }
    }

    if (evalDiff > 200) {
      explanation = `This move loses material${engineLineStr}.`;
    } else if (moveClassification === MoveClassification.Blunder) {
      explanation = `This move is a blunder${engineLineStr ? " because it leads to " + engineLineStr.replace("after ", "") : ""}.`;
    } else if (moveClassification === MoveClassification.Mistake) {
      explanation = "This move is a mistake.";
    } else if (moveClassification === MoveClassification.Inaccuracy) {
      explanation = "This move is an inaccuracy.";
    } else if (moveClassification === MoveClassification.Excellent) {
      explanation = "This is an excellent move.";
    } else if (moveClassification === MoveClassification.Okay) {
      explanation = "This is an okay move, but there were better options.";
    }
  }

  if (bestMoveUci && playedUci !== bestMoveUci) {
    const bestMoveSan = moveLineUciToSan(fenBefore)(bestMoveUci);
    explanation += ` Better move: ${bestMoveSan}.`;
  }

  return explanation;
};

const getPieceName = (piece: string): string => {
  switch (piece) {
    case "p":
      return "pawn";
    case "n":
      return "knight";
    case "b":
      return "bishop";
    case "r":
      return "rook";
    case "q":
      return "queen";
    case "k":
      return "king";
    default:
      return "piece";
  }
};
