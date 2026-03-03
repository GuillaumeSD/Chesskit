import {
  Box,
  BoxProps,
  Typography,
  TypographyProps,
  useTheme,
} from "@mui/material";
import { useMemo } from "react";

interface Props {
  san: string;
  color: "w" | "b";
  additionalText?: string;
  typographyProps?: TypographyProps;
  boxProps?: BoxProps;
}

export default function PrettyMoveSan({
  san,
  color,
  additionalText,
  typographyProps,
  boxProps,
}: Props) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  const { icon, text } = useMemo(() => {
    const firstChar = san.charAt(0);

    const isPiece = ["K", "Q", "R", "B", "N"].includes(firstChar);
    if (!isPiece) return { text: san };

    const pieceColor = isDarkMode ? color : color === "w" ? "b" : "w";
    const icon = unicodeMap[firstChar][pieceColor];

    return { icon, text: san.slice(1) };
  }, [san, color, isDarkMode]);

  return (
    <Box component="span" {...boxProps}>
      {icon && (
        <Typography
          component="span"
          fontFamily="ChessMerida"
          {...typographyProps}
        >
          {icon}
        </Typography>
      )}

      <Typography component="span" noWrap {...typographyProps}>
        {text}
        {additionalText}
      </Typography>
    </Box>
  );
}

const unicodeMap: Record<string, Record<"w" | "b", string>> = {
  K: { w: "♚", b: "♔" },
  Q: { w: "♛", b: "♕" },
  R: { w: "♜", b: "♖" },
  B: { w: "♝", b: "♗" },
  N: { w: "♞", b: "♘" },
};
