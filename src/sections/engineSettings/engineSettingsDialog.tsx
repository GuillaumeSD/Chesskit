import Slider from "@/components/slider";
import { EngineName, SoundTheme } from "@/types/enums";
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
  Box,
  useTheme,
} from "@mui/material";
import {
  engineNameAtom,
  engineDepthAtom,
  engineMultiPvAtom,
  engineWorkersNbAtom,
} from "../analysis/states";
import ArrowOptions from "./arrowOptions";
import { useAtomLocalStorage } from "@/hooks/useAtomLocalStorage";
import { useEffect } from "react";
import { isEngineSupported } from "@/lib/engine/shared";
import { Stockfish16_1 } from "@/lib/engine/stockfish16_1";
import { useAtom } from "jotai";
import { boardHueAtom, pieceSetAtom } from "@/components/board/states";
import Image from "next/image";
import {
  DEFAULT_ENGINE,
  ENGINE_LABELS,
  PIECE_SETS,
  STRONGEST_ENGINE,
} from "@/constants";
import { getRecommendedWorkersNb } from "@/lib/engine/worker";
import { soundThemeAtom } from "../play/states";

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
  const [boardHue, setBoardHue] = useAtom(boardHueAtom);
  const [pieceSet, setPieceSet] = useAtom(pieceSetAtom);
  const [engineWorkersNb, setEngineWorkersNb] = useAtom(engineWorkersNbAtom);

  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  const [soundTheme, setSoundTheme] = useAtomLocalStorage(
    "sound-theme",
    soundThemeAtom
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
      <DialogTitle variant="h5" sx={{ paddingBottom: 1 }}>
        Settings
      </DialogTitle>
      <DialogContent sx={{ paddingBottom: 0 }}>
        <Grid
          container
          justifyContent="center"
          alignItems="center"
          paddingTop={1}
          spacing={3}
          size={12}
        >
          <Grid
            container
            justifyContent="center"
            size={{ xs: 12, sm: 7, md: 8 }}
          >
            <Typography variant="body2">
              {ENGINE_LABELS[DEFAULT_ENGINE].small} is the default engine if
              your device support its requirements. It offers the best balance
              between speed and strength.{" "}
              {ENGINE_LABELS[STRONGEST_ENGINE].small} is the strongest engine
              available, note that it requires a one time download of{" "}
              {ENGINE_LABELS[STRONGEST_ENGINE].sizeMb}MB and is much more
              compute intensive.
            </Typography>
          </Grid>

          <Grid
            container
            justifyContent="center"
            size={{ xs: 12, sm: 5, md: 4 }}
          >
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
                    {ENGINE_LABELS[engine].full}
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

          <Grid
            container
            justifyContent="center"
            size={{ xs: 12, sm: 8, md: 9 }}
          >
            <Slider
              label="Board hue"
              value={boardHue}
              setValue={setBoardHue}
              min={0}
              max={360}
            />
          </Grid>

          <Grid
            container
            justifyContent="center"
            alignItems="center"
            size={{ xs: 12, sm: 4, md: 3 }}
          >
            <FormControl variant="outlined">
              <InputLabel id="dialog-select-label">Piece set</InputLabel>
              <Select
                labelId="dialog-select-label"
                id="dialog-select"
                displayEmpty
                input={<OutlinedInput label="Piece set" />}
                value={pieceSet}
                onChange={(e) =>
                  setPieceSet(e.target.value as (typeof PIECE_SETS)[number])
                }
                sx={{ width: 200, maxWidth: "100%" }}
              >
                {PIECE_SETS.map((name) => (
                  <MenuItem key={name} value={name}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Image
                        loading="lazy"
                        src={`/piece/${name}/${isDarkMode ? "w" : "b"}N.svg`}
                        alt={`${name} knight`}
                        width={24}
                        height={24}
                      />
                      {name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl variant="outlined">
              <InputLabel id="sound-theme-select-label">Sound Theme</InputLabel>
              <Select
                labelId="sound-theme-select-label"
                id="sound-theme-select"
                displayEmpty
                input={<OutlinedInput label="Sound Theme" />}
                value={soundTheme}
                onChange={(e) => setSoundTheme(e.target.value as SoundTheme)}
                sx={{ width: 280, maxWidth: "100%" }}
              >
                {Object.values(SoundTheme).map((theme) => (
                  <MenuItem key={theme} value={theme}>
                    {theme.charAt(0).toUpperCase() + theme.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid
            container
            justifyContent="center"
            alignItems="center"
            size={{ xs: 12, md: 11 }}
          >
            <Slider
              label="Number of threads"
              value={engineWorkersNb}
              setValue={setEngineWorkersNb}
              min={1}
              max={12}
              marksFilter={1}
              infoContent={
                <>
                  More threads means faster analysis, but only if your device
                  can handle them, otherwise it may have the opposite effect.
                  The estimated optimal value for your device is{" "}
                  {getRecommendedWorkersNb()}. Due to privacy restrictions in
                  some browsers, this value might be underestimated. Don't
                  hesitate to try different values to find the best one for your
                  device.
                </>
              }
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ m: 1 }}>
        <Button variant="contained" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
