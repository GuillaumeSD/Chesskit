import { Grid2 as Grid } from "@mui/material";
import { PrimitiveAtom, atom, useAtomValue, useSetAtom } from "jotai";
import {
  Arrow,
  PromotionPieceOption,
  Square,
} from "react-chessboard/dist/chessboard/types";
import { useChessActions } from "@/hooks/useChessActions";
import { useCallback, useMemo, useRef, useState } from "react";
import { Color, MoveClassification } from "@/types/enums";
import { Chess } from "chess.js";
import { CurrentPosition } from "@/types/eval";
import EvaluationBar from "./evaluationBar";
import { CLASSIFICATION_COLORS } from "@/constants";
import { Player } from "@/types/game";
import PlayerHeader from "./playerHeader";
import { boardHueAtom, pieceSetAtom } from "./states";
import tinycolor from "tinycolor2";
import Chessground from "./chessground";
import { Config } from "@lichess-org/chessground/config";
import { Key } from "@lichess-org/chessground/types";
import { playIllegalMoveSound } from "@/lib/sounds";
import { DrawShape } from "@lichess-org/chessground/draw";

export interface Props {
  canPlay?: Color | boolean;
  gameAtom: PrimitiveAtom<Chess>;
  boardSize?: number;
  whitePlayer: Player;
  blackPlayer: Player;
  boardOrientation?: Color;
  currentPositionAtom?: PrimitiveAtom<CurrentPosition>;
  showBestMoveArrow?: boolean;
  showPlayerMoveIcon?: boolean;
  showEvaluationBar?: boolean;
}

export default function Board({
  canPlay,
  gameAtom,
  boardSize,
  whitePlayer,
  blackPlayer,
  boardOrientation = Color.White,
  currentPositionAtom = atom({}),
  showBestMoveArrow = false,
  showPlayerMoveIcon = false,
  showEvaluationBar = false,
}: Props) {
  const boardRef = useRef<HTMLDivElement>(null);
  const game = useAtomValue(gameAtom);
  const { playMove } = useChessActions(gameAtom);
  const clickedSquaresAtom = useMemo(() => atom<Square[]>([]), []);
  const setClickedSquares = useSetAtom(clickedSquaresAtom);
  const position = useAtomValue(currentPositionAtom);
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  const [moveClickFrom, setMoveClickFrom] = useState<Square | null>(null);
  const [moveClickTo, setMoveClickTo] = useState<Square | null>(null);
  const pieceSet = useAtomValue(pieceSetAtom);
  const boardHue = useAtomValue(boardHueAtom);

  const gameFen = game.fen();

  const isPiecePlayable = useCallback(
    ({ piece }: { piece: string }): boolean => {
      if (game.isGameOver() || !canPlay) return false;
      if (canPlay === true || canPlay === piece[0]) return true;
      return false;
    },
    [canPlay, game]
  );

  const onMoveEvent = useCallback(
    (source: Key, target: Key) => {
      if (source === "a0" || target === "a0" || game.isGameOver() || !canPlay) {
        playIllegalMoveSound();
        return;
      }

      const piece = game.get(source);
      if (!piece) {
        playIllegalMoveSound();
        return;
      }

      if (canPlay !== true && piece.color !== canPlay) {
        playIllegalMoveSound();
        return;
      }

      playMove({
        from: source,
        to: target,
        promotion: "q", // TODO: handle promotion piece selection
      });
    },
    [canPlay, game, playMove]
  );

  const handleSquareLeftClick = useCallback(
    (square: Square, piece?: string) => {
      setClickedSquares([]);

      if (!moveClickFrom) {
        if (piece && !isPiecePlayable({ piece })) return;
        return;
      }

      const validMoves = game.moves({ square: moveClickFrom, verbose: true });
      const move = validMoves.find((m) => m.to === square);

      if (!move) {
        return;
      }

      setMoveClickTo(square);

      if (
        move.piece === "p" &&
        ((move.color === "w" && square[1] === "8") ||
          (move.color === "b" && square[1] === "1"))
      ) {
        setShowPromotionDialog(true);
        return;
      }

      playMove({
        from: moveClickFrom,
        to: square,
      });
    },
    [game, isPiecePlayable, moveClickFrom, playMove, setClickedSquares]
  );

  const onPromotionPieceSelect = useCallback(
    (piece?: PromotionPieceOption, from?: Square, to?: Square) => {
      if (!piece) return false;
      const promotionPiece = piece[1]?.toLowerCase() ?? "q";

      if (moveClickFrom && moveClickTo) {
        const result = playMove({
          from: moveClickFrom,
          to: moveClickTo,
          promotion: promotionPiece,
        });
        return !!result;
      }

      if (from && to) {
        const result = playMove({
          from,
          to,
          promotion: promotionPiece,
        });
        return !!result;
      }

      return false;
    },
    [moveClickFrom, moveClickTo, playMove]
  );

  const customShapes: DrawShape[] = useMemo(() => {
    const bestMove = position?.lastEval?.bestMove;
    const moveClassification = position?.eval?.moveClassification;

    if (
      bestMove &&
      showBestMoveArrow &&
      moveClassification !== MoveClassification.Best &&
      moveClassification !== MoveClassification.Opening &&
      moveClassification !== MoveClassification.Forced &&
      moveClassification !== MoveClassification.Perfect
    ) {
      return [
        {
          orig: bestMove.slice(0, 2) as Key,
          dest: bestMove.slice(2, 4) as Key,
          brush: "yellow",
        },
      ];
    }

    return [];
  }, [position, showBestMoveArrow]);

  const destSquares = useMemo(() => {
    const dests = new Map<Key, Key[]>();

    const moves = game.moves({ verbose: true });
    for (const move of moves) {
      if (!dests.has(move.from)) {
        dests.set(move.from, []);
      }
      dests.get(move.from)?.push(move.to);
    }

    return dests;
  }, [game]);

  const boardConfig = useMemo(
    () =>
      ({
        fen: gameFen,
        orientation: boardOrientation === Color.White ? "white" : "black",
        animation: { enabled: true, duration: 200 },
        movable: {
          free: false,
          color:
            canPlay === Color.White
              ? "white"
              : canPlay === Color.Black
                ? "black"
                : canPlay
                  ? "both"
                  : undefined,
          showDests: true,
          dests: destSquares,
          events: {
            after: onMoveEvent,
          },
        },
        premovable: { enabled: false },
        draggable: { enabled: true, showGhost: false },
        drawable: {
          enabled: true,
          visible: true,
          defaultSnapToValidMove: false,
          eraseOnClick: true,
          autoShapes: customShapes,
          brushes: {
            green: {
              key: "g",
              color: "#ffaa00",
              opacity: 0.8,
              lineWidth: 10,
            },
            red: { key: "r", color: "#882020", opacity: 0.8, lineWidth: 10 },
            blue: { key: "b", color: "#003088", opacity: 0.8, lineWidth: 10 },
            yellow: {
              key: "y",
              color: "#15781B",
              opacity: 0.8,
              lineWidth: 10,
            },
          },
        },
      }) satisfies Config,
    [gameFen, boardOrientation, canPlay, onMoveEvent, destSquares, customShapes]
  );

  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      wrap="nowrap"
      width={boardSize}
    >
      {showEvaluationBar && (
        <EvaluationBar
          height={boardRef?.current?.offsetHeight || boardSize || 400}
          boardOrientation={boardOrientation}
          currentPositionAtom={currentPositionAtom}
        />
      )}

      <Grid
        container
        rowGap={1.5}
        justifyContent="center"
        alignItems="center"
        paddingLeft={{ xs: 0.5, sm: showEvaluationBar ? 2 : 0 }}
        size="grow"
      >
        <PlayerHeader
          color={boardOrientation === Color.White ? Color.Black : Color.White}
          gameAtom={gameAtom}
          player={boardOrientation === Color.White ? blackPlayer : whitePlayer}
        />

        <Grid
          container
          justifyContent="center"
          alignItems="center"
          height={boardRef?.current?.offsetWidth}
          ref={boardRef}
          width="round(down, 100%, 8px)"
        >
          <Chessground
            config={boardConfig}
            pieceSet={pieceSet}
            hue={boardHue}
          />
        </Grid>

        <PlayerHeader
          color={boardOrientation}
          gameAtom={gameAtom}
          player={boardOrientation === Color.White ? whitePlayer : blackPlayer}
        />
      </Grid>
    </Grid>
  );
}
