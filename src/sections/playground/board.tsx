import Board from "@/components/board";
import { usePlayersData } from "@/hooks/usePlayersData";
import { useScreenSize } from "@/hooks/useScreenSize";
import { showPlayerMoveIconAtom } from "@/sections/analysis/states";
import { useAtomValue } from "jotai";
import { useMemo } from "react";
import {
  playgroundBoardOrientationAtom,
  playgroundCurrentPositionAtom,
  playgroundGameAtom,
} from "./states";

export default function PlaygroundBoard() {
  const screenSize = useScreenSize();
  const boardOrientation = useAtomValue(playgroundBoardOrientationAtom);
  const { white, black } = usePlayersData(playgroundGameAtom);

  const boardSize = useMemo(() => {
    const width = screenSize.width;
    const height = screenSize.height;

    if (window?.innerWidth < 1200) {
      return Math.min(width, height - 150);
    }

    return Math.min(width - 700, height * 0.92);
  }, [screenSize]);

  return (
    <Board
      id="PlaygroundBoard"
      boardSize={boardSize}
      canPlay={true}
      gameAtom={playgroundGameAtom}
      whitePlayer={white}
      blackPlayer={black}
      boardOrientation={boardOrientation}
      currentPositionAtom={playgroundCurrentPositionAtom}
      showPlayerMoveIconAtom={showPlayerMoveIconAtom}
      showEvaluationBar={true}
    />
  );
}
