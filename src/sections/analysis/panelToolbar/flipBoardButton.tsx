import { useSetAtom } from "jotai";
import { boardOrientationAtom } from "../states";
import { IconButton, Tooltip } from "@mui/material";
import { Icon } from "@iconify/react";
import { useEffect } from "react";

export default function FlipBoardButton() {
  const setBoardOrientation = useSetAtom(boardOrientationAtom);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "f") {
        setBoardOrientation((prev) => !prev);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [setBoardOrientation]);

  return (
    <Tooltip title="Flip board">
      <IconButton
        onClick={() => setBoardOrientation((prev) => !prev)}
        sx={{ paddingX: 2, paddingY: 1 }}
      >
        <Icon icon="eva:flip-fill" />
      </IconButton>
    </Tooltip>
  );
}
