import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from "lz-string";

export const compressPgn = (pgn: string): string =>
  compressToEncodedURIComponent(pgn);

export const decompressPgn = (compressed: string): string | null => {
  try {
    const result = decompressFromEncodedURIComponent(compressed);
    return result || null;
  } catch {
    return null;
  }
};

export const buildShareUrl = (pgn: string, orientation?: boolean): string => {
  const compressed = compressPgn(pgn);
  const params = new URLSearchParams({ pgn: compressed });
  if (orientation === false) {
    params.set("orientation", "black");
  }
  return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
};
