import { getGameFromFen, getGameFromPgn, setGameHeaders } from "@/lib/chess";
import { playIllegalMoveSound, playSoundFromMove } from "@/lib/sounds";
import { Player } from "@/types/game";
import { Chess, Move, DEFAULT_POSITION } from "chess.js";
import { PrimitiveAtom, useAtom } from "jotai";
import { useCallback } from "react";

export interface resetGameParams {
  fen?: string;
  white?: Player;
  black?: Player;
  noHeaders?: boolean;
}
type GameSource = "fen" | "pgn";

export const useChessActions = (chessAtom: PrimitiveAtom<Chess>) => {
  const [game, setGame] = useAtom(chessAtom);

  const setPgn = useCallback(
    (pgn: string) => {
      const newGame = new Chess();
      newGame.loadPgn(pgn);
      setGame(newGame);
    },
    [setGame]
  );

  const reset = useCallback(
    (params?: resetGameParams) => {
      const newGame = new Chess(params?.fen);
      if (!params?.noHeaders) setGameHeaders(newGame, params);
      setGame(newGame);
    },
    [setGame]
  );

  const copyGame = useCallback(() => {
    const newGame = new Chess();

    if (game.history().length === 0) {
      const pgnSplitted = game.pgn().split("]");
      if (
        ["1-0", "0-1", "1/2-1/2", "*"].includes(
          pgnSplitted.at(-1)?.trim() ?? ""
        )
      ) {
        newGame.loadPgn(pgnSplitted.slice(0, -1).join("]") + "]");
        return newGame;
      }
    }

    newGame.loadPgn(game.pgn());
    return newGame;
  }, [game]);

  const resetToStartingPosition = useCallback(
    (input?: string, source?: GameSource) => {
      let newGame: Chess;

      if (input) {
        if (source === "fen") {
          newGame = getGameFromFen(input);
        } else if (source === "pgn") {
          newGame = getGameFromPgn(input);
        } else {
          newGame = getGameFromPgn(input);
        }
      } else {
        newGame = copyGame();
      }

      const currentHeaders = newGame.getHeaders();
      let fenToLoad = DEFAULT_POSITION;

      if (source === "fen" && input) {
        fenToLoad = input;
      } else if (currentHeaders.FEN) {
        fenToLoad = currentHeaders.FEN;
      }

      newGame.load(fenToLoad, {
        preserveHeaders: true,
      });
      setGame(newGame);
    },
    [copyGame, setGame]
  );

  const playMove = useCallback(
    (params: {
      from: string;
      to: string;
      promotion?: string;
      comment?: string;
    }): Move | null => {
      const newGame = copyGame();

      try {
        const { comment, ...move } = params;
        const result = newGame.move(move);
        if (comment) newGame.setComment(comment);

        setGame(newGame);
        playSoundFromMove(result);
        return result;
      } catch {
        playIllegalMoveSound();
        return null;
      }
    },
    [copyGame, setGame]
  );

  const addMoves = useCallback(
    (moves: string[]) => {
      const newGame = copyGame();

      let lastMove: Move | null = null;
      for (const move of moves) {
        lastMove = newGame.move(move);
      }
      setGame(newGame);
      if (lastMove) playSoundFromMove(lastMove);
    },
    [copyGame, setGame]
  );

  const undoMove = useCallback(() => {
    const newGame = copyGame();
    const move = newGame.undo();
    if (move) playSoundFromMove(move);
    setGame(newGame);
  }, [copyGame, setGame]);

  const goToMove = useCallback(
    (moveIdx: number, fullGame: Chess) => {
      if (moveIdx < 0) return;

      const newGame = new Chess();
      newGame.loadPgn(fullGame.pgn());

      const movesNb = fullGame.history().length;
      if (moveIdx > movesNb) return;

      let lastMove: Move | null = {} as Move;
      for (let i = movesNb; i > moveIdx; i--) {
        lastMove = newGame.undo();
      }

      setGame(newGame);
      playSoundFromMove(lastMove);
    },
    [setGame]
  );

  return {
    setPgn,
    reset,
    playMove,
    undoMove,
    goToMove,
    resetToStartingPosition,
    addMoves,
  };
};
