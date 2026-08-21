import LoadGameButton from "../../loadGame/loadGameButton";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import { fetchChessComGame } from "@/lib/chessCom";
import { decodePgnParam } from "@/lib/shareLink";
import { Alert, Snackbar } from "@mui/material";

export default function LoadGame() {
  const router = useRouter();
  const game = useAtomValue(gameAtom);
  const { setPgn: setGamePgn } = useChessActions(gameAtom);
  const { resetToStartingPosition: resetBoard } = useChessActions(boardAtom);
  const { gameFromUrl } = useGameDatabase();
  const setEval = useSetAtom(gameEvalAtom);
  const setBoardOrientation = useSetAtom(boardOrientationAtom);
  const evaluationProgress = useAtomValue(evaluationProgressAtom);
  const [loadError, setLoadError] = useState("");
  const [isLoadingSharedGame, setIsLoadingSharedGame] = useState(false);

  const joinedGameHistory = useMemo(() => game.history().join(), [game]);

  const resetAndSetGamePgn = useCallback(
    (pgn: string, orientation?: boolean, gameEval?: GameEval) => {
      const gameFromPgn = new Chess();
      gameFromPgn.loadPgn(pgn);
      if (joinedGameHistory === gameFromPgn.history().join()) return;

      resetBoard(pgn);
      setEval(gameEval);
      setGamePgn(pgn);
      setBoardOrientation(orientation ?? true);
    },
    [joinedGameHistory, resetBoard, setGamePgn, setEval, setBoardOrientation]
  );

  const {
    lichessGameId,
    chessComUsername,
    chessComGameId,
    pgn: pgnParam,
    orientation: orientationParam,
  } = router.query;

  useEffect(() => {
    const controller = new AbortController();
    const isWhiteOrientation = orientationParam !== "black";

    const loadSharedGame = async () => {
      setIsLoadingSharedGame(true);
      setLoadError("");

      try {
        if (typeof pgnParam === "string" && pgnParam) {
          const pgn = await decodePgnParam(pgnParam);
          if (!pgn) throw new Error("This shared link is invalid or corrupted");
          resetAndSetGamePgn(pgn, isWhiteOrientation);
          return;
        }

        if (typeof lichessGameId === "string" && lichessGameId) {
          const res = await fetchLichessGame(lichessGameId, controller.signal);
          if (typeof res !== "string") {
            throw new Error(`Unable to load Lichess game ${lichessGameId}`);
          }
          resetAndSetGamePgn(res, isWhiteOrientation);
          return;
        }

        if (
          typeof chessComUsername === "string" &&
          chessComUsername &&
          typeof chessComGameId === "string" &&
          chessComGameId
        ) {
          const pgn = await fetchChessComGame(
            chessComUsername,
            chessComGameId,
            controller.signal
          );
          resetAndSetGamePgn(pgn, isWhiteOrientation);
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error(error);
        setLoadError(
          error instanceof Error ? error.message : "Unable to load shared game"
        );
      } finally {
        if (!controller.signal.aborted) setIsLoadingSharedGame(false);
      }
    };

    if (gameFromUrl) {
      const orientation = !(
        gameFromUrl.site === "Chesskit.org" && gameFromUrl.black.name === "You"
      );
      resetAndSetGamePgn(gameFromUrl.pgn, orientation, gameFromUrl.eval);
    } else {
      loadSharedGame();
    }

    return () => controller.abort();
  }, [
    gameFromUrl,
    lichessGameId,
    chessComUsername,
    chessComGameId,
    pgnParam,
    orientationParam,
    resetAndSetGamePgn,
  ]);

  const isGameLoaded =
    gameFromUrl !== undefined ||
    (!!game.getHeaders().White && game.getHeaders().White !== "?") ||
    game.history().length > 0;

  return (
    <>
      <Snackbar open={isLoadingSharedGame && !loadError}>
        <Alert severity="info" variant="filled" sx={{ width: "100%" }}>
          Loading shared game...
        </Alert>
      </Snackbar>

      <Snackbar open={!!loadError}>
        <Alert
          onClose={() => setLoadError("")}
          severity="error"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {loadError}
        </Alert>
      </Snackbar>

      {!evaluationProgress && (
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
            resetAndSetGamePgn(game.pgn());
          }}
        />
      )}
    </>
  );
}
