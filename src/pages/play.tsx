import { PageTitle } from "@/components/pageTitle";
import Board from "@/sections/play/board";
import GameInProgress from "@/sections/play/gameInProgress";
import GameRecap from "@/sections/play/gameRecap";
import GameSettingsButton from "@/sections/play/gameSettings/gameSettingsButton";
import { isGameInProgressAtom } from "@/sections/play/states";
import { Grid2 as Grid } from "@mui/material";
import { useAtomValue } from "jotai";

export default function Play() {
  const isGameInProgress = useAtomValue(isGameInProgressAtom);

  return (
    <Grid container gap={4} justifyContent="space-evenly" alignItems="start">
      <PageTitle title="Freechess Play vs Stockfish" />

      <Board />

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
          maxWidth: "400px",
        }}
      >
        <GameInProgress />
        {!isGameInProgress && <GameSettingsButton />}
        <GameRecap />
      </Grid>
    </Grid>
  );
}
