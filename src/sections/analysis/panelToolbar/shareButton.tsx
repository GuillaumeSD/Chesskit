import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { Alert, Snackbar } from "@mui/material";
import { boardOrientationAtom, gameAtom } from "../states";
import { ToolbarButton } from "@/components/ToolbarButton";
import { buildPgnShareUrl } from "@/lib/shareLink";

export const ShareButton = () => {
  const game = useAtomValue(gameAtom);
  const boardOrientation = useAtomValue(boardOrientationAtom);
  const [shareUrl, setShareUrl] = useState("");
  const [feedback, setFeedback] = useState<{
    message: string;
    severity: "success" | "error";
  } | null>(null);

  // Building the link is async because the PGN is gzipped, and Safari drops the
  // user activation across an await — clipboard writes from the click handler
  // would fail with NotAllowedError. Prepare the link up front so the handler
  // itself stays synchronous, like CopyPgnButton.
  useEffect(() => {
    if (game.history().length === 0) {
      setShareUrl("");
      return;
    }

    let cancelled = false;

    buildPgnShareUrl(game.pgn(), boardOrientation ? "white" : "black")
      .then((url) => {
        if (!cancelled) setShareUrl(url);
      })
      .catch((error) => {
        console.error("Unable to build share link", error);
        if (!cancelled) setShareUrl("");
      });

    return () => {
      cancelled = true;
    };
  }, [game, boardOrientation]);

  const handleShare = () => {
    navigator.clipboard
      ?.writeText?.(shareUrl)
      ?.then(() =>
        setFeedback({ message: "Share link copied !", severity: "success" })
      )
      ?.catch((error) => {
        console.error(error);
        setFeedback({
          message: "Unable to copy the share link",
          severity: "error",
        });
      });
  };

  return (
    <>
      <ToolbarButton
        tooltip="Copy share link"
        onClick={handleShare}
        icon="ri:share-line"
        disabled={!shareUrl}
      />

      <Snackbar
        open={!!feedback}
        autoHideDuration={3000}
        onClose={() => setFeedback(null)}
      >
        <Alert
          onClose={() => setFeedback(null)}
          severity={feedback?.severity ?? "success"}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {feedback?.message}
        </Alert>
      </Snackbar>
    </>
  );
};
