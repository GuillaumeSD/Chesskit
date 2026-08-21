import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from "lz-string";
import { getGameFromPgn } from "./chess";

/**
 * A shared game lives entirely in its link: the PGN is compressed so that even
 * long games fit in a URL that can be pasted anywhere.
 */
export const getGameShareUrl = (pgn: string, orientation: boolean): string => {
  const params = new URLSearchParams({
    pgn: compressToEncodedURIComponent(pgn),
  });
  if (!orientation) params.set("orientation", "black");

  const { origin, pathname } = window.location;

  return `${origin}${pathname}?${params.toString()}`;
};

export const getPgnFromShareParam = (param: string): string | undefined => {
  try {
    const pgn = decompressFromEncodedURIComponent(param);
    if (!pgn) return undefined;

    getGameFromPgn(pgn); // throws if the shared PGN is not a valid game

    return pgn;
  } catch {
    return undefined;
  }
};
