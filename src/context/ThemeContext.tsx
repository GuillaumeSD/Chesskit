import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type ThemeMode = "light" | "dark";

export type ThemeModeContextType = {
  theme: ThemeMode;           // 👈 ye line important
  toggleTheme: () => void;
};

const ThemeModeContext = createContext<ThemeModeContextType | undefined>(
  undefined
);

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>("light");

  useEffect(() => {
    const saved = localStorage.getItem("theme") as ThemeMode | null;
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeModeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) throw new Error("useThemeMode must be used inside ThemeModeProvider");
  return ctx;
}