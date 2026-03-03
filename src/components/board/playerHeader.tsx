import { Color } from "@/types/enums";
import { Player } from "@/types/game";
import { Avatar, Grid2 as Grid, Stack, Typography } from "@mui/material";
import CapturedPieces from "./capturedPieces";
import { PrimitiveAtom, useAtomValue } from "jotai";
import { Chess } from "chess.js";
import { useMemo, memo } from "react";
import { getPaddedNumber } from "@/lib/helpers";

export interface Props {
  player: Player;
  color: Color;
  gameAtom: PrimitiveAtom<Chess>;
}

const PlayerHeader = memo(function PlayerHeader({
  color,
  player,
  gameAtom,
}: Props) {
  const game = useAtomValue(gameAtom);

  const gameFen = game.fen();

  const clock = useMemo(() => {
    const turn = game.turn();

    if (turn === color) {
      const history = game.history({ verbose: true });
      const previousFen = history.at(-1)?.before;

      const comment = game
        .getComments()
        .find(({ fen }) => fen === previousFen)?.comment;

      return getClock(comment);
    }

    const comment = game.getComment();
    return getClock(comment);
  }, [game, color]);

  return (
    <Grid
      container
      justifyContent="space-between"
      alignItems="center"
      size={12}
    >
      <Stack direction="row">
        <Avatar
          src={player.avatarUrl}
          alt={player.name}
          variant="circular"
          sx={{
            width: 40,
            height: 40,
            backgroundColor: color === Color.White ? "white" : "black",
            color: color === Color.White ? "black" : "white",
            border: "1px solid black",
          }}
        >
          {player.name[0].toUpperCase()}
        </Avatar>

        <Stack marginLeft={1}>
          <Stack direction="row">
            <Typography fontSize="0.9rem">{player.name}</Typography>

            {player.rating && (
              <Typography marginLeft={0.5} fontSize="0.9rem" fontWeight="200">
                ({player.rating})
              </Typography>
            )}
          </Stack>

          <CapturedPieces fen={gameFen} color={color} />
        </Stack>
      </Stack>

      {clock && (
        <Typography
          align="center"
          sx={{
            backgroundColor: color === Color.White ? "white" : "black",
            color: color === Color.White ? "black" : "white",
          }}
          borderRadius="5px"
          padding={0.8}
          border="1px solid #424242"
          width="5rem"
          textAlign="right"
        >
          {clock.hours ? `${clock.hours}:` : ""}
          {getPaddedNumber(clock.minutes)}:{getPaddedNumber(clock.seconds)}
          {clock.hours || clock.minutes || clock.seconds > 20
            ? ""
            : `.${clock.tenths}`}
        </Typography>
      )}
    </Grid>
  );
});

const getClock = (comment: string | undefined) => {
  if (!comment) return undefined;

  const match = comment.match(/\[%clk (\d+):(\d+):(\d+)(?:\.(\d*))?\]/);
  if (!match) return undefined;

  return {
    hours: parseInt(match[1]),
    minutes: parseInt(match[2]),
    seconds: parseInt(match[3]),
    tenths: match[4] ? parseInt(match[4]) : 0,
  };
};

export default PlayerHeader;
