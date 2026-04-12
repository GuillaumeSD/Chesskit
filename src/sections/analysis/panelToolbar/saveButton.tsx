import { useGameDatabase } from "@/hooks/useGameDatabase";
import { useAtomValue } from "jotai";
import { useRouter } from "next/router";
import { boardAtom, gameAtom, gameEvalAtom } from "../states";
import { getGameToSave } from "@/lib/chess";
import { ToolbarButton } from "@/components/ToolbarButton";

export default function SaveButton() {
  const game = useAtomValue(gameAtom);
  const board = useAtomValue(boardAtom);
  const gameEval = useAtomValue(gameEvalAtom);
  const { addGame, setGameEval, gameFromUrl } = useGameDatabase();
  const router = useRouter();

  const enableSave =
    !gameFromUrl && (board.history().length || game.history().length);

  const handleSave = async () => {
    if (!enableSave) return;

    const gameToSave = getGameToSave(game, board);

    const gameId = await addGame(gameToSave);
    if (gameEval) {
      await setGameEval(gameId, gameEval);
    }

    router.replace(
      {
        query: { gameId: gameId },
        pathname: router.pathname,
      },
      undefined,
      { shallow: true, scroll: false }
    );
  };

  return (
    <ToolbarButton
      tooltip={gameFromUrl ? "Game saved in database" : "Save game"}
      icon={gameFromUrl ? "ri:folder-check-line" : "ri:save-3-line"}
      onClick={handleSave}
      disabled={!enableSave}
    />
  );
}
