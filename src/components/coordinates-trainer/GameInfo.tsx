import { Icon } from "@iconify/react";
import {
  Box,
  Button,
  Chip,
  IconButton,
  LinearProgress,
  Typography,
  useTheme,
} from "@mui/material";
import type { GameSettings, GameState } from "@/types/coordinatesTrainer";

interface GameInfoProps {
  gameState: GameState;
  settings: GameSettings;
  onPauseGame: () => void;
  onStopGame: () => void;
  onStartGame: () => void;
  onShowSettings: () => void;
  formatTime: (seconds: number) => string;
}

export default function GameInfo({
  gameState,
  settings,
  onPauseGame,
  onStopGame,
  onStartGame,
  onShowSettings,
  formatTime,
}: GameInfoProps) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        width: { xs: "100%", md: 350 },
        height: { xs: "auto" },
        bgcolor: "background.paper",
        borderLeft: { md: `1px solid ${theme.palette.divider}` },
        borderTop: { xs: `1px solid ${theme.palette.divider}`, md: "none" },
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: { xs: 2, sm: 3 },
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Typography variant="h6" color="text.primary">
            Coordinate Trainer
          </Typography>
          <Box>
            <IconButton onClick={onShowSettings} size="small">
              <Icon icon="material-symbols:settings" />
            </IconButton>
            <IconButton onClick={onStopGame} size="small">
              <Icon icon="material-symbols:home" />
            </IconButton>
          </Box>
        </Box>

        {/* Timer and Score */}
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <Chip
            label={`Score: ${gameState.score}`}
            color="primary"
            variant="outlined"
            sx={{ flex: 1 }}
          />
          {settings.timeControl > 0 && (
            <Chip
              label={formatTime(gameState.timeLeft)}
              color={gameState.timeLeft < 10 ? "error" : "default"}
              variant="outlined"
              sx={{ flex: 1 }}
            />
          )}
        </Box>

        {/* Progress Bar */}
        {settings.timeControl > 0 && (
          <LinearProgress
            variant="determinate"
            value={(gameState.timeLeft / settings.timeControl) * 100}
            sx={{
              mb: 2,
              bgcolor:
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.1)",
            }}
          />
        )}

        {/* Game Controls */}
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant={gameState.status === "paused" ? "contained" : "outlined"}
            startIcon={
              gameState.status === "paused" ? (
                <Icon icon="material-symbols:play-arrow" />
              ) : (
                <Icon icon="material-symbols:pause" />
              )
            }
            onClick={onPauseGame}
            disabled={gameState.status === "finished"}
            size="small"
          >
            {gameState.status === "paused" ? "Resume" : "Pause"}
          </Button>
          <Button
            variant="outlined"
            startIcon={<Icon icon="material-symbols:stop" />}
            onClick={onStopGame}
            size="small"
          >
            Stop
          </Button>
        </Box>
      </Box>

      {/* Game Status Display */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 2, sm: 4 },
          minHeight: { xs: "200px", md: "auto" },
        }}
      >
        {gameState.status === "playing" && !gameState.feedback && (
          <>
            <Typography variant="h5" color="text.secondary" gutterBottom>
              Find Square
            </Typography>
            <Typography variant="h6" color="text.secondary" align="center">
              Click on the highlighted square on the board
            </Typography>
          </>
        )}

        {gameState.status === "paused" && (
          <Typography variant="h4" color="text.secondary">
            Game Paused
          </Typography>
        )}

        {gameState.status === "finished" && (
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h4" color="primary.main" gutterBottom>
              Time's Up!
            </Typography>
            <Typography variant="h2" sx={{ mb: 2, color: "text.primary" }}>
              {gameState.score}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              squares found
            </Typography>
            <Button variant="contained" onClick={onStartGame}>
              Play Again
            </Button>
          </Box>
        )}

        {/* Feedback Display */}
        {gameState.feedback && (
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: "2rem", sm: "3rem" },
                fontWeight: "bold",
                color:
                  gameState.feedback.type === "success"
                    ? "success.main"
                    : "error.main",
                mb: 2,
              }}
            >
              {gameState.feedback.message}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {gameState.feedback.type === "error"
                ? `Keep trying to find ${gameState.targetSquare}!`
                : "Next target coming up..."}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
