import { Chip, Theme, Tooltip, useTheme } from "@mui/material";
import React from "react";

interface Props {
  result?: string;
  perspectiveUserColor: "white" | "black";
}

export default function GameResultChip({
  result,
  perspectiveUserColor,
}: Props) {
  const theme = useTheme();

  const { label, color, bgColor } = getResultSpecs(
    theme,
    perspectiveUserColor,
    result
  );

  return (
    <Tooltip title={label}>
      <Chip
        label={result}
        size="small"
        sx={{
          color,
          backgroundColor: bgColor,
          fontWeight: "600",
          minWidth: { sm: 40 },
          border: `1px solid ${color}20`,
          "& .MuiChip-icon": {
            color: color,
          },
        }}
      />
    </Tooltip>
  );
}

const getResultSpecs = (
  theme: Theme,
  perspectiveUserColor: "white" | "black",
  result?: string
) => {
  if (
    (result === "1-0" && perspectiveUserColor === "white") ||
    (result === "0-1" && perspectiveUserColor === "black")
  ) {
    return {
      label: result === "1-0" ? "White won" : "Black won",
      color: theme.palette.success.main,
      bgColor: `${theme.palette.success.main}1A`,
    };
  }

  if (
    (result === "1-0" && perspectiveUserColor === "black") ||
    (result === "0-1" && perspectiveUserColor === "white")
  ) {
    return {
      label: result === "1-0" ? "White won" : "Black won",
      color: theme.palette.error.main,
      bgColor: `${theme.palette.error.main}1A`,
    };
  }

  if (result === "1/2-1/2") {
    return {
      label: "Draw",
      color: theme.palette.info.main,
      bgColor: `${theme.palette.info.main}1A`,
    };
  }

  return {
    label: "Game in Progress",
    color: theme.palette.text.secondary,
    bgColor: theme.palette.action.hover,
  };
};
