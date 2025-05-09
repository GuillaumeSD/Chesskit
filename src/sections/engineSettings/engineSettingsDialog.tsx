import Slider from "@/components/slider";
import { EngineName } from "@/types/enums";
import {
  MenuItem,
  Select,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  FormControl,
  InputLabel,
  OutlinedInput,
  DialogActions,
  Typography,
  Grid2 as Grid,
} from "@mui/material";
import {
  engineNameAtom,
  engineDepthAtom,
  engineMultiPvAtom,
} from "../analysis/states";
import ArrowOptions from "./arrowOptions";
import { useAtomLocalStorage } from "@/hooks/useAtomLocalStorage";
import { useEffect } from "react";
import { isEngineSupported } from "@/lib/engine/shared";
import { Stockfish16_1 } from "@/lib/engine/stockfish16_1";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function EngineSettingsDialog({ open, onClose }: Props) {
  const [depth, setDepth] = useAtomLocalStorage(
    "engine-depth",
    engineDepthAtom
  );
  const [multiPv, setMultiPv] = useAtomLocalStorage(
    "engine-multi-pv",
    engineMultiPvAtom
  );
  const [engineName, setEngineName] = useAtomLocalStorage(
    "engine-name",
    engineNameAtom
  );

  useEffect(() => {
    if (!isEngineSupported(engineName)) {
      if (Stockfish16_1.isSupported()) {
        setEngineName(EngineName.Stockfish16_1Lite);
      } else {
        setEngineName(EngineName.Stockfish11);
      }
    }
  }, [setEngineName, engineName]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle marginY={1} variant="h5">
        Set engine parameters
      </DialogTitle>
      <DialogContent sx={{ paddingBottom: 0 }}>
        <Typography>
          Stockfish 17 Lite is the default engine if your device support its
          requirements. It offers the best balance between speed and strength.
          Stockfish 17 is the strongest engine available, note that it requires
          a one time download of 75MB.
        </Typography>
        <Grid
          marginTop={4}
          container
          justifyContent="center"
          alignItems="center"
          rowGap={3}
          size={12}
        >
          <Grid container justifyContent="center" size={12}>
            <FormControl variant="outlined">
              <InputLabel id="dialog-select-label">Engine</InputLabel>
              <Select
                labelId="dialog-select-label"
                id="dialog-select"
                displayEmpty
                input={<OutlinedInput label="Engine" />}
                value={engineName}
                onChange={(e) => setEngineName(e.target.value as EngineName)}
                sx={{ width: 280, maxWidth: "100%" }}
              >
                {Object.values(EngineName).map((engine) => (
                  <MenuItem
                    key={engine}
                    value={engine}
                    disabled={!isEngineSupported(engine)}
                  >
                    {engineLabel[engine].full}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Slider
            label="Maximum depth"
            value={depth}
            setValue={setDepth}
            min={10}
            max={30}
            marksFilter={2}
          />

          <Slider
            label="Number of lines"
            value={multiPv}
            setValue={setMultiPv}
            min={2}
            max={6}
            marksFilter={1}
            size={6}
          />

          <ArrowOptions />
        </Grid>
      </DialogContent>
      <DialogActions sx={{ m: 2 }}>
        <Button variant="contained" onClick={onClose}>
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export const engineLabel: Record<EngineName, { small: string; full: string }> =
  {
    [EngineName.Stockfish17]: {
      full: "Stockfish 17 (75MB)",
      small: "Stockfish 17",
    },
    [EngineName.Stockfish17Lite]: {
      full: "Stockfish 17 Lite (6MB)",
      small: "Stockfish 17 Lite",
    },
    [EngineName.Stockfish16_1]: {
      full: "Stockfish 16.1 (64MB)",
      small: "Stockfish 16.1",
    },
    [EngineName.Stockfish16_1Lite]: {
      full: "Stockfish 16.1 Lite (6MB)",
      small: "Stockfish 16.1 Lite",
    },
    [EngineName.Stockfish16NNUE]: {
      full: "Stockfish 16 (40MB)",
      small: "Stockfish 16",
    },
    [EngineName.Stockfish16]: {
      full: "Stockfish 16 Lite (HCE)",
      small: "Stockfish 16 Lite",
    },
    [EngineName.Stockfish11]: {
      full: "Stockfish 11 (HCE)",
      small: "Stockfish 11",
    },
  };
