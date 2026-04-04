import { openings } from "@/data/openings";
import { getEvaluateGameParams } from "@/lib/chess";
import { getMovesClassification } from "@/lib/engine/helpers/moveClassification";
import { UciEngine } from "@/lib/engine/uciEngine";
import { CurrentPosition, PositionEval } from "@/types/eval";
import { useAtom, useAtomValue } from "jotai";
import { useEffect, useRef } from "react";
import {
  playgroundCurrentPositionAtom,
  playgroundGameAtom,
  playgroundSavedEvalsAtom,
} from "../states";

const PLAYGROUND_MULTI_PV = 3;
const PLAYGROUND_DEPTH = 14;

export const usePlaygroundCurrentPosition = (engine: UciEngine | null) => {
  const [currentPosition, setCurrentPosition] = useAtom(
    playgroundCurrentPositionAtom
  );
  const game = useAtomValue(playgroundGameAtom);
  const [savedEvals, setSavedEvals] = useAtom(playgroundSavedEvalsAtom);
  const savedEvalsRef = useRef(savedEvals);
  const inFlightEvalsRef = useRef<Record<string, Promise<PositionEval>>>({});

  useEffect(() => {
    savedEvalsRef.current = savedEvals;
  }, [savedEvals]);

  useEffect(() => {
    const history = game.history({ verbose: true });
    const gameFen = game.fen();
    let isCancelled = false;

    const position: CurrentPosition = {
      lastMove: history.at(-1),
      currentMoveIdx: history.length,
    };

    for (const move of history.slice().reverse()) {
      const moveFen = move.after.split(" ")[0];
      const opening = openings.find((opening) => opening.fen === moveFen);
      if (opening) {
        position.opening = opening.name;
        break;
      }
    }

    setCurrentPosition(position);

    if (!engine?.getIsReady() || !engine.name || game.isGameOver()) {
      return;
    }

    const getFenEval = async (
      fen: string,
      setPartialEval?: (positionEval: PositionEval) => void
    ) => {
      if (!engine.getIsReady()) {
        throw new Error("Engine not ready");
      }

      const savedEval = savedEvalsRef.current[fen];
      if (
        savedEval &&
        savedEval.engine === engine.name &&
        (savedEval.lines?.length ?? 0) >= PLAYGROUND_MULTI_PV &&
        (savedEval.lines[0]?.depth ?? 0) >= PLAYGROUND_DEPTH
      ) {
        const positionEval: PositionEval = {
          ...savedEval,
          lines: savedEval.lines.slice(0, PLAYGROUND_MULTI_PV),
        };
        setPartialEval?.(positionEval);
        return positionEval;
      }

      const requestKey = [
        engine.name,
        fen,
        PLAYGROUND_DEPTH,
        PLAYGROUND_MULTI_PV,
      ].join(":");

      if (!inFlightEvalsRef.current[requestKey]) {
        inFlightEvalsRef.current[requestKey] = engine
          .evaluatePositionWithUpdate({
            fen,
            depth: PLAYGROUND_DEPTH,
            multiPv: PLAYGROUND_MULTI_PV,
            setPartialEval,
          })
          .finally(() => {
            delete inFlightEvalsRef.current[requestKey];
          });
      }

      const rawPositionEval = await inFlightEvalsRef.current[requestKey];

      if (rawPositionEval.lines.length === 0) {
        return rawPositionEval;
      }

      setSavedEvals((prev) => ({
        ...prev,
        [fen]: { ...rawPositionEval, engine: engine.name },
      }));

      return rawPositionEval;
    };

    const getPositionEval = async () => {
      const setPartialEval = (positionEval: PositionEval) => {
        if (isCancelled || gameFen !== game.fen()) return;
        setCurrentPosition((prev) => ({ ...prev, eval: positionEval }));
      };

      const currentEval = await getFenEval(game.fen(), setPartialEval);
      if (isCancelled || gameFen !== game.fen()) return;

      if (!history.length) return;

      const params = getEvaluateGameParams(game);
      const fens = params.fens.slice(game.turn() === "w" ? -3 : -4);
      const uciMoves = params.uciMoves.slice(game.turn() === "w" ? -2 : -3);

      const previousFen = fens.slice(-2)[0];
      if (!previousFen) return;

      const previousEval = await getFenEval(previousFen);
      if (isCancelled || gameFen !== game.fen()) return;

      const rawPositions: PositionEval[] = fens.map((_, idx) => {
        if (idx === fens.length - 2) return previousEval;
        if (idx === fens.length - 1) return currentEval;

        return {
          lines: [
            {
              pv: [],
              depth: 0,
              multiPv: 1,
              cp: 1,
            },
          ],
        };
      });

      const positionsWithMoveClassification = getMovesClassification(
        rawPositions,
        uciMoves,
        fens
      );

      setCurrentPosition((prev) => ({
        ...prev,
        eval: positionsWithMoveClassification.slice(-1)[0],
        lastEval: positionsWithMoveClassification.slice(-2)[0],
      }));
    };

    getPositionEval();

    return () => {
      isCancelled = true;
      if (engine.getIsReady()) {
        engine.stopAllCurrentJobs();
      }
    };
  }, [engine, game, setCurrentPosition, setSavedEvals]);

  return currentPosition;
};
