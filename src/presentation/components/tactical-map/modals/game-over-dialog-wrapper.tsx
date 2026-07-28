import React from "react";
import { useRouter } from "next/navigation";
import { GameOverModal } from "./game-over-modal";
import { GameState } from "@/domain/game/game-state.schema";

interface GameOverDialogWrapperProps {
  gameState: GameState | null;
}

export function GameOverDialogWrapper({
  gameState,
}: GameOverDialogWrapperProps) {
  const router = useRouter();

  if (!gameState || !gameState.isGameOver) {
    return null;
  }

  const humanNationId = gameState.humanNationId;
  const humanNation = gameState.nations[humanNationId];
  const isVictory = gameState.winnerNationId === humanNationId;

  const winnerNation = gameState.winnerNationId
    ? gameState.nations[gameState.winnerNationId]
    : null;

  const winnerName = winnerNation ? winnerNation.name : "قدرت برتر";

  const turnsPlayed = gameState.currentTurn;
  const finalGdpNum = humanNation ? humanNation.gdp / 1e9 : 0;
  const finalGdp = `$${finalGdpNum.toFixed(1)} میلیارد`;

  const finalPopNum = humanNation ? humanNation.population / 1e6 : 0;
  const finalPopulation = `${finalPopNum.toFixed(1)}M نفر`;

  const areaSqKm = humanNation ? humanNation.geography.territorySize : 0;
  const conqueredArea = `${areaSqKm.toLocaleString("fa-IR")} km²`;

  let reasonText = "پایان چرخه زمانی و استراتژیک کمپین";
  if (isVictory) {
    reasonText = "سلطه کامل اقتصادی، دیپلماتیک و نظامی بر تمام اقالیم جهان";
  } else if (humanNation && !humanNation.isAlive) {
    reasonText = "فروپاشی کامل ساختار حاکمیتی و اشغال تمام قلمروهای ملی";
  }

  return (
    <GameOverModal
      isOpen={gameState.isGameOver}
      isVictory={isVictory}
      winnerName={winnerName}
      reason={reasonText}
      turnsPlayed={turnsPlayed}
      finalGdp={finalGdp}
      finalPopulation={finalPopulation}
      conqueredArea={conqueredArea}
      onRestart={() => router.push("/select-nation")}
    />
  );
}
