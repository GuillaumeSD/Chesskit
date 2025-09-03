import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import { useEffect, useState } from "react";
import NavMenu from "./NavMenu";
import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import NavLink from "@/components/NavLink";
import Image from "next/image";
import { styled } from "@mui/material/styles";

// 👇 context import
import { useThemeMode } from "@/context/ThemeContext";

// Styled component to make the link look like a button
const StyledIconButtonLink = styled("a")({
  color: "inherit",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  "&:hover": {
    cursor: "pointer",
  },
});

export default function NavBar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const router = useRouter();

  // 👇 context se dark/light mode ka state aur toggle le
  const { mode, toggleTheme } = useThemeMode();
  const darkMode = mode === "dark";

  useEffect(() => {
    setDrawerOpen(false);
  }, [router.pathname]);

  return (
    <Box sx={{ flexGrow: 1, display: "flex" }}>
      <AppBar
        position="static"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: darkMode ? "#19191c" : "white",
          color: darkMode ? "white" : "black",
        }}
        enableColorOnDark
      >
        <Toolbar variant="dense">
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: "min(0.5vw, 0.6rem)", padding: 1, my: 1 }}
            onClick={() => setDrawerOpen((val) => !val)}
          >
            <Icon icon="mdi:menu" />
          </IconButton>

          <Image
            src="/favicon-32x32.png"
            alt="Chesskit logo"
            width={32}
            height={32}
          />

          <NavLink href="/">
            <Typography
              variant="h6"
              component="div"
              sx={{
                flexGrow: 1,
                ml: 1,
                fontSize: { xs: "1rem", sm: "1.25rem" },
              }}
            >
              Chesskit
            </Typography>
          </NavLink>

          <StyledIconButtonLink
            href="https://discord.gg/Yr99abAcUr"
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconButton color="inherit" component="span">
              <Icon icon="ri:discord-fill" />
            </IconButton>
          </StyledIconButtonLink>

          <StyledIconButtonLink
            href="https://github.com/GuillaumeSD/Chesskit"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ ml: "min(0.6rem, 0.8vw)" }}
          >
            <IconButton color="inherit" component="span">
              <Icon icon="mdi:github" />
            </IconButton>
          </StyledIconButtonLink>

          {/* 👇 yaha ab context based toggle */}
          <IconButton
            sx={{ ml: "min(0.6rem, 0.8vw)" }}
            onClick={toggleTheme}
            color="inherit"
            edge="end"
          >
            {darkMode ? (
              <Icon icon="mdi:brightness-7" />
            ) : (
              <Icon icon="mdi:brightness-4" />
            )}
          </IconButton>
        </Toolbar>
      </AppBar>
      <NavMenu open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </Box>
  );
}