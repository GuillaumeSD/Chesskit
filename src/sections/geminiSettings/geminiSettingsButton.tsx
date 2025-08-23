import { Icon } from "@iconify/react";
import {
  Box,
  Fab,
  FormControlLabel,
  FormGroup,
  IconButton,
  Paper,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { geminiSettingsAtom } from "../analysis/states";
import GeminiHelpTooltip from "@/components/geminiHelpTooltip";

export default function GeminiSettingsButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [geminiSettings, setGeminiSettings] = useAtom(geminiSettingsAtom);
  const [apiKey, setApiKey] = useState("");
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    setApiKey(geminiSettings.apiKey || "");

    const hasSeenHelp = localStorage.getItem("gemini_help_seen");
    if (geminiSettings.enabled && !hasSeenHelp) {
      setShowHelp(true);
      localStorage.setItem("gemini_help_seen", "true");
    }
  }, [geminiSettings.apiKey, geminiSettings.enabled]);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSave = () => {
    setGeminiSettings({
      ...geminiSettings,
      apiKey: apiKey.trim(),
    });
    setIsOpen(false);
  };

  const handleToggleEnabled = () => {
    setGeminiSettings({
      ...geminiSettings,
      enabled: !geminiSettings.enabled,
    });
  };

  const handleToggleAutoExplain = () => {
    setGeminiSettings({
      ...geminiSettings,
      autoExplain: !geminiSettings.autoExplain,
    });
  };

  return (
    <>
      <Box
        sx={{
          position: "fixed",
          bottom: 16,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1,
        }}
      >
        <Tooltip title="Gemini AI Settings">
          <Fab
            color="primary"
            aria-label="AI Settings"
            size="medium"
            onClick={handleOpen}
            sx={{
              boxShadow: 4,
              background: "linear-gradient(45deg, #2196F3 30%, #3F51B5 90%)",
              "&:hover": {
                background: "linear-gradient(45deg, #1E88E5 30%, #303F9F 90%)",
              },
            }}
          >
            <Icon icon="ic:baseline-psychology-alt" width={28} height={28} />
          </Fab>
        </Tooltip>
      </Box>

      {showHelp && <GeminiHelpTooltip onClose={() => setShowHelp(false)} />}

      {isOpen && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1200,
          }}
          onClick={handleClose}
        >
          <Paper
            sx={{
              width: "90%",
              maxWidth: 500,
              padding: 3,
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
            elevation={6}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 2,
              }}
            >
              <Typography variant="h6">Gemini AI Settings</Typography>
              <IconButton onClick={handleClose} edge="end">
                <Icon icon="mdi:close" />
              </IconButton>
            </Box>

            <FormGroup sx={{ marginBottom: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={geminiSettings.enabled}
                    onChange={handleToggleEnabled}
                  />
                }
                label="Enable Gemini AI"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={geminiSettings.autoExplain}
                    onChange={handleToggleAutoExplain}
                    disabled={!geminiSettings.enabled}
                  />
                }
                label="Auto-explain moves"
              />
            </FormGroup>

            <Typography variant="subtitle1" gutterBottom>
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
            <TextField
              fullWidth
              size="small"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Gemini API key"
              type="password"
              sx={{ marginBottom: 2 }}
              disabled={!geminiSettings.enabled}
            />

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
              <IconButton
                color="primary"
                onClick={handleSave}
                disabled={!geminiSettings.enabled}
              >
                <Icon icon="mdi:content-save" width={24} height={24} />
              </IconButton>
            </Box>
          </Paper>
        </Box>
      )}
    </>
  );
}
