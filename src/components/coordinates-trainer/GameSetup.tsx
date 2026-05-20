import { Icon } from "@iconify/react";
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  Typography,
} from "@mui/material";
import type { GameSettings } from "@/types/coordinatesTrainer";
import { timeControls } from "@/hooks/useCoordinateTrainer";

interface GameSetupProps {
  settings: GameSettings;
  onSettingsChange: (settings: Partial<GameSettings>) => void;
  onStartGame: () => void;
}

export default function GameSetup({
  settings,
  onSettingsChange,
  onStartGame,
}: GameSetupProps) {
  return (
    <Card sx={{ maxWidth: 500, width: "100%" }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center" color="primary">
          Coordinate Trainer
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          align="center"
          sx={{ mb: 4 }}
        >
          Train your board vision by finding squares quickly
        </Typography>

        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Time Control</InputLabel>
            <Select
              value={settings.timeControl}
              label="Time Control"
              onChange={(e) =>
                onSettingsChange({ timeControl: Number(e.target.value) })
              }
            >
              {timeControls.map((control) => (
                <MenuItem key={control.value} value={control.value}>
                  {control.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Board Orientation</InputLabel>
            <Select
              value={settings.boardColor}
              label="Board Orientation"
              onChange={(e) =>
                onSettingsChange({
                  boardColor: e.target.value as "random" | "white" | "black",
                })
              }
            >
              <MenuItem value="random">Choose Randomly</MenuItem>
              <MenuItem value="white">White Side</MenuItem>
              <MenuItem value="black">Black Side</MenuItem>
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={settings.showCoordinates}
                onChange={(e) =>
                  onSettingsChange({ showCoordinates: e.target.checked })
                }
              />
            }
            label="Show coordinates in squares"
            sx={{ mb: 2 }}
          />
        </Box>

        <Button
          variant="contained"
          size="large"
          fullWidth
          startIcon={<Icon icon="material-symbols:play-arrow" />}
          onClick={onStartGame}
          sx={{ py: 1.5 }}
        >
          Start Training
        </Button>
      </CardContent>
    </Card>
  );
}
