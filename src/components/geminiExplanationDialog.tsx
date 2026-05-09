import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
  Typography,
  CircularProgress,
  Fab,
  Tooltip,
  Paper,
  TextField,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
} from "@mui/material";
import { Icon } from "@iconify/react";
import { useAtom, useAtomValue } from "jotai";
import {
  currentPositionAtom,
  geminiSettingsAtom,
} from "@/sections/analysis/states";
// eslint-disable-next-line import/no-named-as-default
import useGeminiExplanation from "@/hooks/useGeminiExplanation";
import { GeminiMoveAnalysisParams } from "@/lib/gemini";
import { moveLineUciToSan } from "@/lib/chess";
import { MoveClassification } from "@/types/enums";

export default function GeminiExplanationDialog() {
  const [open, setOpen] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentPosition = useAtomValue(currentPositionAtom);
  const [geminiSettings, setGeminiSettings] = useAtom(geminiSettingsAtom);
  const { getExplanation } = useGeminiExplanation();

  const [apiKey, setApiKey] = useState("");
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    setApiKey(geminiSettings.apiKey || "");
  }, [geminiSettings.apiKey]);

  const handleOpen = () => {
    setOpen(true);
    setTabValue(0);
    fetchExplanation();
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChangeTab = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleToggleEnabled = () => {
    setGeminiSettings({
      ...geminiSettings,
      enabled: !geminiSettings.enabled,
    });
  };

  const handleSaveApiKey = () => {
    setGeminiSettings({
      ...geminiSettings,
      apiKey: apiKey.trim(),
    });
  };

  const fetchExplanation = useCallback(async () => {
    if (
      !currentPosition.lastMove ||
      !currentPosition.eval?.moveClassification
    ) {
      setError("No move to explain. Make a move first or load a game.");
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

      const explanationText = await getExplanation(params, true);
      setExplanation(explanationText);
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
    setExplanation,
    setError,
    setIsLoading,
  ]);

  const getMoveClassificationColor = (
    classification: MoveClassification
  ): string => {
    switch (classification) {
      case MoveClassification.Blunder:
        return "#e53935";
      case MoveClassification.Mistake:
        return "#ff7043";
      case MoveClassification.Inaccuracy:
        return "#ffa726";
      case MoveClassification.Okay:
        return "#dce775";
      case MoveClassification.Excellent:
        return "#66bb6a";
      case MoveClassification.Best:
        return "#26a69a";
      case MoveClassification.Forced:
        return "#78909c";
      case MoveClassification.Opening:
        return "#7e57c2";
      case MoveClassification.Perfect:
        return "#5c6bc0";
      case MoveClassification.Splendid:
        return "#ec407a";
      default:
        return "#78909c";
    }
  };

  return (
    <>
      <Box
        sx={{
          position: "fixed",
          bottom: 16,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1200,
        }}
      >
        <Tooltip title="Get AI Explanation for Current Move">
          <Fab
            color="primary"
            onClick={handleOpen}
            disabled={!geminiSettings.enabled || !currentPosition.lastMove}
            sx={{
              boxShadow: 4,
              background: "#3B9AC6",
              "&:hover": {
                background: "#2A7DA9",
              },
              "&.Mui-disabled": {
                background: "rgba(0, 0, 0, 0.12)",
              },
            }}
          >
            <Icon icon="ic:baseline-psychology-alt" width={28} height={28} />
          </Fab>
        </Tooltip>
      </Box>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 2,
              minHeight: "30vh",
              maxHeight: "70vh",
              height: "auto",
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            pr: 6,
            display: "flex",
            alignItems: "center",
            gap: 1,
            bgcolor: "#3B9AC6",
            color: "white",
            mb: 0,
            pb: 1,
          }}
        >
          <Icon icon="ic:baseline-psychology-alt" width={24} height={24} />
          Gemini AI Chess Assistant
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: "white",
            }}
          >
            <Icon icon="mdi:close" />
          </IconButton>
        </DialogTitle>

        <Tabs
          value={tabValue}
          onChange={handleChangeTab}
          variant="fullWidth"
          sx={{
            bgcolor: "#3B9AC6",
            "& .MuiTab-root": {
              color: "rgba(58, 54, 54, 0.5)",
              textTransform: "none",
              py: 0.5,
              opacity: 0.7,
            },
            "& .Mui-selected": {
              color: "white",
              fontWeight: "bold",
              opacity: 1,
              bgcolor: "rgba(161, 147, 147, 0.15)",
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "white",
              height: 3,
            },
          }}
        >
          <Tab
            label="Explanation"
            icon={<Icon icon="mdi:comment-text-outline" />}
            iconPosition="start"
          />
          <Tab
            label="Settings"
            icon={<Icon icon="mdi:cog-outline" />}
            iconPosition="start"
          />
        </Tabs>

        <DialogContent sx={{ p: 0, overflow: "hidden" }}>
          {tabValue === 0 && (
            <Box sx={{ px: 3, py: 2 }}>
              {currentPosition.lastMove &&
                currentPosition.eval?.moveClassification && (
                  <Box
                    sx={{
                      mb: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "50%",
                          bgcolor:
                            currentPosition.lastMove.color === "w"
                              ? "#f9f9f9"
                              : "#333333",
                          color:
                            currentPosition.lastMove.color === "w"
                              ? "#333333"
                              : "#ffffff",
                          border: "1px solid #dddddd",
                        }}
                      >
                        {currentPosition.lastMove.color === "w" ? (
                          <Icon icon="mdi:chess-queen" width={16} height={16} />
                        ) : (
                          <Icon icon="mdi:chess-queen" width={16} height={16} />
                        )}
                      </Box>
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#d4d3d3ff",
                            fontSize: "0.7rem",
                            display: "block",
                            lineHeight: 1.2,
                          }}
                        >
                          {currentPosition.lastMove.color === "w"
                            ? "White"
                            : "Black"}{" "}
                          played
                        </Typography>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: "bold",
                            fontSize: "1.1rem",
                            lineHeight: 1.2,
                            color: "#4e99a1ff",
                          }}
                        >
                          {currentPosition.lastMove.san}
                        </Typography>
                      </Box>
                    </Box>

                    <Box
                      component="span"
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        bgcolor: getMoveClassificationColor(
                          currentPosition.eval.moveClassification
                        ),
                        color: "white",
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 10,
                        fontSize: "0.75rem",
                        fontWeight: "bold",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                        textTransform: "uppercase",
                        letterSpacing: "0.02em",
                      }}
                    >
                      {currentPosition.eval.moveClassification}
                    </Box>
                  </Box>
                )}

              {isLoading ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "120px",
                  }}
                >
                  <CircularProgress size={36} />
                </Box>
              ) : error ? (
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    bgcolor: "#fff1f0",
                    borderRadius: 2,
                    border: "1px solid #ff7875",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                >
                  <Typography
                    color="error"
                    sx={{
                      fontWeight: 500,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      fontSize: "0.95rem",
                    }}
                  >
                    <Icon icon="mdi:alert-circle" />
                    {error}
                  </Typography>
                </Paper>
              ) : explanation ? (
                <Box
                  sx={{
                    p: 2.5,
                    bgcolor: "#ffffff",
                    borderRadius: 1,
                    border: "1px solid #e0e0e0",
                    maxHeight: "280px",
                    overflow: "auto",
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      lineHeight: 1.6,
                      fontSize: "0.95rem",
                      color: "#333333",
                      fontWeight: 400,
                    }}
                  >
                    {explanation}
                  </Typography>
                </Box>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "120px",
                    flexDirection: "column",
                    gap: 1.5,
                  }}
                >
                  <Icon
                    icon="mdi:comment-question-outline"
                    width={36}
                    height={36}
                    color="#3B9AC6"
                  />
                  <Typography
                    color="text.secondary"
                    sx={{
                      fontSize: "1rem",
                      fontWeight: 500,
                    }}
                  >
                    No explanation available yet.
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#666666",
                      textAlign: "center",
                      maxWidth: "80%",
                    }}
                  >
                    Make a move or select a position to get an explanation
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {tabValue === 1 && (
            <Box sx={{ p: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={geminiSettings.enabled}
                    onChange={handleToggleEnabled}
                  />
                }
                label="Enable Gemini AI"
                sx={{ mb: 2 }}
              />

              <Typography variant="subtitle2" gutterBottom>
                API Key
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Enter your Gemini API key. Get one at{" "}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google AI Studio
                </a>
              </Typography>

              <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                <TextField
                  fullWidth
                  size="small"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your Gemini API key"
                  type="password"
                  disabled={!geminiSettings.enabled}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleSaveApiKey}
                  disabled={!geminiSettings.enabled || !apiKey.trim()}
                >
                  Save
                </Button>
              </Box>

              <Box sx={{ mt: 4 }}>
                <Typography variant="subtitle2" gutterBottom>
                  About Gemini AI Chess Assistant
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This feature uses Google{"'"}s Gemini AI to analyze chess
                  moves and provide easy-to-understand explanations for why a
                  move is good, bad, or interesting. It helps players of all
                  levels understand the strategic and tactical elements of their
                  games.
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>

        {tabValue === 0 && (
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button
              variant="outlined"
              onClick={fetchExplanation}
              disabled={
                isLoading ||
                !geminiSettings.enabled ||
                !currentPosition.lastMove
              }
              startIcon={
                isLoading ? (
                  <CircularProgress size={16} />
                ) : (
                  <Icon icon="mdi:refresh" />
                )
              }
              color="primary"
            >
              {isLoading ? "Generating..." : "Refresh Explanation"}
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </>
  );
}
