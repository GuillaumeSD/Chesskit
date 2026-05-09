import { useState, useEffect } from "react";
import { Box, Paper, Typography, IconButton } from "@mui/material";
import { Icon } from "@iconify/react";

interface GeminiHelpTooltipProps {
  onClose: () => void;
}

export default function GeminiHelpTooltip({ onClose }: GeminiHelpTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 85,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 100,
        maxWidth: 280,
        animation: "fadeIn 0.5s",
        "@keyframes fadeIn": {
          "0%": {
            opacity: 0,
            transform: "translateY(20px)",
          },
          "100%": {
            opacity: 1,
            transform: "translateY(0)",
          },
        },
      }}
    >
      <Paper
        elevation={4}
        sx={{
          p: 2,
          borderRadius: 2,
          position: "relative",
          borderLeft: 4,
          borderColor: "primary.main",
        }}
      >
        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            position: "absolute",
            top: 4,
            right: 4,
          }}
        >
          <Icon icon="mdi:close" width={16} />
        </IconButton>

        <Typography
          variant="subtitle2"
          sx={{ mb: 1, fontWeight: "bold", pr: 3 }}
        >
          New: Gemini AI Explanations
        </Typography>

        <Typography variant="body2" sx={{ mb: 1 }}>
          Click the brain icon to get simple, easy-to-understand explanations
          for your chess moves!
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Icon icon="ic:baseline-psychology-alt" width={18} color="primary" />
          <Typography variant="caption" color="text.secondary">
            Click this button in the analysis tab
          </Typography>
        </Box>
      </Paper>

      <Box
        sx={{
          width: 0,
          height: 0,
          borderLeft: "8px solid transparent",
          borderRight: "8px solid transparent",
          borderTop: "12px solid #fff",
          position: "absolute",
          bottom: -12,
          left: "50%",
          transform: "translateX(-50%)",
          filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.2))",
        }}
      />
    </Box>
  );
}
