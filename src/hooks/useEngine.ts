import { isWasmSupported } from "@/lib/engine/shared";
import { Stockfish11 } from "@/lib/engine/stockfish11";
import { Stockfish16 } from "@/lib/engine/stockfish16";
import { Stockfish16_1 } from "@/lib/engine/stockfish16_1";
import { Stockfish17 } from "@/lib/engine/stockfish17";
import { UciEngine } from "@/lib/engine/uciEngine";
import { EngineName } from "@/types/enums";
import { useEffect, useState } from "react";

export const useEngine = (engineName: EngineName | undefined) => {
  const [engine, setEngine] = useState<UciEngine | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!engineName) return;

    if (engineName !== EngineName.Stockfish11 && !isWasmSupported()) {
      return;
    }

    pickEngine(engineName).then((newEngine) => {
      if (!isMounted) {
        // If React unmounted this hook while the worker was booting,
        // instantly kill the orphaned worker to prevent invisible memory/CPU leaks
        newEngine.shutdown();
        return;
      }

      setEngine((prev) => {
        prev?.shutdown();
        return newEngine;
      });
    });

    return () => {
      isMounted = false;
    };
  }, [engineName]);

  return engine;
};

const pickEngine = (engine: EngineName): Promise<UciEngine> => {
  switch (engine) {
    case EngineName.Stockfish17:
      return Stockfish17.create(false);
    case EngineName.Stockfish17Lite:
      return Stockfish17.create(true);
    case EngineName.Stockfish16_1:
      return Stockfish16_1.create(false);
    case EngineName.Stockfish16_1Lite:
      return Stockfish16_1.create(true);
    case EngineName.Stockfish16:
      return Stockfish16.create(false);
    case EngineName.Stockfish16NNUE:
      return Stockfish16.create(true);
    case EngineName.Stockfish11:
      return Stockfish11.create();
  }
};
