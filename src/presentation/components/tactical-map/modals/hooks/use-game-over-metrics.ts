import { useMemo } from "react";
import { GameState } from "@/domain/game/game-state.schema";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

export function useGameOverMetrics(gameState: GameState | null) {
  return useMemo(() => {
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
      ? PersianNumberFormatter.formatCurrency(humanNation.gdp, true)
      : PersianNumberFormatter.formatCurrency(0, true);

    const finalPopNum = humanNation ? humanNation.population / 1e6 : 0;
    const finalPopulation = `${PersianNumberFormatter.toPersianDigits(finalPopNum.toFixed(1))}M نفر`;

    const areaSqKm = humanNation ? humanNation.geography.territorySize : 0;
    const conqueredArea = `${PersianNumberFormatter.toPersianDigits(areaSqKm.toLocaleString("en-US"))} km²`;

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
      conqueredArea,
      reasonText,
    };
  }, [gameState]);
}
