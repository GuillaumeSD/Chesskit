import { getCapturedPieces, getMaterialDifference } from "@/lib/chess";
import { Color } from "@/types/enums";
import { Box, Grid2 as Grid, Stack, Typography } from "@mui/material";
import { ReactElement, useMemo, memo } from "react";

export interface Props {
  fen: string;
  color: Color;
}

const PIECE_SCALE = 0.55;

const CapturedPieces = memo(function CapturedPieces({ fen, color }: Props) {
  const piecesComponents = useMemo(() => {
    const capturedPieces = getCapturedPieces(fen, color);
    return capturedPieces.map(({ piece, count }) =>
      getCapturedPiecesComponents(piece, count)
    );
  }, [fen, color]);

  const materialDiff = useMemo(() => {
    const materialDiff = getMaterialDifference(fen);
    return color === Color.White ? materialDiff : -materialDiff;
  }, [fen, color]);

  return (
    <Grid
      container
      alignItems="end"
      spacing={0.7}
      size="auto"
      marginLeft={`-${0.3 * PIECE_SCALE}rem`}
    >
      <Stack direction="row" spacing={0.1}>
        {piecesComponents}
      </Stack>

      {materialDiff > 0 && (
        <Typography
          lineHeight={`${PIECE_SCALE * 1.5}rem`}
          fontSize={`${PIECE_SCALE * 1.5}rem`}
          marginLeft={0.3}
        >
          +{materialDiff}
        </Typography>
      )}
    </Grid>
  );
});

const getCapturedPiecesComponents = (
  pieceSymbol: string,
  pieceCount: number | undefined
): ReactElement | null => {
  if (!pieceCount) return null;

  return (
    <Stack
      direction="row"
      key={pieceSymbol}
      spacing={`-${1.2 * PIECE_SCALE}rem`}
    >
      {new Array(pieceCount).fill(0).map((_, index) => (
        <Box
          key={`${pieceSymbol}-${index}`}
          width={`${2 * PIECE_SCALE}rem`}
          height={`${2 * PIECE_SCALE}rem`}
          sx={{
            backgroundImage: `url(/piece/cardinal/${pieceSymbol}.svg)`,
            backgroundRepeat: "no-repeat",
          }}
        />
      ))}
    </Stack>
  );
};

export default CapturedPieces;
