import { useAtomValue } from "jotai";
import { gameAtom } from "../states";
import { ToolbarButton } from "@/components/ToolbarButton";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

export const CopyPgnButton = () => {
  const game = useAtomValue(gameAtom);
  const { copy, hasCopied } = useCopyToClipboard();

  return (
    <ToolbarButton
      tooltip={hasCopied ? "PGN copied!" : "Copy PGN"}
      onClick={() => {
        copy(game.pgn());
      }}
      icon={hasCopied ? "ri:clipboard-fill" : "ri:clipboard-line"}
      disabled={game.history().length === 0}
    />
  );
};
