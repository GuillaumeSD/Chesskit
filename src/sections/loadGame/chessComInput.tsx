import { useLocalStorage } from "@/hooks/useLocalStorage";
import { getChessComUserRecentGames } from "@/lib/chessCom";
import {
  CircularProgress,
  FormControl,
  Grid2 as Grid,
  TextField,
  List,
  Autocomplete,
} from "@mui/material";
import { Icon } from "@iconify/react";
import { useDebounce } from "@/hooks/useDebounce";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { GameItem } from "./gameItem";

interface Props {
  onSelect: (pgn: string, boardOrientation?: boolean) => void;
}

export default function ChessComInput({ onSelect }: Props) {
  const [rawStoredValue, setStoredValues] = useLocalStorage<string>(
    "chesscom-username",
    ""
  );
  const [chessComUsername, setChessComUsername] = useState("");
  const [hasEdited, setHasEdited] = useState(false);

  const storedValues = useMemo(() => {
    if (typeof rawStoredValue === "string") {
      return rawStoredValue
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    return [];
  }, [rawStoredValue]);

  if (
    !hasEdited &&
    storedValues.length &&
    chessComUsername.trim().toLowerCase() !=
      storedValues[0].trim().toLowerCase()
  ) {
    setChessComUsername(storedValues[0].trim());
  }

  const updateHistory = (username: string) => {
    const trimmed = username.trim();
    if (!trimmed) return;
    const lower = trimmed.toLowerCase();

    const updated = [
      trimmed,
      ...storedValues.filter((u) => u.toLowerCase() !== lower),
    ].slice(0, 8);

    setStoredValues(updated.join(","));
  };

  const deleteUsername = (usernameToDelete: string) => {
    const updated = storedValues.filter((u) => u !== usernameToDelete);
    setStoredValues(updated.join(","));
  };

  const handleChange = (_: React.SyntheticEvent, newValue: string | null) => {
    const newInputValue = newValue ?? "";
    setChessComUsername(newInputValue.trim());
    setHasEdited(true);
  };

  const debouncedUsername = useDebounce(chessComUsername, 300);

  const {
    data: games,
    isFetching,
    isError,
  } = useQuery({
    queryKey: ["CCUserGames", debouncedUsername],
    enabled: !!debouncedUsername,
    queryFn: ({ signal }) =>
      getChessComUserRecentGames(debouncedUsername ?? "", signal),
    retry: 1,
  });

  return (
    <>
      <FormControl sx={{ my: 1, width: 300 }}>
        <Autocomplete
          freeSolo
          options={storedValues}
          inputValue={chessComUsername}
          onInputChange={handleChange}
          onChange={handleChange}
          renderOption={(props, option) => {
            const { key, ...rest } = props;
            return (
              <li
                key={key}
                {...rest}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingRight: 8,
                }}
              >
                <span>{option}</span>
                <Icon
                  icon="mdi:close"
                  style={{ cursor: "pointer" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteUsername(option);
                  }}
                />
              </li>
            );
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Enter your Chess.com username..."
              variant="outlined"
            />
          )}
        />
      </FormControl>

      {debouncedUsername && (
        <Grid
          container
          gap={2}
          justifyContent="center"
          alignContent="center"
          minHeight={100}
          size={12}
        >
          {isFetching ? (
            <CircularProgress />
          ) : isError ? (
            <span style={{ color: "salmon" }}>
              User not found. Please check your username.
            </span>
          ) : !games?.length ? (
            <span style={{ color: "salmon" }}>
              No games found. Please check your username.
            </span>
          ) : (
            <List sx={{ width: "100%" }}>
              {games.map((game) => {
                const perspectiveUserColor =
                  game.white.name.toLowerCase() ===
                  debouncedUsername.toLowerCase()
                    ? "white"
                    : "black";

                return (
                  <GameItem
                    key={game.id}
                    game={game}
                    perspectiveUserColor={perspectiveUserColor}
                    onClick={() => {
                      const boardOrientation =
                        debouncedUsername.toLowerCase() !==
                        game.black?.name?.toLowerCase();
                      onSelect(game.pgn, boardOrientation);
                      updateHistory(debouncedUsername);
                    }}
                  />
                );
              })}
            </List>
          )}
        </Grid>
      )}
    </>
  );
}
