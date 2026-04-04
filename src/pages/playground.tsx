import { PageTitle } from "@/components/pageTitle";
import { useAtomLocalStorage } from "@/hooks/useAtomLocalStorage";
import { useEngine } from "@/hooks/useEngine";
import { Stockfish16_1 } from "@/lib/engine/stockfish16_1";
import { isEngineSupported } from "@/lib/engine/shared";
import PlaygroundBoard from "@/sections/playground/board";
import PlaygroundEngineLines from "@/sections/playground/engineLines";
import { usePlaygroundCurrentPosition } from "@/sections/playground/hooks/useCurrentPosition";
import PlaygroundToolbar from "@/sections/playground/toolbar";
import { engineNameAtom } from "@/sections/analysis/states";
import { DEFAULT_ENGINE, ENGINE_LABELS } from "@/constants";
import { EngineName } from "@/types/enums";
import { Grid2 as Grid, Typography } from "@mui/material";
import { useEffect } from "react";

export default function Playground() {
  const [engineName, setEngineName] = useAtomLocalStorage(
    "engine-name",
    engineNameAtom
  );
  const engine = useEngine(engineName);

  useEffect(() => {
    if (!isEngineSupported(engineName)) {
      if (Stockfish16_1.isSupported()) {
        setEngineName(EngineName.Stockfish16_1Lite);
      } else {
        setEngineName(EngineName.Stockfish11);
      }
    }
  }, [engineName, setEngineName]);

  usePlaygroundCurrentPosition(engine);

  return (
    <Grid container gap={4} justifyContent="space-evenly" alignItems="start">
      <PageTitle title="Chesskit Playground" />

      <PlaygroundBoard />

      <Grid
        container
        marginTop={{ xs: 0, md: "2.5em" }}
        justifyContent="center"
        alignItems="center"
        borderRadius={2}
        border={1}
        borderColor={"secondary.main"}
        size={{
          xs: 12,
          md: "grow",
        }}
        sx={{
          backgroundColor: "secondary.main",
          borderColor: "primary.main",
          borderWidth: 2,
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
        }}
        padding={3}
        rowGap={3}
        style={{
          maxWidth: "430px",
        }}
      >
        <Grid container size={12} justifyContent="center" rowGap={1}>
          <Typography variant="h5" align="center">
            Playground
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary">
            Free play with live analysis from{" "}
            {ENGINE_LABELS[engineName ?? DEFAULT_ENGINE].small}
          </Typography>
        </Grid>

        <Grid container size={12} justifyContent="center">
          <PlaygroundToolbar />
        </Grid>

        <Grid container size={12}>
          <PlaygroundEngineLines />
        </Grid>
      </Grid>
    </Grid>
  );
}
