import { Move } from "chess.js";
import { MoveClassification } from "@/types/enums";
import { logErrorToSentry } from "./sentry";

export interface GeminiExplanation {
  explanation: string;
  loading: boolean;
  error?: string;
}

export interface GeminiMoveAnalysisParams {
  fen: string;
  move: Move;
  classification: MoveClassification;
  bestMove?: string;
  bestMoveSan?: string;
}

const getGeminiApiKey = (): string | undefined => {
  if (typeof window !== "undefined") {
    const settings = localStorage.getItem("geminiSettings");
    if (settings) {
      try {
        const parsed = JSON.parse(settings);
        return parsed.apiKey;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        return undefined;
      }
    }
  }
  return undefined;
};

const GEMINI_API_KEY = getGeminiApiKey();
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent";

export const getGeminiMoveExplanation = async (
  params: GeminiMoveAnalysisParams
): Promise<string> => {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error(
        "Gemini API key not found. Please set your API key in the Gemini settings."
      );
    }

    const { fen, move, classification, bestMove, bestMoveSan } = params;

    const prompt = createGeminiPrompt(
      fen,
      move,
      classification,
      bestMove,
      bestMoveSan
    );

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 800,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Gemini API error: ${errorData.error?.message || response.statusText}`
      );
    }

    const data = await response.json();
    const explanation = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!explanation) {
      throw new Error("No explanation returned from Gemini");
    }

    return explanation;
  } catch (error) {
    logErrorToSentry(error);
    throw error;
  }
};

const createGeminiPrompt = (
  fen: string,
  move: Move,
  classification: MoveClassification,
  bestMove?: string,
  bestMoveSan?: string
): string => {
  const moveColor = move.color === "w" ? "White" : "Black";
  const classificationText = getMoveClassificationText(classification);

  let prompt = `You are a helpful chess assistant explaining moves to players.
  
FEN position: ${fen}
Move played: ${move.san} by ${moveColor}
Move classification: ${classification} (${classificationText})
`;

  if (bestMove && bestMoveSan && classification !== MoveClassification.Best) {
    prompt += `Best move was: ${bestMoveSan}\n`;
  }

  prompt += `
Provide a brief, clear explanation (50-100 words) of why this move is ${classificationText}.
Explain in simple terms that a beginner would understand.
If relevant, mention tactical or strategic elements.
${classification === MoveClassification.Best ? "Explain why this was the best move." : ""}
${
  classification === MoveClassification.Blunder ||
  classification === MoveClassification.Mistake
    ? `Explain what problem this move creates and why ${bestMoveSan || "the best move"} would have been better.`
    : ""
}

Format your response as a single paragraph without bullet points or headers.
`;

  return prompt;
};

const getMoveClassificationText = (
  classification: MoveClassification
): string => {
  switch (classification) {
    case MoveClassification.Blunder:
      return "a blunder (very bad move)";
    case MoveClassification.Mistake:
      return "a mistake (bad move)";
    case MoveClassification.Inaccuracy:
      return "an inaccuracy (slightly suboptimal move)";
    case MoveClassification.Okay:
      return "an okay move (reasonable but not optimal)";
    case MoveClassification.Excellent:
      return "an excellent move (very good choice)";
    case MoveClassification.Best:
      return "the best move (optimal choice)";
    case MoveClassification.Forced:
      return "a forced move (only legal option)";
    case MoveClassification.Opening:
      return "a standard opening move";
    case MoveClassification.Perfect:
      return "a perfect move (the only good option)";
    case MoveClassification.Splendid:
      return "a splendid move (brilliant sacrifice)";
    default:
      return classification;
  }
};
