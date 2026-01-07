import LoadGameButton from "../../loadGame/loadGameButton";
import { useCallback, useEffect, useMemo } from "react";
import { useChessActions } from "@/hooks/useChessActions";
import {
  boardAtom,
  boardOrientationAtom,
  evaluationProgressAtom,
  gameAtom,
  gameEvalAtom,
} from "../states";
import { useGameDatabase } from "@/hooks/useGameDatabase";
import { useAtomValue, useSetAtom } from "jotai";
import { Chess } from "chess.js";
import { useRouter } from "next/router";
import { GameEval } from "@/types/eval";
import { fetchLichessGame } from "@/lib/lichess";

export default function LoadGame() {
  const router = useRouter();
  const game = useAtomValue(gameAtom);
  const { setPgn: setGamePgn, reset: resetGame } = useChessActions(gameAtom);
  const { resetToStartingPosition: resetBoard } = useChessActions(boardAtom);
  const { gameFromUrl } = useGameDatabase();
  const setEval = useSetAtom(gameEvalAtom);
  const setBoardOrientation = useSetAtom(boardOrientationAtom);
  const evaluationProgress = useAtomValue(evaluationProgressAtom);

  const joinedGameHistory = useMemo(() => game.history().join(), [game]);

  const resetAndSetGamePgn = useCallback(
    (
      input: string,
      orientation?: boolean,
      gameEval?: GameEval,
      source: "fen" | "pgn" = "pgn"
    ) => {
      const gameFromInput = new Chess();

      try {
        if (source === "fen") {
          gameFromInput.load(input);
        } else {
          gameFromInput.loadPgn(input);
        }
      } catch (e) {
        console.error("Erro while loading the game:", e);
        return;
      }

      if (
        source === "pgn" &&
        joinedGameHistory === gameFromInput.history().join()
      ) {
        return;
      }

      resetBoard(input, source);
      setEval(gameEval);

      if (source === "fen") {
        resetGame({ fen: input });
      } else {
        setGamePgn(input);
      }

      setBoardOrientation(orientation ?? true);
    },
    [
      joinedGameHistory,
      resetBoard,
      setGamePgn,
      resetGame,
      setEval,
      setBoardOrientation,
    ]
  );

  const { lichessGameId, orientation: orientationParam } = router.query;

  useEffect(() => {
    const handleLichess = async (id: string) => {
      const res = await fetchLichessGame(id);
      if (typeof res === "string") {
        resetAndSetGamePgn(res, orientationParam !== "black");
      }
    };

    if (gameFromUrl) {
      const orientation = !(
        gameFromUrl.site === "Chesskit.org" && gameFromUrl.black.name === "You"
      );
      resetAndSetGamePgn(gameFromUrl.pgn, orientation, gameFromUrl.eval);
    } else if (typeof lichessGameId === "string" && !!lichessGameId) {
      handleLichess(lichessGameId);
    }
  }, [gameFromUrl, lichessGameId, orientationParam, resetAndSetGamePgn]);

  useEffect(() => {
    const eventHandler = (event: MessageEvent) => {
      try {
        if (!event?.data?.pgn) return;
        const { pgn, orientation } = event.data as {
          pgn: string;
          orientation?: "white" | "black";
        };
        resetAndSetGamePgn(pgn, orientation !== "black");
      } catch (error) {
        console.error("Error processing message event:", error);
      }
    };
    window.addEventListener("message", eventHandler);

    return () => {
      window.removeEventListener("message", eventHandler);
    };
  }, [resetAndSetGamePgn]);

  const isGameLoaded =
    gameFromUrl !== undefined ||
    (!!game.getHeaders().White && game.getHeaders().White !== "?") ||
    game.history().length > 0;

  if (evaluationProgress) return null;

  return (
    <LoadGameButton
      label={isGameLoaded ? "Load another game" : "Load game"}
      size="small"
      setGame={async (game) => {
        await router.replace(
          {
            query: {},
            pathname: router.pathname,
          },
          undefined,
          { shallow: true, scroll: false }
        );
        const headers = game.getHeaders();
        const isFenConfiguration = headers["SetUp"] === "1";
        const hasNoMoves = game.history().length === 0;

        if (isFenConfiguration || hasNoMoves) {
          const fen = game.fen();
          resetAndSetGamePgn(fen, undefined, undefined, "fen");
        } else {
          const pgn = game.pgn();
          resetAndSetGamePgn(pgn, undefined, undefined, "pgn");
        }
      }}
    />
  );
}
