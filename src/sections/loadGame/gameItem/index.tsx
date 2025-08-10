import type React from "react";
import {
  ListItem,
  ListItemText,
  Typography,
  Box,
  useTheme,
} from "@mui/material";
import { LoadedGame } from "@/types/game";
import TimeControlChip from "./timeControlChip";
import MovesNbChip from "./movesNbChip";
import DateChip from "./dateChip";
import GameResultChip from "./gameResultChip";

interface Props {
  game: LoadedGame;
  onClick: () => void;
  perspectiveUserColor: "white" | "black";
}

export const GameItem: React.FC<Props> = ({
  game,
  onClick,
  perspectiveUserColor,
}) => {
  const theme = useTheme();
  const { white, black, result, timeControl, date, movesNb } = game;

  const whiteWon = result === "1-0";
  const blackWon = result === "0-1";

  return (
    <ListItem
      alignItems="flex-start"
      sx={{
        borderRadius: 2,
        mb: 1.5,
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          backgroundColor: theme.palette.action.hover,
          boxShadow: theme.shadows[3],
        },
        border: `1px solid ${theme.palette.divider}`,
        cursor: "pointer",
      }}
      onClick={onClick}
    >
      <ListItemText
        disableTypography
        primary={
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 1, sm: 1.5 },
              mb: 1,
            }}
          >
            <Typography
              variant="subtitle1"
              component="span"
              noWrap
              sx={{
                fontWeight: "700",
                color: whiteWon
                  ? theme.palette.success.main
                  : theme.palette.text.primary,
                opacity: whiteWon ? 1 : blackWon ? 0.7 : 0.8,
              }}
            >
              {formatPlayerName(white)} ({white.rating})
            </Typography>

            <Typography
              variant="body2"
              component="span"
              sx={{
                color: theme.palette.text.secondary,
                fontWeight: "500",
              }}
            >
              vs
            </Typography>

            <Typography
              variant="subtitle1"
              component="span"
              noWrap
              sx={{
                fontWeight: "700",
                color: blackWon
                  ? theme.palette.success.main
                  : theme.palette.text.primary,
                opacity: blackWon ? 1 : whiteWon ? 0.7 : 0.8,
              }}
            >
              {formatPlayerName(black)} ({black.rating})
            </Typography>

            <GameResultChip
              result={result}
              perspectiveUserColor={perspectiveUserColor}
            />
          </Box>
        }
        secondary={
          <Box
            sx={{
              display: "flex",
              gap: 1,
              alignItems: "center",
            }}
          >
            <TimeControlChip timeControl={timeControl} />
            <MovesNbChip movesNb={movesNb} />
            <DateChip date={date} />
          </Box>
        }
      />
    </ListItem>
  );
};

const formatPlayerName = (player: LoadedGame["white"]) => {
  return player.title ? `${player.title} ${player.name}` : player.name;
};
