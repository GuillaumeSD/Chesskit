import { italianGameVariations } from "../data/openings to learn/italian";
import { Box, Typography, Button, Stack } from "@mui/material";
import { useState, useMemo, useEffect } from "react";
import Board from "../components/board";
import { Chess } from "chess.js";
import { atom, useAtom } from "jotai";
import { useChessActions } from "../hooks/useChessActions";
import { Color } from "../types/enums";
import { CurrentPosition } from "../types/eval";
import type { Variation } from "../data/openings to learn/italian";
import OpeningProgress from "../components/OpeningProgress";

// Détermine la couleur d'apprentissage pour la variante (par défaut blanc, mais extensible)
function getLearningColor(variation: Variation): Color {
  // TODO: utiliser variation.color si défini, sinon blanc
  return Color.White;
}

export default function OpeningPage() {
  const [currentVariantIdx, setCurrentVariantIdx] = useState(0);
  const [moveIdx, setMoveIdx] = useState(0);
  const [trainingMode, setTrainingMode] = useState(false);
  const [lastMistake, setLastMistake] = useState<null | { from: string; to: string; type: string }>(null);
  // Atom Jotai pour l'état du jeu
  const [gameAtomInstance] = useState(() => atom(new Chess()));
  const [game, setGame] = useAtom(gameAtomInstance);
  const { undoMove } = useChessActions(gameAtomInstance);

  // Liste des variantes à apprendre (toutes)
  const variations = italianGameVariations;
  const selectedVariation = variations[currentVariantIdx] || null;

  // Couleur d'apprentissage (fixe pour la variante)
  const learningColor = useMemo(() => {
    if (!selectedVariation) return Color.White;
    return getLearningColor(selectedVariation);
  }, [selectedVariation]);

  // Indique si c'est à l'utilisateur de jouer
  const isUserTurn = useMemo(() => {
    if (!selectedVariation) return false;
    // moveIdx % 2 === 0 => blanc, 1 => noir (si la séquence commence par blanc)
    const colorToPlay = moveIdx % 2 === 0 ? Color.White : Color.Black;
    return colorToPlay === learningColor;
  }, [moveIdx, learningColor, selectedVariation]);

  // Génération du coup attendu au format UCI pour la flèche (uniquement si c'est à l'utilisateur de jouer)
  const bestMoveUci = useMemo(() => {
    if (
      selectedVariation &&
      game &&
      moveIdx < selectedVariation.moves.length &&
      isUserTurn
    ) {
      const chess = new Chess(game.fen());
      const san = selectedVariation.moves[moveIdx];
      const moves = chess.moves({ verbose: true });
      const moveObj = moves.find((m) => m.san === san);
      if (moveObj) {
        return moveObj.from + moveObj.to + (moveObj.promotion ? moveObj.promotion : "");
      }
    }
    return undefined;
  }, [selectedVariation, game, moveIdx, isUserTurn]);

  // Atom writable pour currentPosition (lecture/écriture)
  const currentPositionAtom = useMemo(
    () =>
      atom<CurrentPosition>({
        lastEval: bestMoveUci
          ? {
              bestMove: bestMoveUci,
              lines: [
                {
                  pv: [bestMoveUci],
                  depth: 10,
                  multiPv: 1,
                },
              ],
            }
          : { lines: [] },
        eval: {
          moveClassification: undefined,
          lines: [],
        },
      }),
    [bestMoveUci]
  );

  // Réinitialisation à chaque variante ou progression
  useEffect(() => {
    if (!selectedVariation) return;
    try {
      const chess = new Chess();
      for (let i = 0; i < moveIdx; i++) {
        const move = selectedVariation.moves[i];
        const result = chess.move(move);
        if (!result) break; // Stop si coup invalide
      }
      setGame(chess);
    } catch (e) {
      // Gestion d'erreur : on évite le crash
      setGame(new Chess());
    }
  }, [selectedVariation, moveIdx, setGame]);

  // Validation du coup utilisateur : si mauvais coup, undo et annotation
  useEffect(() => {
    if (!selectedVariation || !game) return;
    if (moveIdx >= selectedVariation.moves.length) return;
    if (!isUserTurn) return; // On ne valide que les coups utilisateur
    try {
      const history = game.history({ verbose: true });
      if (history.length !== moveIdx + 1) return;
      const last = history[history.length - 1];
      const expectedMove = new Chess();
      for (let i = 0; i < moveIdx; i++) expectedMove.move(selectedVariation.moves[i]);
      const expected = expectedMove.move(selectedVariation.moves[moveIdx]);
      if (!expected || last.from !== expected.from || last.to !== expected.to) {
        // Mauvais coup : annuler et annoter
        let mistakeType = "Mistake";
        if (last.captured || last.san.includes("#")) mistakeType = "Blunder";
        setLastMistake({ from: last.from, to: last.to, type: mistakeType });
        setTimeout(() => undoMove(), 350);
      } else {
        setLastMistake(null);
        setMoveIdx((idx) => idx + 1);
      }
    } catch (e) {
      // Gestion d'erreur : on évite le crash
      setLastMistake(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.history().length, trainingMode, selectedVariation, isUserTurn]);

  // Avance automatique des coups adverses après un coup utilisateur correct
  useEffect(() => {
    if (!selectedVariation) return;
    if (moveIdx >= selectedVariation.moves.length) return;
    // Si ce n'est pas à l'utilisateur de jouer, on avance automatiquement les coups adverses
    if (!isUserTurn) {
      // On joue tous les coups adverses jusqu'au prochain coup utilisateur ou fin de séquence
      let nextIdx = moveIdx;
      let colorToPlay = nextIdx % 2 === 0 ? Color.White : Color.Black;
      while (nextIdx < selectedVariation.moves.length && colorToPlay !== learningColor) {
        nextIdx++;
        colorToPlay = nextIdx % 2 === 0 ? Color.White : Color.Black;
      }
      if (nextIdx !== moveIdx) {
        // Délai augmenté à 500ms pour laisser le temps à l’animation du coup utilisateur
        setTimeout(() => setMoveIdx(nextIdx), 500);
      }
    }
  }, [moveIdx, isUserTurn, selectedVariation, learningColor]);

  // Enchaînement automatique des variantes
  useEffect(() => {
    if (!selectedVariation) return;
    if (moveIdx >= selectedVariation.moves.length) {
      // Succès : passer à la variante suivante après un court délai
      if (currentVariantIdx < variations.length - 1) {
        setTimeout(() => {
          setCurrentVariantIdx((idx) => idx + 1);
          setMoveIdx(0);
          setLastMistake(null);
        }, 800);
      }
    }
  }, [moveIdx, selectedVariation, currentVariantIdx, variations.length]);

  // Si toutes les variantes sont terminées
  const allDone = currentVariantIdx >= variations.length;

  // Gestion de la progression (persistée par mode)
  const openingKey = "italian";
  const progressMode = trainingMode ? "training" : "learning";
  const progressStorageKey = `${openingKey}-progress-${progressMode}`;
  const [completedVariations, setCompletedVariations] = useState<number[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(progressStorageKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Marquer une variation comme terminée
  useEffect(() => {
    if (!selectedVariation) return;
    if (moveIdx >= selectedVariation.moves.length) {
      if (!completedVariations.includes(currentVariantIdx)) {
        const updated = [...completedVariations, currentVariantIdx];
        setCompletedVariations(updated);
        localStorage.setItem(progressStorageKey, JSON.stringify(updated));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moveIdx, selectedVariation, currentVariantIdx, progressMode]);

  // Réinitialisation de la progression
  const handleResetProgress = () => {
    localStorage.removeItem(progressStorageKey);
    setCompletedVariations([]);
  };

  // Détermination de la case cible du dernier coup joué (pour overlay)
  const lastMoveSquare = useMemo(() => {
    if (!game) return null;
    const history = game.history({ verbose: true });
    if (history.length === 0) return null;
    const last = history[history.length - 1];
    return last.to;
  }, [game]);

  // Détermination du type d’icône à afficher (succès/erreur)
  const trainingFeedback = useMemo(() => {
    if (!trainingMode || !lastMoveSquare) return null;
    // Afficher l'icône uniquement si le dernier coup a été joué par l'humain
    // (c'est-à-dire si ce n'est plus à l'humain de jouer)
    if (isUserTurn) return null;
    if (lastMistake && lastMistake.to === lastMoveSquare) {
      return { icon: "/icons/mistake.png", alt: "Coup incorrect" };
    }
    if (lastMistake === null && game.history().length > 0) {
      // Remplacer l'icône de validation par book.png
      return { icon: "/icons/book.png", alt: "Coup correct" };
    }
    return null;
  }, [trainingMode, lastMistake, lastMoveSquare, game, isUserTurn]);

  // Affichage principal
  return (
    <Box sx={{ flexGrow: 1, width: '100vw', minHeight: '100vh', p: { xs: 1, md: 4 }, boxSizing: 'border-box', bgcolor: 'background.default' }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="stretch" justifyContent="center" sx={{ height: '100%' }}>
        {/* Zone de gauche : contrôles et explications */}
        <Box sx={{ flex: { xs: 'none', md: 1 }, minWidth: { md: 320 }, maxWidth: 420, mb: { xs: 2, md: 0 }, display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Titre de la variante */}
          <Typography variant="h4" gutterBottom sx={{ mb: 2, wordBreak: 'break-word' }}>
            {selectedVariation?.name}
          </Typography>
          {/* Espace aéré avant les boutons */}
          <Box sx={{ flex: 1, mb: 2 }}>
            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
              <Button variant={trainingMode ? "contained" : "outlined"} onClick={() => setTrainingMode(true)}>
                Training Mode
              </Button>
              <Button variant={!trainingMode ? "contained" : "outlined"} onClick={() => setTrainingMode(false)}>
                Learning Mode
              </Button>
            </Stack>
            {moveIdx >= selectedVariation.moves.length ? (
              <Typography color="success.main" sx={{ mb: 2 }}>Variation complete! Next variation loading…</Typography>
            ) : trainingMode ? (
              <Typography color="text.secondary" sx={{ mb: 2 }}>Play the correct move to continue. Mistakes will be marked.</Typography>
            ) : (
              <Typography color="text.secondary" sx={{ mb: 2 }}>Play the move indicated by the arrow to continue.</Typography>
            )}
          </Box>
          {/* Barre de progression en bas à gauche, toujours visible */}
          <Box sx={{ mt: 'auto', width: '100%' }}>
            <OpeningProgress
              total={variations.length}
              openingKey={openingKey}
              mode={progressMode}
              completed={completedVariations}
              onReset={handleResetProgress}
            />
          </Box>
        </Box>
        {/* Zone de droite : échiquier responsive */}
        <Box sx={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 0 }}>
          {selectedVariation && !allDone && game && (
            <Box sx={{ width: '100%', maxWidth: 600, aspectRatio: '1', minWidth: { xs: 260, sm: 340, md: 400 }, mx: 'auto', position: 'relative' }}>
              <Board
                id="LearningBoard"
                canPlay={true}
                gameAtom={gameAtomInstance}
                boardSize={undefined} // Laisse le composant prendre toute la largeur
                whitePlayer={{ name: "White" }}
                blackPlayer={{ name: "Black" }}
                showBestMoveArrow={!trainingMode}
                currentPositionAtom={currentPositionAtom}
                boardOrientation={learningColor}
                // Nouvelle prop pour feedback visuel sur la case
                trainingFeedback={trainingFeedback && lastMoveSquare ? { square: lastMoveSquare, ...trainingFeedback } : undefined}
              />
            </Box>
          )}
        </Box>
      </Stack>
    </Box>
  );
}
