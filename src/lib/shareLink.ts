/**
 * Shareable game links.
 *
 * Chesskit is a static export with no backend, so a share link has to carry the
 * game itself. PGNs are gzipped with the browser's CompressionStream and encoded
 * as base64url, which keeps a typical Chess.com game (~3KB of PGN with clock
 * annotations) down to roughly 1KB of URL.
 *
 * The payload is prefixed with a one character format tag so the encoding can
 * change later without breaking links already in the wild.
 */

const FORMAT_GZIP = "1";
const FORMAT_RAW = "0";

/**
 * Decompression is bounded as it runs, not checked afterwards: gzip reaches
 * ratios near 1000:1, so a ~270KB param can inflate to 200MB and take the tab
 * down well before any check on the finished string could reject it.
 */
const MAX_DECODED_PGN_BYTES = 500_000;
const MAX_PARAM_LENGTH = 100_000;

const isCompressionSupported = (): boolean =>
  typeof CompressionStream === "function" &&
  typeof DecompressionStream === "function";

const bytesToBase64Url = (bytes: Uint8Array): string => {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

const base64UrlToBytes = (value: string): Uint8Array => {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    "="
  );

  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
};

const gzip = async (value: string): Promise<Uint8Array> => {
  const stream = new Blob([value])
    .stream()
    .pipeThrough(new CompressionStream("gzip"));

  return new Uint8Array(await new Response(stream).arrayBuffer());
};

/**
 * Inflates gzip data, giving up as soon as the output passes `maxBytes` so a
 * decompression bomb is abandoned mid-stream rather than fully expanded.
 */
const gunzipBounded = async (
  bytes: Uint8Array,
  maxBytes: number
): Promise<string | undefined> => {
  const reader = new Blob([bytes])
    .stream()
    .pipeThrough(new DecompressionStream("gzip"))
    .getReader();

  const chunks: Uint8Array[] = [];
  let size = 0;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;

    size += value.length;
    if (size > maxBytes) {
      await reader.cancel();
      return undefined;
    }

    chunks.push(value);
  }

  const decoded = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    decoded.set(chunk, offset);
    offset += chunk.length;
  }

  return new TextDecoder().decode(decoded);
};

/** Encodes a PGN into the value used by the `pgn` query param. */
export const encodePgnParam = async (pgn: string): Promise<string> => {
  if (!isCompressionSupported()) {
    return FORMAT_RAW + bytesToBase64Url(new TextEncoder().encode(pgn));
  }

  return FORMAT_GZIP + bytesToBase64Url(await gzip(pgn));
};

/**
 * Decodes a `pgn` query param back into a PGN string.
 * Returns undefined for anything malformed — a bad link should land the user on
 * an empty board, not a crash.
 */
export const decodePgnParam = async (
  param: string
): Promise<string | undefined> => {
  try {
    if (param.length > MAX_PARAM_LENGTH) return undefined;

    const format = param.slice(0, 1);
    const payload = param.slice(1);
    if (!payload) return undefined;

    const bytes = base64UrlToBytes(payload);

    if (format === FORMAT_RAW) {
      if (bytes.length > MAX_DECODED_PGN_BYTES) return undefined;
      return new TextDecoder().decode(bytes);
    }

    if (format === FORMAT_GZIP) {
      if (!isCompressionSupported()) return undefined;
      return await gunzipBounded(bytes, MAX_DECODED_PGN_BYTES);
    }

    return undefined;
  } catch (error) {
    console.error("Unable to decode shared PGN", error);
    return undefined;
  }
};

/** Builds a full share URL for a PGN, pointing at the analysis page. */
export const buildPgnShareUrl = async (
  pgn: string,
  orientation?: "white" | "black"
): Promise<string> => {
  const params = new URLSearchParams({ pgn: await encodePgnParam(pgn) });
  if (orientation === "black") params.set("orientation", "black");

  return `${window.location.origin}/?${params.toString()}`;
};
