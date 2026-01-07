import { TextField, InputAdornment, IconButton, Tooltip } from "@mui/material";
import { Icon } from "@iconify/react";
import React from "react";

interface Props {
  fen: string;
  setFen: (fen: string) => void;
}

export default function GameFenInput({ fen, setFen }: Props) {
  const handleClipboardPaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setFen(text);
    } catch (err) {
      console.error("Failed to read clipboard", err);
    }
  };

  return (
    <TextField
      label="FEN Position"
      variant="outlined"
      value={fen}
      onChange={(e) => setFen(e.target.value)}
      placeholder="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
      // flex: 1 faz com que ele preencha o espaço restante ao lado do Select
      sx={{ flex: 1 }}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <Tooltip title="Paste from Clipboard">
                <IconButton edge="end" onClick={handleClipboardPaste}>
                  <Icon icon="ri:clipboard-line" />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}
