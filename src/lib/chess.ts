import { EvaluateGameParams, LineEval, PositionEval } from "@/types/eval";
import { Game, Player } from "@/types/game";
import { Chess, PieceSymbol, Square } from "chess.js";
import { getPositionWinPercentage } from "./engine/helpers/winPercentage";
import { Color } from "@/types/enums";
import { Piece } from "react-chessboard/dist/chessboard/types";

export const getEvaluateGameParams = (game: Chess): EvaluateGameParams => {
  const history = game.history({ verbose: true });

  const fens = history.map((move) => move.before);
  fens.push(history[history.length - 1].after);

  const uciMoves = history.map(
    (move) => move.from + move.to + (move.promotion || "")
  );

  return { fens, uciMoves };
};

export const getGameFromPgn = (pgn: string): Chess => {
  const game = new Chess();
  game.loadPgn(pgn);

  return game;
};

export const formatGameToDatabase = (game: Chess): Omit<Game, "id"> => {
  const headers: Record<string, string | undefined> = game.getHeaders();

  return {
    pgn: game.pgn(),
    event: headers.Event,
    site: headers.Site,
    date: headers.Date,
    round: headers.Round ?? "?",
    white: {
      name: headers.White || "White",
      rating: headers.WhiteElo ? Number(headers.WhiteElo) : undefined,
    },
    black: {
      name: headers.Black || "Black",
      rating: headers.BlackElo ? Number(headers.BlackElo) : undefined,
    },
    result: headers.Result,
    termination: headers.Termination,
    timeControl: headers.TimeControl,
  };
};

export const getGameToSave = (game: Chess, board: Chess): Chess => {
  if (game.history().length) return game;
  return setGameHeaders(board);
};

export const setGameHeaders = (
  game: Chess,
  params: { white?: Player; black?: Player; resigned?: Color } = {}
): Chess => {
  game.setHeader("Event", "Chesskit Game");
  game.setHeader("Site", "Chesskit.org");
  game.setHeader(
    "Date",
    new Date().toISOString().split("T")[0].replace(/-/g, ".")
  );

  const { white, black, resigned } = params;

  const whiteHeader = game.getHeaders().White;
  const blackHeader = game.getHeaders().Black;
  const whiteName =
    white?.name || (whiteHeader !== "?" ? whiteHeader : "White");
  const blackName =
    black?.name || (blackHeader !== "?" ? blackHeader : "Black");

  game.setHeader("White", whiteName);
  game.setHeader("Black", blackName);

  if (white?.rating) game.setHeader("WhiteElo", `${white.rating}`);
  if (black?.rating) game.setHeader("BlackElo", `${black.rating}`);

  if (resigned) {
    game.setHeader("Result", resigned === "w" ? "0-1" : "1-0");
    game.setHeader(
      "Termination",
      `${resigned === "w" ? blackName : whiteName} won by resignation`
    );
  }

  if (!game.isGameOver()) return game;

  if (game.isCheckmate()) {
    game.setHeader("Result", game.turn() === "w" ? "0-1" : "1-0");
    game.setHeader(
      "Termination",
      `${game.turn() === "w" ? blackName : whiteName} won by checkmate`
    );
  }

  if (game.isInsufficientMaterial()) {
    game.setHeader("Result", "1/2-1/2");
    game.setHeader("Termination", "Draw by insufficient material");
  }

  if (game.isStalemate()) {
    game.setHeader("Result", "1/2-1/2");
    game.setHeader("Termination", "Draw by stalemate");
  }

  if (game.isThreefoldRepetition()) {
    game.setHeader("Result", "1/2-1/2");
    game.setHeader("Termination", "Draw by threefold repetition");
  }

  return game;
};

export const moveLineUciToSan = (
  fen: string
): ((moveUci: string) => string) => {
  const game = new Chess(fen);

  return (moveUci: string): string => {
    try {
      const move = game.move(uciMoveParams(moveUci));
      return move.san;
    } catch {
      return moveUci;
    }
  };
};

export const getEvaluationBarValue = (
  position: PositionEval
): { whiteBarPercentage: number; label: string } => {
  const whiteBarPercentage = getPositionWinPercentage(position);
  const bestLine = position.lines[0];

  if (bestLine.mate) {
    return { label: `M${Math.abs(bestLine.mate)}`, whiteBarPercentage };
  }

  const cp = bestLine.cp;
  if (!cp) return { whiteBarPercentage, label: "0.0" };

  const pEval = Math.abs(cp) / 100;
  let label = pEval.toFixed(1);

  if (label.toString().length > 3) {
    label = pEval.toFixed(0);
  }

  return { whiteBarPercentage, label };
};

export const getIsStalemate = (fen: string): boolean => {
  const game = new Chess(fen);
  return game.isStalemate();
};

export const getWhoIsCheckmated = (fen: string): "w" | "b" | null => {
  const game = new Chess(fen);
  if (!game.isCheckmate()) return null;
  return game.turn();
};

export const uciMoveParams = (
  uciMove: string
): {
  from: Square;
  to: Square;
  promotion?: string | undefined;
} => ({
  from: uciMove.slice(0, 2) as Square,
  to: uciMove.slice(2, 4) as Square,
  promotion: uciMove.slice(4, 5) || undefined,
});

export const isSimplePieceRecapture = (
  fen: string,
  uciMoves: [string, string]
): boolean => {
  const game = new Chess(fen);
  const moves = uciMoves.map((uciMove) => uciMoveParams(uciMove));

  if (moves[0].to !== moves[1].to) return false;

  const piece = game.get(moves[0].to);
  if (piece) return true;

  return false;
};

export const getIsPieceSacrifice = (
  fen: string,
  playedMove: string,
  bestLinePvToPlay: string[]
): boolean => {
  if (!bestLinePvToPlay.length) return false;

  const game = new Chess(fen);
  const whiteToPlay = game.turn() === "w";
  const startingMaterialDifference = getMaterialDifference(fen);

  let moves = [playedMove, ...bestLinePvToPlay];
  if (moves.length % 2 === 1) {
    moves = moves.slice(0, -1);
  }
  let nonCapturingMovesTemp = 1;

  const capturedPieces: { w: PieceSymbol[]; b: PieceSymbol[] } = {
    w: [],
    b: [],
  };
  for (const move of moves) {
    try {
      const fullMove = game.move(uciMoveParams(move));
      if (fullMove.captured) {
        capturedPieces[fullMove.color].push(fullMove.captured);
        nonCapturingMovesTemp = 1;
      } else {
        nonCapturingMovesTemp--;
        if (nonCapturingMovesTemp < 0) break;
      }
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  for (const p of capturedPieces["w"].slice(0)) {
    if (capturedPieces["b"].includes(p)) {
      capturedPieces["b"].splice(capturedPieces["b"].indexOf(p), 1);
      capturedPieces["w"].splice(capturedPieces["w"].indexOf(p), 1);
    }
  }

  if (
    Math.abs(capturedPieces["w"].length - capturedPieces["b"].length) <= 1 &&
    capturedPieces["w"].concat(capturedPieces["b"]).every((p) => p === "p")
  ) {
    return false;
  }

  const endingMaterialDifference = getMaterialDifference(game.fen());

  const materialDiff = endingMaterialDifference - startingMaterialDifference;
  const materialDiffPlayerRelative = whiteToPlay ? materialDiff : -materialDiff;

  return materialDiffPlayerRelative < 0;
};

export const getMaterialDifference = (fen: string): number => {
  const placement = fen.split(" ")[0];
  let diff = 0;

  for (let i = 0; i < placement.length; i++) {
    const c = placement[i];
    switch (c) {
      case "P":
        diff += 1;
        break;
      case "N":
      case "B":
        diff += 3;
        break;
      case "R":
        diff += 5;
        break;
      case "Q":
        diff += 9;
        break;
      case "p":
        diff -= 1;
        break;
      case "n":
      case "b":
        diff -= 3;
        break;
      case "r":
        diff -= 5;
        break;
      case "q":
        diff -= 9;
        break;
    }
  }

  return diff;
};

export const isCheck = (fen: string): boolean => {
  const game = new Chess(fen);
  return game.inCheck();
};

export const getCapturedPieces = (
  fen: string,
  color: Color
): {
  piece: string;
  count: number;
}[] => {
  const capturedPieces =
    color === Color.White
      ? [
          { piece: "p", count: 8 },
          { piece: "b", count: 2 },
          { piece: "n", count: 2 },
          { piece: "r", count: 2 },
          { piece: "q", count: 1 },
        ]
      : [
          { piece: "P", count: 8 },
          { piece: "B", count: 2 },
          { piece: "N", count: 2 },
          { piece: "R", count: 2 },
          { piece: "Q", count: 1 },
        ];

  const fenPiecePlacement = fen.split(" ")[0];

  return capturedPieces.map(({ piece, count }) => {
    const piecesLeftCount = fenPiecePlacement.match(
      new RegExp(piece, "g")
    )?.length;
    const newPiece = pieceFenToSymbol[piece] ?? piece;

    return {
      piece: newPiece,
      count: Math.max(0, count - (piecesLeftCount ?? 0)),
    };
  });
};

const pieceFenToSymbol: Record<string, Piece | undefined> = {
  p: "bP",
  b: "bB",
  n: "bN",
  r: "bR",
  q: "bQ",
  k: "bK",
  P: "wP",
  B: "wB",
  N: "wN",
  R: "wR",
  Q: "wQ",
  K: "wK",
};

export const getLineEvalLabel = (
  line: Pick<LineEval, "cp" | "mate">
): string => {
  if (line.cp !== undefined) {
    return `${line.cp > 0 ? "+" : ""}${(line.cp / 100).toFixed(2)}`;
  }

  if (line.mate) {
    return `${line.mate > 0 ? "+" : "-"}M${Math.abs(line.mate)}`;
  }

  return "?";
};

export const formatUciPv = (fen: string, uciMoves: string[]): string[] => {
  const castlingRights = fen.split(" ")[2];

  let canWhiteCastleKingSide = castlingRights.includes("K");
  let canWhiteCastleQueenSide = castlingRights.includes("Q");
  let canBlackCastleKingSide = castlingRights.includes("k");
  let canBlackCastleQueenSide = castlingRights.includes("q");

  return uciMoves.map((uci) => {
    if (uci === "e1h1" && canWhiteCastleKingSide) {
      canWhiteCastleKingSide = false;
      return "e1g1";
    }
    if (uci === "e1a1" && canWhiteCastleQueenSide) {
      canWhiteCastleQueenSide = false;
      return "e1c1";
    }

    if (uci === "e8h8" && canBlackCastleKingSide) {
      canBlackCastleKingSide = false;
      return "e8g8";
    }
    if (uci === "e8a8" && canBlackCastleQueenSide) {
      canBlackCastleQueenSide = false;
      return "e8c8";
    }

    return uci;
  });
};
