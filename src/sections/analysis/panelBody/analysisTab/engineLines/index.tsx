import { Grid2 as Grid, Grid2Props as GridProps, List } from "@mui/material";
import LineEvaluation from "./lineEvaluation";
import {
  boardAtom,
  currentPositionAtom,
  engineMultiPvAtom,
  boardAnimationDurationAtom,
} from "../../../states";
import { useAtomValue, useSetAtom } from "jotai";
import { LineEval } from "@/types/eval";
import { useEffect, useRef } from "react";
import { useChessActions } from "@/hooks/useChessActions";

export default function EngineLines(props: GridProps) {
  const board = useAtomValue(boardAtom);
  const linesNumber = useAtomValue(engineMultiPvAtom);
  const position = useAtomValue(currentPositionAtom);
  const { addMoves } = useChessActions(boardAtom);
  const setAnimationDuration = useSetAtom(boardAnimationDurationAtom);

  const linesSkeleton: LineEval[] = Array.from({ length: linesNumber }).map(
    (_, i) => ({ pv: [`${i}`], depth: 0, multiPv: i + 1 })
  );

  const isStale = position?.fen !== board.fen();

  const engineLines =
    position?.eval?.lines?.length && !isStale
      ? position.eval.lines
      : linesSkeleton;

  const positionRef = useRef(position);
  const boardRef = useRef(board);
  const addMovesRef = useRef(addMoves);

  useEffect(() => {
    positionRef.current = position;
    boardRef.current = board;
    addMovesRef.current = addMoves;
  }, [position, board, addMoves]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow spacebar only if target is not an input or textarea
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if (e.code === "Space" && !isInput) {
        e.preventDefault();
        if (boardRef.current?.isCheckmate()) return;
        const bestLine = positionRef.current?.eval?.lines?.[0];
        if (bestLine && bestLine.pv && bestLine.pv.length > 0) {
          setAnimationDuration(150);
          addMovesRef.current([bestLine.pv[0]]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setAnimationDuration]);

  if (board.isCheckmate()) return null;

  return (
    <Grid container justifyContent="center" alignItems="center" {...props}>
      <List sx={{ width: "95%", padding: 0 }}>
        {engineLines.map((line) => (
          <LineEvaluation key={line.multiPv} line={line} />
        ))}
      </List>
    </Grid>
  );
}
