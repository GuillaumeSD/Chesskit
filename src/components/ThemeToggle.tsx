import { IconButton } from "@mui/material";
import { DarkMode, LightMode } from "@mui/icons-material";

// ❌ useTheme ko use mat karo
import { useThemeMode } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { mode, toggleTheme } = useThemeMode();

  return (
    <IconButton onClick={toggleTheme}>
      {mode === "light" ? <DarkMode /> : <LightMode />}
    </IconButton>
  );
}