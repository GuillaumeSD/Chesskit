import { EngineName } from "@/types/enums";
import { Stockfish11 } from "./stockfish11";

import { Stockfish17 } from "./stockfish17";

export const isWasmSupported = () =>
  typeof WebAssembly === "object" &&
  WebAssembly.validate(
    Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00)
  );

export const isMultiThreadSupported = () => {
  try {
    return SharedArrayBuffer !== undefined && !isIosDevice();
  } catch {
    return false;
  }
};

export const isIosDevice = () => /iPhone|iPad|iPod/i.test(navigator.userAgent);

export const isMobileDevice = () =>
  isIosDevice() || /Android|Opera Mini/i.test(navigator.userAgent);

export const isEngineSupported = (name: EngineName): boolean => {
  switch (name) {
    case EngineName.Stockfish17:
    case EngineName.Stockfish17Lite:
      return Stockfish17.isSupported();

    case EngineName.Stockfish11:
      return Stockfish11.isSupported();
  }
};
