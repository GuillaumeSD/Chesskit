import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  Box,
} from "@mui/material";
import { timeControls } from "@/hooks/useCoordinateTrainer";
import { GameSettings } from "@/types/coordinatesTrainer";

interface SettingsDialogProps {
  open: boolean;
  settings: GameSettings;
  onClose: () => void;
  onSettingsChange: (settings: Partial<GameSettings>) => void;
}

export default function SettingsDialog({
  open,
  settings,
  onClose,
  onSettingsChange,
}: SettingsDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Game Settings</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
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
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
