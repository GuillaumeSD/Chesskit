import { CurrentPosition } from "@/types/eval";
import { MoveClassification } from "@/types/enums";
import { PrimitiveAtom, atom, useAtomValue } from "jotai";
import Image from "next/image";
import { CSSProperties, forwardRef, memo, useMemo } from "react";
import {
  CustomSquareProps,
  Square,
} from "react-chessboard/dist/chessboard/types";
import { CLASSIFICATION_COLORS } from "@/constants";
import { boardHueAtom } from "./states";
import { areObjectsEqual, isObject } from "@/lib/object";
import { useMediaQuery } from "@mui/material";

export interface Props {
  currentPositionAtom: PrimitiveAtom<CurrentPosition>;
  clickedSquaresAtom: PrimitiveAtom<Square[]>;
  playableSquaresAtom: PrimitiveAtom<Square[]>;
  showPlayerMoveIconAtom?: PrimitiveAtom<boolean>;
  boardSize: number;
}

export function getSquareRenderer({
  currentPositionAtom,
  clickedSquaresAtom,
  playableSquaresAtom,
  showPlayerMoveIconAtom = atom(false),
  boardSize,
}: Props) {
  const squareRenderer = memo(
    forwardRef<HTMLDivElement, CustomSquareProps>((props, ref) => {
      const { children, square, style } = props;
      const boardHue = useAtomValue(boardHueAtom);

      const isClicked = useAtomValue(
        useMemo(
          () => atom((get) => get(clickedSquaresAtom).includes(square)),
          [square]
        )
      );

      const isPlayable = useAtomValue(
        useMemo(
          () => atom((get) => get(playableSquaresAtom).includes(square)),
          [square]
        )
      );

      const isFromSquare = useAtomValue(
        useMemo(
          () =>
            atom((get) => get(currentPositionAtom).lastMove?.from === square),
          [square]
        )
      );

      const isToSquare = useAtomValue(
        useMemo(
          () => atom((get) => get(currentPositionAtom).lastMove?.to === square),
          [square]
        )
      );

      const showPlayerMoveIcon = useAtomValue(
        useMemo(
          () =>
            atom((get) => {
              const showIcon = get(showPlayerMoveIconAtom);
              return isToSquare ? showIcon : false;
            }),
          [isToSquare]
        )
      );

      const moveClassification = useAtomValue(
        useMemo(
          () =>
            atom((get) => {
              const evalData = get(currentPositionAtom).eval;

              const isNeeded = isFromSquare || isToSquare;
              if (!isNeeded) return undefined;

              return evalData?.moveClassification;
            }),
          [isFromSquare, isToSquare]
        )
      );

      const highlightSquareStyle: CSSProperties | undefined = useMemo(
        () =>
          isClicked
            ? rightClickSquareStyle
            : isFromSquare || isToSquare
              ? previousMoveSquareStyle(moveClassification)
              : undefined,
        [isClicked, isFromSquare, isToSquare, moveClassification]
      );

      const isLgOrGreater = useMediaQuery((theme) =>
        theme.breakpoints.up("lg")
      );

      const isBorderColumn = square[0] === "a" || square[0] === "h";
      const iconOffset = isBorderColumn && !isLgOrGreater ? 7 : 0;

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
          {isPlayable && <div style={playableSquareStyles} />}
          {moveClassification && showPlayerMoveIcon && isToSquare && (
            <Image
              src={`/icons/${moveClassification}.png`}
              alt="move-icon"
              width={Math.min(40, boardSize * 0.06)}
              height={Math.min(40, boardSize * 0.06)}
              style={{
                position: "absolute",
                top: Math.max(-13.5, boardSize * -0.03) + iconOffset + "px",
                right: Math.max(-13.5, boardSize * -0.03) + iconOffset + "px",
                zIndex: 100,
              }}
            />
          )}
        </div>
      );
    }),
    (prevProps, nextProps) => {
      if (prevProps === nextProps) return true;
      if (prevProps.square !== nextProps.square) return false;
      if (prevProps.squareColor !== nextProps.squareColor) return false;
      if (prevProps.key !== nextProps.key) return false;
      if (prevProps.ref !== nextProps.ref) return false;
      if (!areObjectsEqual(prevProps.style, nextProps.style)) return false;
      if (!areChildrensEqual(prevProps.children, nextProps.children)) {
        return false;
      }
      return true;
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

const areChildrensEqual = (
  prevChildren: React.ReactNode,
  nextChildren: React.ReactNode
): boolean => {
  if (prevChildren === nextChildren) return true;
  if (!Array.isArray(prevChildren) || !Array.isArray(nextChildren)) {
    return false;
  }
  if (prevChildren.length !== nextChildren.length) return false;

  for (let i = 0; i < prevChildren.length; i++) {
    const prevChild: unknown = prevChildren[i];
    const nextChild: unknown = nextChildren[i];

    if (prevChild === nextChild) continue;

    if (!isElementWithProps(prevChild) || !isElementWithProps(nextChild)) {
      return false;
    }

    for (const key of ["row", "col", "piece", "square"]) {
      if (prevChild.props[key] !== nextChild.props[key]) {
        return false;
      }
    }
  }

  return true;
};

const isElementWithProps = (
  node: unknown
): node is React.ReactElement<Record<string, unknown>> => {
  return isObject(node) && "props" in node && isObject(node.props);
};
