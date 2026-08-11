import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { GameOverModal } from "./game-over-modal";
import { GameState } from "@/domain/game/game-state.schema";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";

interface GameOverDialogWrapperProps {
  gameState: GameState | null;
}

export function GameOverDialogWrapper({
  gameState,
}: GameOverDialogWrapperProps) {
  const router = useRouter();

  const metrics = useMemo(() => {
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
    const finalGdp = humanNation
      ? PersianNumberFormatter.formatCurrency(getNationGdp(humanNation), true)
      : PersianNumberFormatter.formatCurrency(0, true);

    const finalPopNum = humanNation ? humanNation.population / 1e6 : 0;
    const finalPopulation = `${PersianNumberFormatter.toPersianDigits(finalPopNum.toFixed(1))}M نفر`;

    const pixelCount = humanNation
      ? humanNation.geography.territoryPixelCount
      : 0;
    const conqueredPixels = `${PersianNumberFormatter.toPersianDigits(pixelCount.toLocaleString("en-US"))} پیکسل`;

    let reasonText = "پایان چرخه زمانی و استراتژیک کمپین";
    if (isVictory) {
      reasonText = "سلطه کامل اقتصادی و دیپلماتیک بر تمام اقالیم جهان";
    } else if (humanNation && !humanNation.isAlive) {
      reasonText = "فروپاشی کامل ساختار حاکمیتی و انحلال دولت ملی";
    }

    return {
      isVictory,
      winnerName,
      turnsPlayed,
      finalGdp,
      finalPopulation,
      conqueredPixels,
      reasonText,
    };
  }, [gameState]);

  if (!gameState || !gameState.isGameOver || !metrics) {
    return null;
  }

  return (
    <GameOverModal
      isOpen={gameState.isGameOver}
      isVictory={metrics.isVictory}
      winnerName={metrics.winnerName}
      reason={metrics.reasonText}
      turnsPlayed={metrics.turnsPlayed}
      finalGdp={metrics.finalGdp}
      finalPopulation={metrics.finalPopulation}
      conqueredPixels={metrics.conqueredPixels}
      onRestart={() => router.push("/select-nation")}
    />
  );
}
