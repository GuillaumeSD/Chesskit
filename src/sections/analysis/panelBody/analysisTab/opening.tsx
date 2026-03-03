import { useAtomValue } from "jotai";
import { Grid2 as Grid, Skeleton, Typography } from "@mui/material";
import { boardAtom, currentPositionAtom } from "../../states";

export default function Opening() {
  const position = useAtomValue(currentPositionAtom);

  const board = useAtomValue(boardAtom);
  const lastMove = position?.lastMove;
  if (!lastMove) return null;
  const isStale = position?.fen !== board.fen();

  const opening = (!isStale && position?.eval?.opening) || position.opening;

  if (!opening) {
    return (
      <Grid justifyItems="center" alignContent="center">
        <Skeleton
          variant="rounded"
          animation="wave"
          width={"12em"}
          sx={{ color: "transparent", maxWidth: "7vw", maxHeight: "3.5vw" }}
        >
          <Typography align="center" fontSize="0.9rem">
            placeholder
          </Typography>
        </Skeleton>
      </Grid>
    );
  }

  return (
    <Grid>
      <Typography align="center" fontSize="0.9rem" maxWidth="20rem">
        {opening}
      </Typography>
    </Grid>
  );
}
