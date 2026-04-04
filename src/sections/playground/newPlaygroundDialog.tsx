import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useChessActions } from "@/hooks/useChessActions";
import { getGameFromPgn } from "@/lib/chess";
import { playgroundGameAtom } from "./states";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function NewPlaygroundDialog({ open, onClose }: Props) {
  const { reset } = useChessActions(playgroundGameAtom);
  const [startingPositionInput, setStartingPositionInput] = useState("");
  const [parsingError, setParsingError] = useState("");

  const handleClose = () => {
    onClose();
    setStartingPositionInput("");
    setParsingError("");
  };

  const handleStart = () => {
    setParsingError("");

    try {
      const input = startingPositionInput.trim();
      const startingFen = input.startsWith("[")
        ? getGameFromPgn(input).fen()
        : input || undefined;

      reset({
        fen: startingFen,
        white: { name: "White" },
        black: { name: "Black" },
      });
      handleClose();
    } catch (error) {
      console.error(error);
      setParsingError(
        error instanceof Error
          ? `${error.message} !`
          : "Unknown error while parsing input !"
      );
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle marginY={1} variant="h5">
        Start a new playground
      </DialogTitle>
      <DialogContent sx={{ paddingBottom: 0 }}>
        <TextField
          fullWidth
          label="Optional starting position (FEN or PGN)"
          multiline
          value={startingPositionInput}
          onChange={(e) => setStartingPositionInput(e.target.value)}
        />

        {parsingError && (
          <Typography color="salmon" textAlign="center" marginTop={2}>
            {parsingError}
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ m: 2 }}>
        <Button
          variant="outlined"
          sx={{ marginRight: 2 }}
          onClick={handleClose}
        >
          Cancel
        </Button>
        <Button variant="contained" onClick={handleStart}>
          Start playground
        </Button>
      </DialogActions>
    </Dialog>
  );
}
