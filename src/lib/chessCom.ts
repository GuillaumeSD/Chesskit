import { ChessComGame } from "@/types/chessCom";
import { getPaddedNumber } from "./helpers";
import { LoadedGame } from "@/types/game";

export const getChessComUserRecentGames = async (
  username: string,
  signal?: AbortSignal
): Promise<LoadedGame[]> => {
  const date = new Date();
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const paddedMonth = getPaddedNumber(month);

  const res = await fetch(
    `https://api.chess.com/pub/player/${username}/games/${year}/${paddedMonth}`,
    { method: "GET", signal }
  );

  const data = await res.json();

  if (
    res.status >= 400 &&
    data.message !== "Date cannot be set in the future"
  ) {
    throw new Error("Error fetching games from Chess.com");
  }

  const games: ChessComGame[] = data?.games ?? [];

  if (games.length < 50) {
    const previousMonth = month === 1 ? 12 : month - 1;
    const previousPaddedMonth = getPaddedNumber(previousMonth);
    const yearToFetch = previousMonth === 12 ? year - 1 : year;

    const resPreviousMonth = await fetch(
      `https://api.chess.com/pub/player/${username}/games/${yearToFetch}/${previousPaddedMonth}`
    );

    const dataPreviousMonth = await resPreviousMonth.json();

    games.push(...(dataPreviousMonth?.games ?? []));
  }

  const gamesToReturn = games
    .filter((game) => game.pgn && game.end_time)
    .sort((a, b) => b.end_time - a.end_time)
    .slice(0, 50)
    .map(formatChessComGame);

  return gamesToReturn;
};

/**
 * Chess.com's public API exposes no single-game endpoint, and the undocumented
 * `/callback/live/game/{id}` route sends no CORS headers, so it is unreachable
 * from the browser. The only way to resolve a game id is to scan that player's
 * monthly archives.
 *
 * Archives run ~700KB each and an active player can have well over a hundred of
 * them, so the scan is bounded to the most recent months and walks newest first
 * — shared games are nearly always recent, so this usually resolves on the first
 * request.
 */
export const CHESS_COM_ARCHIVE_SCAN_LIMIT = 6;

export const fetchChessComGame = async (
  username: string,
  gameId: string,
  signal?: AbortSignal
): Promise<string> => {
  const usernameParam = encodeURIComponent(username.trim().toLowerCase());

  const archivesRes = await fetch(
    `https://api.chess.com/pub/player/${usernameParam}/games/archives`,
    { method: "GET", signal }
  );

  if (archivesRes.status >= 400) {
    throw new Error(`Chess.com user "${username}" not found`);
  }

  const archivesData = await archivesRes.json();
  const archives: string[] = archivesData?.archives ?? [];

  const archivesToScan = archives
    .slice(-CHESS_COM_ARCHIVE_SCAN_LIMIT)
    .reverse();

  for (const archiveUrl of archivesToScan) {
    const res = await fetch(archiveUrl, { method: "GET", signal });
    if (res.status >= 400) continue;

    const data = await res.json();
    const games: ChessComGame[] = data?.games ?? [];

    const game = games.find(
      (game) => game.uuid === gameId || game.url?.split("/").pop() === gameId
    );

    if (game?.pgn) return game.pgn;
  }

  throw new Error(
    `Game ${gameId} not found in ${username}'s last ${CHESS_COM_ARCHIVE_SCAN_LIMIT} months on Chess.com`
  );
};

export const getChessComUserAvatar = async (
  username: string
): Promise<string | null> => {
  const usernameParam = encodeURIComponent(username.trim().toLowerCase());

  const res = await fetch(`https://api.chess.com/pub/player/${usernameParam}`);
  const data = await res.json();
  const avatarUrl = data?.avatar;

  return typeof avatarUrl === "string" ? avatarUrl : null;
};

const formatChessComGame = (data: ChessComGame): LoadedGame => {
  const result = data.pgn.match(/\[Result "(.*?)"]/)?.[1];
  const movesNb = data.pgn.match(/\d+?\. /g)?.length;

  return {
    id: data.uuid || data.url?.split("/").pop() || data.id,
    pgn: data.pgn || "",
    white: {
      name: data.white?.username || "White",
      rating: data.white?.rating || 0,
      title: data.white?.title,
    },
    black: {
      name: data.black?.username || "Black",
      rating: data.black?.rating || 0,
      title: data.black?.title,
    },
    result,
    timeControl: getGameTimeControl(data),
    date: data.end_time
      ? new Date(data.end_time * 1000).toLocaleDateString()
      : new Date().toLocaleDateString(),
    movesNb: movesNb ? movesNb * 2 : undefined,
    url: data.url,
  };
};

const getGameTimeControl = (game: ChessComGame): string | undefined => {
  const rawTimeControl = game.time_control;
  if (!rawTimeControl) return undefined;

  const [firstPart, secondPart] = rawTimeControl.split("+");
  if (!firstPart) return undefined;

  const timeControl = Number(firstPart);
  const increment = secondPart ? `+${secondPart}` : "";
  if (timeControl < 60) return `${timeControl}s${increment}`;

  if (timeControl < 3600) {
    const minutes = Math.floor(timeControl / 60);
    const seconds = timeControl % 60;

    return seconds
      ? `${minutes}m${getPaddedNumber(seconds)}s${increment}`
      : `${minutes}m${increment}`;
  }

  const hours = Math.floor(timeControl / 3600);
  const minutes = Math.floor((timeControl % 3600) / 60);
  return minutes
    ? `${hours}h${getPaddedNumber(minutes)}m${increment}`
    : `${hours}h${increment}`;
};
