import { useState, useCallback } from "react";
import {
  GeminiExplanation,
  GeminiMoveAnalysisParams,
  getGeminiMoveExplanation,
} from "@/lib/gemini";

export const useGeminiExplanation = () => {
  const [explanations, setExplanations] = useState<
    Record<string, GeminiExplanation>
  >({});

  const getExplanationKey = (params: GeminiMoveAnalysisParams): string => {
    const { fen, move } = params;
    return `${fen}_${move.from}_${move.to}`;
  };

  const getExplanation = useCallback(
    async (params: GeminiMoveAnalysisParams, forceRefresh = false) => {
      const key = getExplanationKey(params);

      if (!forceRefresh && explanations[key] && explanations[key].explanation) {
        return explanations[key].explanation;
      }

      setExplanations((prev) => ({
        ...prev,
        [key]: { loading: true, explanation: prev[key]?.explanation || "" },
      }));

      try {
        const explanation = await getGeminiMoveExplanation(params);

        setExplanations((prev) => ({
          ...prev,
          [key]: { loading: false, explanation },
        }));

        return explanation;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to get explanation";

        setExplanations((prev) => ({
          ...prev,
          [key]: {
            loading: false,
            explanation: prev[key]?.explanation || "",
            error: errorMessage,
          },
        }));

        throw error;
      }
    },
    [explanations]
  );

  const getExplanationState = useCallback(
    (params: GeminiMoveAnalysisParams): GeminiExplanation => {
      const key = getExplanationKey(params);
      return explanations[key] || { loading: false, explanation: "" };
    },
    [explanations]
  );

  const clearExplanations = useCallback(() => {
    setExplanations({});
  }, []);

  return {
    getExplanation,
    getExplanationState,
    clearExplanations,
    explanations,
  };
};

export default useGeminiExplanation;
