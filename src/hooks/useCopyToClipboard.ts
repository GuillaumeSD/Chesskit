import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Copies text to the clipboard and reports the success for a short while, so
 * that buttons can acknowledge the copy without any notification system.
 */
export const useCopyToClipboard = (resetDelayMs = 2000) => {
  const [hasCopied, setHasCopied] = useState(false);
  const resetTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  useEffect(() => () => clearTimeout(resetTimeout.current), []);

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
      } catch (error) {
        console.error("Error copying to clipboard:", error);
        return;
      }

      setHasCopied(true);
      clearTimeout(resetTimeout.current);
      resetTimeout.current = setTimeout(
        () => setHasCopied(false),
        resetDelayMs
      );
    },
    [resetDelayMs]
  );

  return { copy, hasCopied };
};
