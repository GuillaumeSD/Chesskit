import LoadGameButton from "../../loadGame/loadGameButton";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { decodePgnParam, encodePgnParam } from "@/lib/shareLink";
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

  // Params this component wrote itself, so the loading effect can tell them
  // apart from a link the user actually opened.
  const publishedPgnParamRef = useRef<string | undefined>(undefined);

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
    pgn: pgnParam,
    orientation: orientationParam,
  } = router.query;

  const hasLichessParam = typeof lichessGameId === "string" && !!lichessGameId;
  const hasPgnParam = typeof pgnParam === "string" && !!pgnParam;

  useEffect(() => {
    const controller = new AbortController();
    const isWhiteOrientation = orientationParam !== "black";

    const loadSharedGame = async () => {
      setIsLoadingSharedGame(true);
      setLoadError("");

      try {
        if (hasPgnParam) {
          const pgn = await decodePgnParam(pgnParam);
          if (controller.signal.aborted) return;
          if (!pgn) throw new Error("This shared link is invalid or corrupted");
          resetAndSetGamePgn(pgn, isWhiteOrientation);
          return;
        }

        if (hasLichessParam) {
          const res = await fetchLichessGame(lichessGameId, controller.signal);
          if (controller.signal.aborted) return;
          if (typeof res !== "string") {
            throw new Error(`Unable to load Lichess game ${lichessGameId}`);
          }
          resetAndSetGamePgn(res, isWhiteOrientation);
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
    } else if (
      // Skip a pgn param this component published itself: the board already
      // holds that game, and reloading it would fight with the user.
      !(hasPgnParam && pgnParam === publishedPgnParamRef.current) &&
      (hasPgnParam || hasLichessParam)
    ) {
      loadSharedGame();
    }

    return () => controller.abort();
  }, [
    gameFromUrl,
    hasPgnParam,
    hasLichessParam,
    lichessGameId,
    pgnParam,
    orientationParam,
    resetAndSetGamePgn,
  ]);

  // Keep the address bar carrying the loaded game, so copying the URL shares it.
  // Links that already name a source stay as they are — `?lichessGameId=x` is
  // far nicer to share than a 1.5KB blob, and resolves to the same game.
  useEffect(() => {
    if (joinedGameHistory.length === 0) return;
    if (hasLichessParam) return;

    let cancelled = false;

    encodePgnParam(game.pgn())
      .then((param) => {
        if (cancelled || router.query.pgn === param) return;

        publishedPgnParamRef.current = param;
        router.replace(
          { pathname: router.pathname, query: { ...router.query, pgn: param } },
          undefined,
          { shallow: true, scroll: false }
        );
      })
      .catch((error) => console.error("Unable to publish share link", error));

    return () => {
      cancelled = true;
    };
  }, [game, joinedGameHistory, hasLichessParam, router]);

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
