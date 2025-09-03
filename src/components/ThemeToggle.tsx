import React from "react";
import { IconButton } from "@mui/material";
import { DarkMode, LightMode } from "@mui/icons-material";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <IconButton onClick={toggleTheme} color="inherit">
      {theme === "dark" ? <LightMode /> : <DarkMode />}
    </IconButton>
  );
}