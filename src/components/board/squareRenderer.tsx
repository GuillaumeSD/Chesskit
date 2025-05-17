import { CurrentPosition } from "@/types/eval";
import { MoveClassification } from "@/types/enums";
import { PrimitiveAtom, atom, useAtomValue } from "jotai";
import Image from "next/image";
import { CSSProperties, forwardRef, useMemo } from "react";
import {
  CustomSquareProps,
  Square,
} from "react-chessboard/dist/chessboard/types";
import { CLASSIFICATION_COLORS } from "@/constants";
import { boardHueAtom } from "./states";

export interface Props {
  currentPositionAtom: PrimitiveAtom<CurrentPosition>;
  clickedSquaresAtom: PrimitiveAtom<Square[]>;
  playableSquaresAtom: PrimitiveAtom<Square[]>;
  showPlayerMoveIconAtom?: PrimitiveAtom<boolean>;
  trainingFeedback?: {
    square: string;
    icon: string;
    alt: string;
  };
}

export function getSquareRenderer({
  currentPositionAtom,
  clickedSquaresAtom,
  playableSquaresAtom,
  showPlayerMoveIconAtom = atom(false),
  trainingFeedback,
}: Props) {
  const squareRenderer = forwardRef<HTMLDivElement, CustomSquareProps>(
    (props, ref) => {
      const { children, square, style } = props;
      const showPlayerMoveIcon = useAtomValue(showPlayerMoveIconAtom);
      const position = useAtomValue(currentPositionAtom);
      const clickedSquares = useAtomValue(clickedSquaresAtom);
      const playableSquares = useAtomValue(playableSquaresAtom);
      const boardHue = useAtomValue(boardHueAtom);

      const fromSquare = position.lastMove?.from;
      const toSquare = position.lastMove?.to;
      const moveClassification = position?.eval?.moveClassification;

      const highlightSquareStyle: CSSProperties | undefined = useMemo(
        () =>
          clickedSquares.includes(square)
            ? rightClickSquareStyle
            : fromSquare === square || toSquare === square
              ? previousMoveSquareStyle(moveClassification)
              : undefined,
        [clickedSquares, square, fromSquare, toSquare, moveClassification]
      );

      const playableSquareStyle: CSSProperties | undefined = useMemo(
        () =>
          playableSquares.includes(square) ? playableSquareStyles : undefined,
        [playableSquares, square]
      );

      return (
        <div
          ref={ref}
          style={{
            ...style,
            position: "relative",
            filter: boardHue ? `hue-rotate(-${boardHue}deg)` : undefined,
          }}
        >
          {children}
          {highlightSquareStyle && <div style={highlightSquareStyle} />}
          {playableSquareStyle && <div style={playableSquareStyle} />}
          {/* Affichage de l’icône de feedback training si demandé et sur la bonne case */}
          {trainingFeedback && trainingFeedback.square === square && (
            <img
              src={trainingFeedback.icon}
              alt={trainingFeedback.alt}
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                transform: "translate(35%,-35%)",
                width: 28,
                height: 28,
                zIndex: 120,
                pointerEvents: "none",
                opacity: 0.95,
              }}
            />
          )}
          {/* Aucun affichage de message texte d'erreur ici, seulement l'icône */}
          {moveClassification && showPlayerMoveIcon && square === toSquare && (
            <Image
              src={`/icons/${moveClassification}.png`}
              alt="move-icon"
              width={35}
              height={35}
              style={{
                position: "absolute",
                top: "max(-12px, -1.8vw)",
                right: "max(-12px, -1.8vw)",
                maxWidth: "3.6vw",
                maxHeight: "3.6vw",
                zIndex: 100,
              }}
            />
          )}
        </div>
      );
    }
  );

  squareRenderer.displayName = "SquareRenderer";

  return squareRenderer;
}

const rightClickSquareStyle: CSSProperties = {
  position: "absolute",
  width: "100%",
  height: "100%",
  backgroundColor: "#eb6150",
  opacity: "0.8",
};

const playableSquareStyles: CSSProperties = {
  position: "absolute",
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0,0,0,.14)",
  padding: "35%",
  backgroundClip: "content-box",
  borderRadius: "50%",
  boxSizing: "border-box",
};

const previousMoveSquareStyle = (
  moveClassification?: MoveClassification
): CSSProperties => ({
  position: "absolute",
  width: "100%",
  height: "100%",
  backgroundColor: moveClassification
    ? CLASSIFICATION_COLORS[moveClassification]
    : "#fad541",
  opacity: 0.5,
});
