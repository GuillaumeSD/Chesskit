import { Stack, useMediaQuery } from "@mui/material";
import { useAtomValue } from "jotai";
import { boardAtom } from "../states";
import { useChessActions } from "@/hooks/useChessActions";
import FlipBoardButton from "./flipBoardButton";
import NextMoveButton from "./nextMoveButton";
import GoToLastPositionButton from "./goToLastPositionButton";
import SaveButton from "./saveButton";
import { useEffect } from "react";
import { ToolbarButton } from "@/components/ToolbarButton";
import { CopyPgnButton } from "./copyPgnButton";

export default function PanelToolBar() {
  const board = useAtomValue(boardAtom);
  const { resetToStartingPosition: resetBoard, undoMove: undoBoardMove } =
    useChessActions(boardAtom);

  const boardHistory = board.history();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (boardHistory.length === 0) return;
      if (e.key === "ArrowLeft") {
        undoBoardMove();
      } else if (e.key === "ArrowDown") {
        resetBoard();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [undoBoardMove, boardHistory, resetBoard, board]);

  const isSmOrGreater = useMediaQuery((theme) => theme.breakpoints.up("sm"));

  return (
    <>
      <Stack
        direction="row"
        justifyContent={{ xs: "space-around", md: "center" }}
        alignItems="center"
        gap={{ xs: undefined, md: 3 }}
        width="100%"
      >
        {isSmOrGreater && <FlipBoardButton />}

        <ToolbarButton
          tooltip="Reset board"
          onClick={() => resetBoard()}
          icon="ri:skip-back-line"
          disabled={boardHistory.length === 0}
        />

        <ToolbarButton
          tooltip="Go to previous move"
          onClick={() => undoBoardMove()}
          icon="ri:arrow-left-s-line"
          disabled={boardHistory.length === 0}
          iconHeight={30}
        />

        <NextMoveButton />

        <GoToLastPositionButton />

        {isSmOrGreater && (
          <>
            <CopyPgnButton />
            <SaveButton />
          </>
        )}
      </Stack>

      {!isSmOrGreater && (
        <Stack
          direction="row"
          justifyContent="space-around"
          alignItems="center"
          width="100%"
        >
          <FlipBoardButton />
          <CopyPgnButton />
          <SaveButton />
        </Stack>
      )}
    </>
  );
}
