import { useAtomValue } from "jotai";
import { boardAtom, boardOrientationAtom, gameAtom } from "../states";
import { ToolbarButton } from "@/components/ToolbarButton";
import { getGameToSave } from "@/lib/chess";
import { getGameShareUrl } from "@/lib/shareGame";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

export const ShareGameButton = () => {
  const game = useAtomValue(gameAtom);
  const board = useAtomValue(boardAtom);
  const boardOrientation = useAtomValue(boardOrientationAtom);
  const { copy, hasCopied } = useCopyToClipboard();

  const enableShare = !!(game.history().length || board.history().length);

  return (
    <ToolbarButton
      tooltip={hasCopied ? "Link copied!" : "Copy game link"}
      icon={hasCopied ? "ri:check-line" : "ri:link"}
      onClick={() => {
        const gameToShare = getGameToSave(game, board);
        copy(getGameShareUrl(gameToShare.pgn(), boardOrientation));
      }}
      disabled={!enableShare}
    />
  );
};
