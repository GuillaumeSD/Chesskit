import { Grid2 as Grid } from "@mui/material";
import { Chessboard } from "react-chessboard";
import { PrimitiveAtom, atom, useAtomValue, useSetAtom, Atom } from "jotai";
import {
  Arrow,
  CustomPieces,
  Piece,
  PromotionPieceOption,
  Square,
} from "react-chessboard/dist/chessboard/types";
import { useChessActions } from "@/hooks/useChessActions";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  memo,
  createContext,
  useContext,
} from "react";
import { Color, MoveClassification } from "@/types/enums";
import { Chess } from "chess.js";
import { CurrentPosition } from "@/types/eval";
import EvaluationBar from "./evaluationBar";
import { CLASSIFICATION_COLORS } from "@/constants";
import { Player } from "@/types/game";
import PlayerHeader from "./playerHeader";
import { boardHueAtom, pieceSetAtom } from "./states";
import type { ClickedSquare } from "./types";
import tinycolor from "tinycolor2";

const clickedSquaresAtom = atom<ClickedSquare[]>([]);
const playableSquaresAtom = atom<Square[]>([]);
const captureSquaresAtom = atom<Square[]>([]);
const moveClickFromAtom = atom<Square | null>(null);
const moveClickToAtom = atom<Square | null>(null);

const defaultCurrentPositionAtom = atom<CurrentPosition>({} as CurrentPosition);
const defaultShowPlayerMoveIconAtom = atom(false);

export const BoardStateContext = createContext<{
  pieceSet: string;
  checkSquare: Square | null;
  turn: "w" | "b";
  boardHue: number;
  boardSize: number;
  currentPositionAtom: Atom<CurrentPosition>;
  clickedSquaresAtom: Atom<ClickedSquare[]>;
  playableSquaresAtom: Atom<Square[]>;
  captureSquaresAtom: Atom<Square[]>;
  showPlayerMoveIconAtom: Atom<boolean>;
  moveClickFromAtom: Atom<Square | null>;
}>({
  pieceSet: "maestro",
  checkSquare: null,
  turn: "w",
  boardHue: 0,
  boardSize: 400,
  currentPositionAtom: defaultCurrentPositionAtom,
  clickedSquaresAtom,
  playableSquaresAtom,
  captureSquaresAtom,
  showPlayerMoveIconAtom: atom<boolean>(false),
  moveClickFromAtom,
});

import { getSquareRenderer } from "./squareRenderer";

export interface Props {
  id: string;
  canPlay?: Color | boolean;
  gameAtom: PrimitiveAtom<Chess>;
  boardSize?: number;
  whitePlayer: Player;
  blackPlayer: Player;
  boardOrientation?: Color;
  currentPositionAtom?: PrimitiveAtom<CurrentPosition>;
  showBestMoveArrow?: boolean;
  showPlayerMoveIconAtom?: PrimitiveAtom<boolean>;
  showEvaluationBar?: boolean;
  animationDurationAtom?: PrimitiveAtom<number>;
}

const CustomPiece = memo(
  ({
    squareWidth,
    isDragging,
    piece,
  }: {
    squareWidth: number;
    isDragging: boolean;
    piece: string;
  }) => {
    const { pieceSet, checkSquare, turn, boardHue } =
      useContext(BoardStateContext);

    const isCheck =
      (piece === "wK" && turn === "w" && checkSquare) ||
      (piece === "bK" && turn === "b" && checkSquare);

    const hueFilter = boardHue ? `hue-rotate(-${boardHue}deg)` : "";

    const checkShadow = isCheck
      ? "drop-shadow(0 0 8px rgba(235, 97, 80, 1)) drop-shadow(0 0 16px rgba(235, 97, 80, 0.8))"
      : "";
    const dragShadow = isDragging
      ? "drop-shadow(0 6px 8px rgba(0, 0, 0, 0.25))"
      : "drop-shadow(0 0px 0px rgba(0, 0, 0, 0))";

    return (
      <div
        style={{
          width: squareWidth,
          height: squareWidth,
          backgroundImage: `url(/piece/${pieceSet}/${piece}.svg)`,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          imageRendering: "auto",
          willChange: isDragging || isCheck ? "transform, filter" : "auto",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          zIndex: isDragging ? 100 : 50,
          transform: isDragging
            ? "scale(1.05) translateZ(30px)"
            : "scale(1) translateZ(2px)",
          filter: `${dragShadow} ${checkShadow} ${hueFilter}`.trim(),
          transition: "filter 0.1s ease-out", // Removed transform transition
          pointerEvents: "none",
        }}
      />
    );
  }
);

CustomPiece.displayName = "CustomPiece";

export const PIECE_CODES = [
  "wP",
  "wB",
  "wN",
  "wR",
  "wQ",
  "wK",
  "bP",
  "bB",
  "bN",
  "bR",
  "bQ",
  "bK",
] as const satisfies Piece[];

function Board({
  id: boardId,
  canPlay,
  gameAtom,
  boardSize,
  whitePlayer,
  blackPlayer,
  boardOrientation = Color.White,
  currentPositionAtom = defaultCurrentPositionAtom,
  showBestMoveArrow = false,
  showPlayerMoveIconAtom,
  showEvaluationBar = false,
  animationDurationAtom,
}: Props) {
  const boardRef = useRef<HTMLDivElement>(null);
  const game = useAtomValue(gameAtom);
  const { playMove, undoMove } = useChessActions(gameAtom);
  const pieceSet = useAtomValue(pieceSetAtom);
  const boardHue = useAtomValue(boardHueAtom);

  const checkSquareAtom = useMemo(
    () =>
      atom((get) => {
        const game = get(gameAtom);
        if (!game.inCheck() && !game.isCheckmate()) return null;
        const turn = game.turn();
        return (
          game
            .board()
            .flat()
            .find((p) => p?.type === "k" && p?.color === turn)?.square ?? null
        );
      }),
    [gameAtom]
  );

  // Jotai Setters
  const setClickedSquares = useSetAtom(clickedSquaresAtom);
  const setPlayableSquares = useSetAtom(playableSquaresAtom);
  const setCaptureSquares = useSetAtom(captureSquaresAtom);

  // Jotai Getters (derived state)
  const [moveClickFrom, setMoveClickFrom] = [
    useAtomValue(moveClickFromAtom),
    useSetAtom(moveClickFromAtom),
  ];
  const [moveClickTo, setMoveClickTo] = [
    useAtomValue(moveClickToAtom),
    useSetAtom(moveClickToAtom),
  ];

  const checkSquare = useAtomValue(checkSquareAtom);

  const customPieces = useMemo(() => {
    return PIECE_CODES.reduce<CustomPieces>((acc, pieceCode) => {
      acc[pieceCode] = (props) => <CustomPiece {...props} piece={pieceCode} />;
      return acc;
    }, {});
  }, []);

  // Derive only the specific primitive values Board needs from currentPositionAtom.
  const arrowBestMove = useAtomValue(
    useMemo(
      () => atom((get) => get(currentPositionAtom)?.lastEval?.bestMove),
      [currentPositionAtom]
    )
  );
  const arrowMoveClassification = useAtomValue(
    useMemo(
      () => atom((get) => get(currentPositionAtom)?.eval?.moveClassification),
      [currentPositionAtom]
    )
  );

  // Local State
  const [userArrows, setUserArrows] = useState<Arrow[]>([]);
  const [newArrow, setNewArrow] = useState<Arrow | null>(null);
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  const [localAnimationDuration, setLocalAnimationDuration] = useState(150);

  // Animation Duration Logic
  const externalAnimationDuration = useAtomValue(
    useMemo(() => animationDurationAtom || atom(150), [animationDurationAtom])
  );
  const setExternalAnimationDuration = useSetAtom(
    useMemo(() => animationDurationAtom || atom(150), [animationDurationAtom])
  );

  const animationDurationToUse = animationDurationAtom
    ? externalAnimationDuration
    : localAnimationDuration;
  const setAnimationDurationToUse = useCallback(
    (duration: number) => {
      if (animationDurationAtom) {
        setExternalAnimationDuration(duration);
      } else {
        setLocalAnimationDuration(duration);
      }
    },
    [animationDurationAtom, setExternalAnimationDuration]
  );

  // Refs for event handling and drag state
  const isAltPressedRef = useRef(false);
  const isCtrlPressedRef = useRef(false);
  const isDraggingRef = useRef(false);
  const shouldCancelDragRef = useRef(false);
  const lastRightClickRef = useRef<number>(0);
  const dragCancelledRef = useRef<number>(0);
  const rightClickDownRef = useRef<boolean>(false);
  const lastRightClickUpTimeRef = useRef<number>(0);
  const lastDropMoveTimeRef = useRef<number>(0);
  const dragOriginSquareRef = useRef<Square | null>(null);
  const dragPieceRef = useRef<string | null>(null);
  const rightClickDragStartRef = useRef<Square | null>(null);

  // Custom pointer drag refs
  const customDragGhostRef = useRef<HTMLDivElement | null>(null);
  const dragStartPosRef = useRef<{
    x: number;
    y: number;
    constraints?: {
      minDx: number;
      maxDx: number;
      minDy: number;
      maxDy: number;
    };
  } | null>(null);
  const draggedPieceElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Alt") isAltPressedRef.current = true;
      if (e.key === "Control" || e.key === "Meta")
        isCtrlPressedRef.current = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Alt") isAltPressedRef.current = false;
      if (e.key === "Control" || e.key === "Meta")
        isCtrlPressedRef.current = false;
    };
    const handleBlur = () => {
      isAltPressedRef.current = false;
      isCtrlPressedRef.current = false;
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  const gameFen = useMemo(() => game.fen(), [game]);

  useEffect(() => {
    setClickedSquares([]);
    setUserArrows([]);
  }, [gameFen, setClickedSquares]);

  const isPiecePlayable = useCallback(
    ({ piece }: { piece: string }): boolean => {
      if (
        rightClickDownRef.current ||
        Date.now() - lastRightClickUpTimeRef.current < 250 ||
        Date.now() - lastRightClickRef.current < 250 ||
        Date.now() - dragCancelledRef.current < 250
      ) {
        return false;
      }

      if (game.isGameOver() || !canPlay) return false;
      if (canPlay === true || canPlay === piece[0]) return true;
      return false;
    },
    [canPlay, game]
  );

  const resetMoveClick = useCallback(
    (square?: Square | null) => {
      setMoveClickFrom(square ?? null);
      setMoveClickTo(null);
      setShowPromotionDialog(false);
      if (square) {
        const moves = game.moves({ square, verbose: true });
        setPlayableSquares(moves.map((m) => m.to));
        setCaptureSquares(moves.filter((m) => m.captured).map((m) => m.to));
      } else {
        setPlayableSquares([]);
        setCaptureSquares([]);
      }
    },
    [
      setMoveClickFrom,
      setMoveClickTo,
      setPlayableSquares,
      setCaptureSquares,
      game,
    ]
  );

  const getSquareFromCoords = useCallback(
    (clientX: number, clientY: number): Square | null => {
      if (!boardRef.current) return null;
      const rect = boardRef.current.getBoundingClientRect();
      if (
        clientX < rect.left ||
        clientX > rect.right ||
        clientY < rect.top ||
        clientY > rect.bottom
      ) {
        return null;
      }

      const squareSize = rect.width / 8;
      const col = Math.floor((clientX - rect.left) / squareSize);
      const row = Math.floor((clientY - rect.top) / squareSize);

      if (col < 0 || col > 7 || row < 0 || row > 7) return null;

      const file =
        boardOrientation === Color.White
          ? String.fromCharCode(97 + col)
          : String.fromCharCode(97 + (7 - col));
      const rank =
        boardOrientation === Color.White ? String(8 - row) : String(row + 1);

      return `${file}${rank}` as Square;
    },
    [boardOrientation]
  );

  const animateReturnFlight = useCallback(
    (
      sourceSquare: Square,
      piece: string,
      existingGhost?: HTMLDivElement | null,
      draggedPiece?: HTMLElement | null
    ) => {
      const boardElement = boardRef.current;
      const targetSquareElement = boardElement?.querySelector(
        `[data-square="${sourceSquare}"]`
      ) as HTMLElement;

      if (!targetSquareElement || !boardElement) {
        if (existingGhost) existingGhost.remove();
        if (draggedPiece) draggedPiece.style.opacity = "1";
        return;
      }

      const targetRect = targetSquareElement.getBoundingClientRect();

      if (existingGhost) {
        // Animate the actual custom drag ghost back to its origin square
        // We override its transform to fly to the origin instead of translating
        const flightTimeMs = 150;
        existingGhost.style.transition = `top ${flightTimeMs}ms ease-out, left ${flightTimeMs}ms ease-out, transform ${flightTimeMs}ms ease-out`;
        existingGhost.style.transform = "scale(1.0) translate(0px, 0px)";
        existingGhost.style.top = `${targetRect.top}px`;
        existingGhost.style.left = `${targetRect.left}px`;

        setTimeout(() => {
          if (existingGhost.parentNode) {
            existingGhost.remove();
          }
          if (draggedPiece) draggedPiece.style.opacity = "1";
        }, flightTimeMs);
      } else {
        // This is the fallback fading ghost for invalid drops
        const ghost = document.createElement("div");
        ghost.style.position = "fixed";
        ghost.style.top = `${targetRect.top}px`;
        ghost.style.left = `${targetRect.left}px`;
        ghost.style.width = `${targetRect.width}px`;
        ghost.style.height = `${targetRect.height}px`;
        ghost.style.backgroundImage = `url(/piece/${pieceSet}/${piece}.svg)`;
        ghost.style.backgroundSize = "contain";
        ghost.style.backgroundRepeat = "no-repeat";
        ghost.style.backgroundPosition = "center";
        ghost.style.pointerEvents = "none";
        ghost.style.zIndex = "100";
        ghost.classList.add("piece-return-ghost");

        document.body.appendChild(ghost);

        setTimeout(() => {
          if (ghost.parentNode) ghost.remove();
          if (draggedPiece) draggedPiece.style.opacity = "1";
        }, 150);
      }
    },
    [pieceSet]
  );

  const abortCustomDrag = useCallback(() => {
    if (!isDraggingRef.current) return;
    dragCancelledRef.current = Date.now();
    shouldCancelDragRef.current = true;
    isDraggingRef.current = false;
    setClickedSquares((prev) => [...prev]);
    resetMoveClick();

    // Let the ghost fly back
    if (
      dragOriginSquareRef.current &&
      dragPieceRef.current &&
      customDragGhostRef.current
    ) {
      animateReturnFlight(
        dragOriginSquareRef.current,
        dragPieceRef.current,
        customDragGhostRef.current,
        draggedPieceElementRef.current
      );
    } else {
      // Cleanup immediately if no ghost was created yet
      if (customDragGhostRef.current) {
        customDragGhostRef.current.remove();
      }
      if (draggedPieceElementRef.current) {
        draggedPieceElementRef.current.style.opacity = "1";
      }
    }

    customDragGhostRef.current = null;
    draggedPieceElementRef.current = null;
    dragOriginSquareRef.current = null;
    dragPieceRef.current = null;
  }, [resetMoveClick, setClickedSquares, animateReturnFlight]);

  const handleGlobalPointerMove = useCallback((e: PointerEvent) => {
    e.preventDefault();
    if (!customDragGhostRef.current || !dragStartPosRef.current) return;

    const rawDx = e.clientX - dragStartPosRef.current.x;
    const rawDy = e.clientY - dragStartPosRef.current.y;

    // Threshold to prevent ghost initialization on pure clicks
    if (Math.abs(rawDx) > 3 || Math.abs(rawDy) > 3) {
      if (!customDragGhostRef.current.parentNode) {
        document.body.appendChild(customDragGhostRef.current);
        if (draggedPieceElementRef.current) {
          draggedPieceElementRef.current.style.opacity = "0";
        }
      }

      let dx = rawDx;
      let dy = rawDy;

      const constraints = dragStartPosRef.current.constraints;
      if (constraints) {
        dx = Math.max(constraints.minDx, Math.min(dx, constraints.maxDx));
        dy = Math.max(constraints.minDy, Math.min(dy, constraints.maxDy));
      }

      const translateX = Math.round(dx / 1.05);
      const translateY = Math.round(dy / 1.05);
      customDragGhostRef.current.style.transform = `scale(1.05) translate(${translateX}px, ${translateY}px)`;
    }
  }, []);

  const handleGlobalPointerMoveRightClick = useCallback(
    (e: PointerEvent) => {
      e.preventDefault();
      if (!rightClickDragStartRef.current) return;
      const hoverSquare = getSquareFromCoords(e.clientX, e.clientY);
      if (hoverSquare) {
        const color = isAltPressedRef.current
          ? "#70bbd9"
          : isCtrlPressedRef.current
            ? "#eb6150"
            : "#ffaa00";
        setNewArrow([rightClickDragStartRef.current, hoverSquare, color]);
      }
    },
    [getSquareFromCoords]
  );

  const handleGlobalPointerUpRightClick = useCallback(
    (e: PointerEvent) => {
      document.removeEventListener(
        "pointermove",
        handleGlobalPointerMoveRightClick
      );
      document.removeEventListener(
        "pointerup",
        handleGlobalPointerUpRightClick
      );

      const startSquare = rightClickDragStartRef.current;
      rightClickDragStartRef.current = null;
      setNewArrow(null);

      if (!startSquare) return;
      const hoverSquare = getSquareFromCoords(e.clientX, e.clientY);

      if (hoverSquare && hoverSquare !== startSquare) {
        const finalColor = isAltPressedRef.current
          ? "#70bbd9"
          : isCtrlPressedRef.current
            ? "#eb6150"
            : "#ffaa00";
        const finalArrow = [startSquare, hoverSquare, finalColor] as Arrow;
        setUserArrows((prev) => {
          const existing = prev.find(
            (a) => a[0] === finalArrow[0] && a[1] === finalArrow[1]
          );
          if (existing) {
            if (existing[2] === finalArrow[2]) {
              return prev.filter((a) => a !== existing);
            } else {
              return [...prev.filter((a) => a !== existing), finalArrow];
            }
          }
          return [...prev, finalArrow];
        });
      }
    },
    [
      getSquareFromCoords,
      handleGlobalPointerMoveRightClick,
      isAltPressedRef,
      isCtrlPressedRef,
    ]
  );

  const onPieceDrop = useCallback(
    (source: Square, target: Square, piece: string): boolean => {
      if (
        shouldCancelDragRef.current ||
        rightClickDownRef.current ||
        Date.now() - lastRightClickUpTimeRef.current < 250 ||
        Date.now() - lastRightClickRef.current < 250 ||
        Date.now() - dragCancelledRef.current < 250
      ) {
        return false;
      }

      if (!isPiecePlayable({ piece })) return false;

      setAnimationDurationToUse(0);

      const result = playMove({
        from: source,
        to: target,
        promotion: piece[1]?.toLowerCase() ?? "q",
      });

      if (result) {
        lastDropMoveTimeRef.current = Date.now();
      }

      return !!result;
    },
    [isPiecePlayable, playMove, setAnimationDurationToUse]
  );

  const handleGlobalPointerUp = useCallback(
    (e: PointerEvent) => {
      document.removeEventListener("pointermove", handleGlobalPointerMove);
      document.removeEventListener("pointerup", handleGlobalPointerUp);

      if (!isDraggingRef.current || shouldCancelDragRef.current) {
        return;
      }

      const targetSquare = getSquareFromCoords(e.clientX, e.clientY);
      const sourceSquare = dragOriginSquareRef.current;
      const piece = dragPieceRef.current;

      const wasDraggingVisibly = !!customDragGhostRef.current?.parentNode;
      let moveSucceeded = false;
      let isPendingPromotion = false;

      if (
        wasDraggingVisibly &&
        targetSquare &&
        sourceSquare &&
        piece &&
        targetSquare !== sourceSquare
      ) {
        const validMoves = game.moves({ square: sourceSquare, verbose: true });
        let move = validMoves.find((m) => m.to === targetSquare);
        let actualTargetSquare = targetSquare;

        if (!move) {
          const epMove = validMoves.find(
            (m) => m.isEnPassant() && m.to[0] + m.from[1] === targetSquare
          );
          if (epMove) {
            move = epMove;
            actualTargetSquare = epMove.to as Square;
          }
        }

        if (
          move &&
          move.piece === "p" &&
          ((move.color === "w" && actualTargetSquare[1] === "8") ||
            (move.color === "b" && actualTargetSquare[1] === "1"))
        ) {
          isPendingPromotion = true;
          setAnimationDurationToUse(0);
          setMoveClickFrom(sourceSquare);
          setMoveClickTo(actualTargetSquare);
          setShowPromotionDialog(true);
        } else {
          moveSucceeded = onPieceDrop(sourceSquare, actualTargetSquare, piece);
        }
      }

      if (
        !moveSucceeded &&
        !isPendingPromotion &&
        wasDraggingVisibly &&
        sourceSquare &&
        piece
      ) {
        animateReturnFlight(
          sourceSquare,
          piece,
          customDragGhostRef.current,
          draggedPieceElementRef.current
        );
      } else if (moveSucceeded && wasDraggingVisibly && targetSquare) {
        if (customDragGhostRef.current) {
          customDragGhostRef.current.remove();
        }
      } else {
        if (customDragGhostRef.current) {
          customDragGhostRef.current.remove();
        }
        if (draggedPieceElementRef.current) {
          draggedPieceElementRef.current.style.opacity = "1";
        }
      }

      customDragGhostRef.current = null;
      draggedPieceElementRef.current = null;
      isDraggingRef.current = false;
      if (wasDraggingVisibly) {
        setPlayableSquares([]);
        setCaptureSquares([]);
      }
      dragOriginSquareRef.current = null;
      dragPieceRef.current = null;
      shouldCancelDragRef.current = false;
    },
    [
      getSquareFromCoords,
      onPieceDrop,
      animateReturnFlight,
      setPlayableSquares,
      setCaptureSquares,
      handleGlobalPointerMove,
      game,
      setMoveClickFrom,
      setMoveClickTo,
      setAnimationDurationToUse,
    ]
  );

  const handleBoardPointerDownCapture = useCallback(
    (e: React.PointerEvent) => {
      if (e.button === 2) {
        rightClickDownRef.current = true;
        lastRightClickRef.current = Date.now();
        if (isDraggingRef.current) {
          e.stopPropagation();
          abortCustomDrag();
        } else {
          const target = e.target as HTMLElement;
          const squareElement = target.closest("[data-square]") as HTMLElement;
          const square = squareElement?.dataset.square as Square;
          if (square) {
            rightClickDragStartRef.current = square;
            const color = isAltPressedRef.current
              ? "#70bbd9"
              : isCtrlPressedRef.current
                ? "#eb6150"
                : "#ffaa00";
            setNewArrow([square, square, color]);
            document.addEventListener(
              "pointermove",
              handleGlobalPointerMoveRightClick
            );
            document.addEventListener(
              "pointerup",
              handleGlobalPointerUpRightClick
            );
          }
        }
        return;
      }

      if (e.button === 0) {
        // Prevent browser default selection/drag on the entire board
        e.preventDefault();

        setClickedSquares([]);
        setUserArrows([]);

        const target = e.target as HTMLElement;
        const pieceElement = target.closest("[data-piece]") as HTMLElement;
        if (!pieceElement) return;

        const piece = pieceElement.dataset.piece;
        const squareElement = pieceElement.closest(
          "[data-square]"
        ) as HTMLElement;
        const square = squareElement?.dataset.square as Square;

        if (moveClickFrom) {
          const validMoves = game.moves({
            square: moveClickFrom,
            verbose: true,
          });

          let move = validMoves.find((m) => m.to === square);
          let actualTargetSquare = square;

          if (!move) {
            const epMove = validMoves.find(
              (m) => m.isEnPassant() && m.to[0] + m.from[1] === square
            );
            if (epMove) {
              move = epMove;
              actualTargetSquare = epMove.to as Square;
            }
          }

          if (move) {
            e.preventDefault();
            e.stopPropagation();

            if (
              move.piece === "p" &&
              ((move.color === "w" && actualTargetSquare[1] === "8") ||
                (move.color === "b" && actualTargetSquare[1] === "1"))
            ) {
              setAnimationDurationToUse(150);
              setMoveClickTo(actualTargetSquare);
              setShowPromotionDialog(true);
              return;
            }

            setAnimationDurationToUse(150);
            playMove({
              from: moveClickFrom,
              to: actualTargetSquare,
            });

            resetMoveClick(undefined);
            return;
          }
        }

        if (!piece || !square || !isPiecePlayable({ piece })) return;

        shouldCancelDragRef.current = false;
        isDraggingRef.current = true;
        dragOriginSquareRef.current = square;
        dragPieceRef.current = piece;

        setMoveClickFrom(null);
        setMoveClickTo(null);
        setShowPromotionDialog(false);
        const moves = game.moves({ square, verbose: true });
        setPlayableSquares(moves.map((m) => m.to));
        setCaptureSquares(moves.filter((m) => m.captured).map((m) => m.to));

        const rect = pieceElement.getBoundingClientRect();
        const ghost = document.createElement("div");
        ghost.style.position = "fixed";
        ghost.style.top = `${rect.top}px`;
        ghost.style.left = `${rect.left}px`;
        ghost.style.width = `${rect.width}px`;
        ghost.style.height = `${rect.height}px`;
        ghost.style.backgroundImage = `url(/piece/${pieceSet}/${piece}.svg)`;
        ghost.style.backgroundSize = "contain";
        ghost.style.backgroundRepeat = "no-repeat";
        ghost.style.backgroundPosition = "center";
        ghost.style.pointerEvents = "none";
        ghost.style.zIndex = "9999";
        ghost.style.transform = "scale(1.05)";
        ghost.style.filter = "drop-shadow(0 4px 10px rgba(0,0,0,0.5))";
        ghost.style.transition = "transform 0.05s linear";

        customDragGhostRef.current = ghost;
        draggedPieceElementRef.current = pieceElement;

        let constraints;
        if (boardRef.current) {
          const squares = Array.from(
            boardRef.current.querySelectorAll("[data-square]")
          ) as HTMLElement[];

          if (squares.length > 0) {
            let left = Infinity,
              right = -Infinity,
              top = Infinity,
              bottom = -Infinity;
            for (const s of squares) {
              const r = s.getBoundingClientRect();
              if (r.left < left) left = r.left;
              if (r.right > right) right = r.right;
              if (r.top < top) top = r.top;
              if (r.bottom > bottom) bottom = r.bottom;
            }
            left = Math.ceil(left);
            right = Math.floor(right);
            top = Math.ceil(top);
            bottom = Math.floor(bottom);
            constraints = {
              minDx: left - rect.left,
              maxDx: right - rect.right,
              minDy: top - rect.top,
              maxDy: bottom - rect.bottom,
            };
          }
        }

        dragStartPosRef.current = { x: e.clientX, y: e.clientY, constraints };
        document.addEventListener("pointermove", handleGlobalPointerMove);
        document.addEventListener("pointerup", handleGlobalPointerUp);
      }
    },
    [
      resetMoveClick,
      setClickedSquares,
      isPiecePlayable,
      game,
      pieceSet,
      setPlayableSquares,
      setCaptureSquares,
      abortCustomDrag,
      moveClickFrom,
      setMoveClickFrom,
      handleGlobalPointerMove,
      handleGlobalPointerUp,
      playMove,
      setMoveClickTo,
      handleGlobalPointerMoveRightClick,
      handleGlobalPointerUpRightClick,
      setAnimationDurationToUse,
    ]
  );

  const handleSquareLeftClick = useCallback(
    (square: Square, piece?: string) => {
      if (isDraggingRef.current || shouldCancelDragRef.current) return;

      if (
        rightClickDownRef.current ||
        Date.now() - lastRightClickUpTimeRef.current < 250 ||
        Date.now() - lastRightClickRef.current < 250 ||
        Date.now() - dragCancelledRef.current < 250
      ) {
        return;
      }
      setClickedSquares([]);
      setUserArrows([]);

      if (moveClickFrom === square) {
        resetMoveClick();
        return;
      }

      if (!moveClickFrom) {
        if (!piece) return;
        if (!isPiecePlayable({ piece })) return;
        resetMoveClick(square);
        return;
      }

      const validMoves = game.moves({ square: moveClickFrom, verbose: true });
      let move = validMoves.find((m) => m.to === square);
      let actualTargetSquare = square;

      if (!move) {
        const epMove = validMoves.find(
          (m) => m.isEnPassant() && m.to[0] + m.from[1] === square
        );
        if (epMove) {
          move = epMove;
          actualTargetSquare = epMove.to as Square;
        }
      }

      if (!move) {
        resetMoveClick(piece ? square : undefined);
        return;
      }

      setMoveClickTo(actualTargetSquare);

      if (
        move.piece === "p" &&
        ((move.color === "w" && actualTargetSquare[1] === "8") ||
          (move.color === "b" && actualTargetSquare[1] === "1"))
      ) {
        setAnimationDurationToUse(150);
        setShowPromotionDialog(true);
        return;
      }

      setAnimationDurationToUse(150);
      const result = playMove({
        from: moveClickFrom,
        to: actualTargetSquare,
      });

      resetMoveClick(result ? undefined : piece ? square : undefined);
    },
    [
      game,
      isPiecePlayable,
      moveClickFrom,
      playMove,
      resetMoveClick,
      setClickedSquares,
      setMoveClickTo,
      setAnimationDurationToUse,
    ]
  );

  const handleSquareRightClick = useCallback(
    (square: Square) => {
      if (
        isDraggingRef.current ||
        shouldCancelDragRef.current ||
        Date.now() - dragCancelledRef.current < 250
      ) {
        shouldCancelDragRef.current = true;
        isDraggingRef.current = false;
        resetMoveClick();
        return;
      }

      const color = isAltPressedRef.current
        ? "#70bbd9"
        : isCtrlPressedRef.current
          ? "#ffaa00"
          : "#eb6150";
      setClickedSquares((prev) => {
        const actual = prev.filter((s) => s !== undefined) as ClickedSquare[];
        const exists = actual.find((s) => s.square === square);
        if (exists) {
          if (exists.color === color) {
            return actual.filter((s) => s.square !== square);
          } else {
            return [
              ...actual.filter((s) => s.square !== square),
              { square, color },
            ];
          }
        } else {
          return [...actual, { square, color }];
        }
      });
    },
    [resetMoveClick, setClickedSquares]
  );

  const handleBoardPointerUpCapture = useCallback(
    (e: React.PointerEvent) => {
      if (e.button === 2) {
        rightClickDownRef.current = false;
        lastRightClickUpTimeRef.current = Date.now();
        setClickedSquares((prev) => [...prev]);
      }
    },
    [setClickedSquares]
  );

  const handlePieceDragBegin = useCallback(
    (piece: string, square: Square) => {
      shouldCancelDragRef.current = false;
      isDraggingRef.current = true;
      dragOriginSquareRef.current = square;
      dragPieceRef.current = piece;
      setMoveClickFrom(null);
      setMoveClickTo(null);
      setShowPromotionDialog(false);
      const moves = game.moves({ square, verbose: true });
      setPlayableSquares(moves.map((m) => m.to));
      setCaptureSquares(moves.filter((m) => m.captured).map((m) => m.to));
    },
    [
      game,
      setMoveClickFrom,
      setMoveClickTo,
      setPlayableSquares,
      setCaptureSquares,
    ]
  );

  const handlePieceDragEnd = useCallback(() => {
    const wasCancelled = shouldCancelDragRef.current;
    isDraggingRef.current = false;
    setPlayableSquares([]);
    setCaptureSquares([]);

    if (wasCancelled && dragOriginSquareRef.current && dragPieceRef.current) {
      animateReturnFlight(dragOriginSquareRef.current, dragPieceRef.current);
    }

    dragOriginSquareRef.current = null;
    dragPieceRef.current = null;

    if (wasCancelled) {
      dragCancelledRef.current = Date.now();
      setTimeout(() => {
        shouldCancelDragRef.current = false;
      }, 50);
    } else {
      shouldCancelDragRef.current = false;
    }
  }, [setPlayableSquares, setCaptureSquares, animateReturnFlight]);

  useLayoutEffect(() => {
    if (!isDraggingRef.current && draggedPieceElementRef.current) {
      draggedPieceElementRef.current.style.opacity = "1";
      draggedPieceElementRef.current = null;
    }
  }, [gameFen]);

  useEffect(() => {
    const handleContextMenuUndo = (e: MouseEvent) => {
      if (Date.now() - lastDropMoveTimeRef.current < 150) {
        lastDropMoveTimeRef.current = 0;
        setAnimationDurationToUse(0);
        undoMove();
      } else if (isDraggingRef.current) {
        e.preventDefault();
        abortCustomDrag();
      }
    };
    document.addEventListener("contextmenu", handleContextMenuUndo, true);
    return () =>
      document.removeEventListener("contextmenu", handleContextMenuUndo, true);
  }, [undoMove, abortCustomDrag, setAnimationDurationToUse]);

  const onPromotionPieceSelect = useCallback(
    (piece?: PromotionPieceOption, from?: Square, to?: Square) => {
      if (!piece) {
        resetMoveClick();
        return false;
      }
      const promotionPiece = piece[1]?.toLowerCase() ?? "q";

      const currentFrom = moveClickFrom || from;
      const currentTo = moveClickTo || to;

      if (!currentFrom || !currentTo) {
        resetMoveClick();
        return false;
      }

      // We don't need the check anymore since we're returning false to stop react-chessboard
      playMove({
        from: currentFrom,
        to: currentTo,
        promotion: promotionPiece,
      });

      resetMoveClick();
      // ALWAYS return false to prevent react-chessboard from subsequently triggering onPieceDrop
      return false;
    },
    [moveClickFrom, moveClickTo, playMove, resetMoveClick]
  );

  const customArrows: Arrow[] = useMemo(() => {
    let arrows = [...userArrows];

    if (newArrow && newArrow[0] && newArrow[1] && newArrow[0] !== newArrow[1]) {
      arrows = arrows.filter(
        (a) => !(a[0] === newArrow[0] && a[1] === newArrow[1])
      );
      arrows.push(newArrow);
    }

    if (
      arrowBestMove &&
      showBestMoveArrow &&
      arrowMoveClassification !== MoveClassification.Best &&
      arrowMoveClassification !== MoveClassification.Opening &&
      arrowMoveClassification !== MoveClassification.Forced &&
      arrowMoveClassification !== MoveClassification.Perfect
    ) {
      const bestMoveArrow = [
        arrowBestMove.slice(0, 2),
        arrowBestMove.slice(2, 4),
        tinycolor(CLASSIFICATION_COLORS[MoveClassification.Best])
          .spin(-boardHue)
          .toHexString(),
      ] as Arrow;

      if (bestMoveArrow[0] && bestMoveArrow[1]) {
        arrows.push(bestMoveArrow);
      }
    }

    const uniqueArrows = new Map<string, Arrow>();
    arrows.forEach((a) => {
      if (a && a[0] && a[1]) {
        uniqueArrows.set(`${a[0]}-${a[1]}`, a);
      }
    });

    return Array.from(uniqueArrows.values());
  }, [
    arrowBestMove,
    arrowMoveClassification,
    showBestMoveArrow,
    boardHue,
    userArrows,
    newArrow,
  ]);

  const SquareRendererComponent = useMemo(() => getSquareRenderer(), []);

  const customBoardStyle = useMemo(() => {
    const commonBoardStyle = {
      borderRadius: "5px",
      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
      transform: "translateZ(0)",
      backfaceVisibility: "hidden" as const,
      WebkitBackfaceVisibility: "hidden" as const,
      overflow: "visible",
      backgroundColor: "#b58863",
    };

    if (boardHue) {
      return {
        ...commonBoardStyle,
        filter: `hue-rotate(${boardHue}deg)`,
        willChange: "filter",
      };
    }

    return commonBoardStyle;
  }, [boardHue]);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      lastDropMoveTimeRef.current = 0;
      if (isDraggingRef.current) {
        abortCustomDrag();
      }
    },
    [abortCustomDrag]
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
          ref={boardRef}
          size={12}
          onContextMenu={handleContextMenu}
          onPointerDownCapture={handleBoardPointerDownCapture}
          onPointerUpCapture={handleBoardPointerUpCapture}
        >
          <BoardStateContext.Provider
            value={{
              pieceSet,
              checkSquare,
              turn: game.turn(),
              boardHue,
              boardSize: boardSize || 400,
              currentPositionAtom,
              clickedSquaresAtom,
              playableSquaresAtom,
              captureSquaresAtom,
              showPlayerMoveIconAtom:
                showPlayerMoveIconAtom || defaultShowPlayerMoveIconAtom,
              moveClickFromAtom,
            }}
          >
            <Chessboard
              id={`${boardId}-${canPlay}`}
              position={gameFen}
              onPieceDrop={onPieceDrop}
              boardOrientation={
                boardOrientation === Color.White ? "white" : "black"
              }
              customBoardStyle={customBoardStyle}
              customArrows={customArrows}
              areArrowsAllowed={false}
              arePiecesDraggable={false}
              isDraggablePiece={isPiecePlayable}
              customSquare={SquareRendererComponent}
              onSquareClick={handleSquareLeftClick}
              onPieceClick={(piece, square) =>
                handleSquareLeftClick(square, piece)
              }
              onSquareRightClick={handleSquareRightClick}
              onPieceDragBegin={handlePieceDragBegin}
              onPieceDragEnd={handlePieceDragEnd}
              onPromotionPieceSelect={onPromotionPieceSelect}
              showPromotionDialog={showPromotionDialog}
              promotionToSquare={moveClickTo}
              animationDuration={animationDurationToUse}
              customPieces={customPieces}
            />
          </BoardStateContext.Provider>
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

export default memo(Board);
