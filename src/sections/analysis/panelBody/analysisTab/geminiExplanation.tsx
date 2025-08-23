import {
  Box,
  CircularProgress,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import { useAtom, useAtomValue } from "jotai";
import {
  currentExplanationAtom,
  currentPositionAtom,
  isLoadingExplanationAtom,
} from "../../states";
import { Icon } from "@iconify/react";
// eslint-disable-next-line import/no-named-as-default
import useGeminiExplanation from "@/hooks/useGeminiExplanation";
import { GeminiMoveAnalysisParams } from "@/lib/gemini";
import { useCallback, useEffect, useRef, useState } from "react";
import { moveLineUciToSan } from "@/lib/chess";

export default function GeminiExplanation() {
  const currentPosition = useAtomValue(currentPositionAtom);
  const [currentExplanation, setCurrentExplanation] = useAtom(
    currentExplanationAtom
  );
  const [isLoading, setIsLoading] = useAtom(isLoadingExplanationAtom);
  const { getExplanation } = useGeminiExplanation();
  const [error, setError] = useState<string | null>(null);
  const explanationRef = useRef<HTMLDivElement>(null);

  const handleExplainMove = useCallback(async () => {
    if (
      !currentPosition.lastMove ||
      !currentPosition.eval?.moveClassification
    ) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const bestMove = currentPosition.eval?.bestMove;
      const bestMoveSan = bestMove
        ? moveLineUciToSan(currentPosition.lastMove.before)(bestMove)
        : undefined;

      const params: GeminiMoveAnalysisParams = {
        fen: currentPosition.lastMove.before,
        move: currentPosition.lastMove,
        classification: currentPosition.eval.moveClassification,
        bestMove,
        bestMoveSan,
      };

      const explanation = await getExplanation(params);
      setCurrentExplanation(explanation);

      setTimeout(() => {
        explanationRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to get explanation"
      );
      console.error("Failed to get Gemini explanation:", error);
    } finally {
      setIsLoading(false);
    }
  }, [
    currentPosition.lastMove,
    currentPosition.eval?.moveClassification,
    currentPosition.eval?.bestMove,
    getExplanation,
    setCurrentExplanation,
    setIsLoading,
  ]);

  useEffect(() => {
    setCurrentExplanation("");
    setError(null);
  }, [currentPosition.lastMove?.san, setCurrentExplanation]);

  if (!currentPosition.lastMove || !currentPosition.eval?.moveClassification) {
    return null;
  }

  return (
    <Box
      ref={explanationRef}
      sx={{
        marginTop: 2,
        width: "100%",
        border: "1px solid",
        borderColor: "primary.light",
        borderRadius: 1,
        padding: 2,
        backgroundColor: "rgba(25, 118, 210, 0.05)",
        height: 200,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        animation: isLoading
          ? "pulse 1.5s infinite"
          : currentExplanation
            ? "highlight 1s"
            : "none",
        "@keyframes pulse": {
          "0%": { boxShadow: "0 0 0 0 rgba(25, 118, 210, 0.4)" },
          "70%": { boxShadow: "0 0 0 10px rgba(25, 118, 210, 0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(25, 118, 210, 0)" },
        },
        "@keyframes highlight": {
          "0%": { boxShadow: "0 0 0 0 rgba(25, 118, 210, 0.7)" },
          "70%": { boxShadow: "0 0 10px 5px rgba(25, 118, 210, 0.3)" },
          "100%": { boxShadow: "0 0 0 0 rgba(25, 118, 210, 0)" },
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 1,
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: "bold", color: "primary.main" }}
        >
          Gemini AI Explanation
        </Typography>
        <Tooltip
          title={isLoading ? "Loading..." : "Explain this move with Gemini AI"}
        >
          <IconButton
            onClick={handleExplainMove}
            disabled={isLoading}
            color="primary"
            size="small"
          >
            {isLoading ? (
              <CircularProgress size={24} />
            ) : (
              <Icon icon="ic:baseline-psychology-alt" width={24} height={24} />
            )}
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ flexGrow: 1, overflow: "auto", mt: 1 }}>
        {currentExplanation ? (
          <Paper
            elevation={1}
            sx={{
              p: 2,
              bgcolor: "background.paper",
              borderRadius: 1,
              boxShadow: 1,
              height: "100%",
              overflow: "auto",
            }}
          >
            <Box sx={{ maxHeight: "100%", overflow: "auto" }}>
              <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                {currentExplanation}
              </Typography>
            </Box>
          </Paper>
        ) : error ? (
          <Paper
            elevation={1}
            sx={{
              p: 2,
              bgcolor: "#fff1f0",
              borderRadius: 1,
              boxShadow: 1,
              borderLeft: 4,
              borderColor: "error.main",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          </Paper>
        ) : (
          <Paper
            elevation={1}
            sx={{
              p: 2,
              bgcolor: "#f5f5f5",
              borderRadius: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              borderLeft: 4,
              borderColor: "primary.light",
              height: "100%",
            }}
          >
            <Typography variant="body2" color="text.secondary" align="center">
              <Icon
                icon="ic:baseline-psychology-alt"
                style={{ verticalAlign: "middle", marginRight: "8px" }}
              />
              Click the brain icon to get an AI explanation for this move
            </Typography>
          </Paper>
        )}
      </Box>
    </Box>
  );
}
