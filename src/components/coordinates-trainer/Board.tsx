import { Box, Typography, useTheme } from "@mui/material";
import type { GameSettings, GameState } from "@/types/coordinatesTrainer";
import {
  getSquareColor,
  getDisplayFiles,
  getDisplayRanks,
} from "@/hooks/useCoordinateTrainer";

interface ChessBoardProps {
  gameState: GameState;
  settings: GameSettings;
  onSquareClick: (square: string) => void;
}

export default function ChessBoard({
  gameState,
  settings,
  onSquareClick,
}: ChessBoardProps) {
  const theme = useTheme();

  const displayFiles = getDisplayFiles(gameState.currentBoardOrientation);
  const displayRanks = getDisplayRanks(gameState.currentBoardOrientation);

  return (
    <Box
      sx={{
        flex: { md: 1 },
        display: "flex",
        alignItems: "start",
        justifyContent: "center",
        p: { xs: 1, sm: 2 },
        position: "relative",
        mb: { xs: 3, md: 0 },
      }}
    >
      <Box
        sx={{
          position: "relative",
          maxWidth: {
            xs: "90vw",
            sm: "min(80vh, 80vw)",
            md: "min(80vh, 60vw)",
          },
          width: "100%",
          aspectRatio: "1",
        }}
      >
        {/* Rank Numbers (Left Side) */}
        <Box
          sx={{
            position: "absolute",
            left: { xs: -15, sm: -25 },
            top: 0,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-around",
            alignItems: "center",
            fontSize: { xs: "0.8rem", sm: "1rem" },
            fontWeight: "bold",
            color: "text.secondary",
          }}
        >
          {displayRanks.map((rank) => (
            <Typography
              key={rank}
              sx={{ fontSize: "inherit", fontWeight: "inherit" }}
            >
              {rank}
            </Typography>
          ))}
        </Box>

        {/* File Letters (Bottom) */}
        <Box
          sx={{
            position: "absolute",
            bottom: { xs: -20, sm: -25 },
            left: 0,
            width: "100%",
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            fontSize: { xs: "0.8rem", sm: "1rem" },
            fontWeight: "bold",
            color: "text.secondary",
          }}
        >
          {displayFiles.map((file) => (
            <Typography
              key={file}
              sx={{ fontSize: "inherit", fontWeight: "inherit" }}
            >
              {file}
            </Typography>
          ))}
        </Box>

        {/* Chess Board */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(8, 1fr)",
            gridTemplateRows: "repeat(8, 1fr)",
            border: `3px solid ${theme.palette.divider}`,
            borderRadius: 1,
            overflow: "hidden",
            width: "100%",
            height: "100%",
            boxShadow: theme.shadows[3],
            userSelect: "none",
            WebkitUserSelect: "none",
            MozUserSelect: "none",
            msUserSelect: "none",
          }}
          onContextMenu={(e) => e.preventDefault()}
        >
          {displayRanks.map((rank) =>
            displayFiles.map((file) => {
              const square = `${file}${rank}`;

              return (
                <Box
                  key={square}
                  onClick={() => onSquareClick(square)}
                  sx={{
                    bgcolor: getSquareColor(file, rank),
                    display: "flex",
                    alignItems: settings.showCoordinates
                      ? "flex-end"
                      : "center",
                    justifyContent: settings.showCoordinates
                      ? "flex-start"
                      : "center",
                    cursor:
                      gameState.status === "playing" ? "pointer" : "default",
                    position: "relative",
                    transition: "all 0.2s ease",
                    "&:hover":
                      gameState.status === "playing"
                        ? {
                            opacity: 0.8,
                            transform: "scale(0.95)",
                          }
                        : {},
                    fontSize: { xs: "0.6rem", sm: "0.8rem", md: "1rem" },
                    fontWeight: "bold",
                    color: settings.showCoordinates
                      ? "rgba(0,0,0,0.4)"
                      : "transparent",
                    p: settings.showCoordinates ? { xs: 0.3, sm: 0.5 } : 0,
                  }}
                >
                  {settings.showCoordinates && square}
                </Box>
              );
            })
          )}
        </Box>

        {/* Floating Target Square */}
        {gameState.status === "playing" && (
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: gameState.wrongAnswer
                ? "rgba(220, 53, 69, 0.9)"
                : "rgba(0, 0, 0, 0.8)",
              color: "white",
              borderRadius: 2,
              px: { xs: 2, sm: 3 },
              py: { xs: 1, sm: 1.5 },
              boxShadow: theme.shadows[8],
              zIndex: 10,
              pointerEvents: "none",
              transition: "background-color 0.3s ease",
            }}
          >
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: "2.5rem", sm: "3.5rem", md: "4rem" },
                fontWeight: "bold",
                textAlign: "center",
                lineHeight: 1,
              }}
            >
              {gameState.targetSquare}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
