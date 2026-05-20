import { Box } from "@mui/material";
import {
  useCoordinateGame,
  useGameSettings,
} from "@/hooks/useCoordinateTrainer";
import ChessBoard from "@/components/coordinates-trainer/Board";
import GameInfo from "@/components/coordinates-trainer/GameInfo";
import GameSetup from "@/components/coordinates-trainer/GameSetup";
import SettingsDialog from "@/components/coordinates-trainer/SettingsDialog";

export default function CoordinateTrainer() {
  const { settings, showSettings, setShowSettings, updateSettings } =
    useGameSettings();
  const {
    gameState,
    startGame,
    pauseGame,
    stopGame,
    handleSquareClick,
    formatTime,
  } = useCoordinateGame(settings);

  if (gameState.status === "setup") {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <GameSetup
          settings={settings}
          onSettingsChange={updateSettings}
          onStartGame={startGame}
        />
      </Box>
    );
  }

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
        }}
      >
        <ChessBoard
          gameState={gameState}
          settings={settings}
          onSquareClick={handleSquareClick}
        />
        <GameInfo
          gameState={gameState}
          settings={settings}
          onPauseGame={pauseGame}
          onStopGame={stopGame}
          onStartGame={startGame}
          onShowSettings={() => setShowSettings(true)}
          formatTime={formatTime}
        />
      </Box>

      <SettingsDialog
        open={showSettings}
        settings={settings}
        onClose={() => setShowSettings(false)}
        onSettingsChange={updateSettings}
      />
    </>
  );
}
