import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { GameState } from "@/domain/game/game-state.schema";
import {
  getNationGdp,
  CountryRegistry,
  NationGettersUtility,
  VICTORY_CONFIG,
  GameStateMetricsUtility,
} from "@geopolitics/domain";
import { useLocaleFormatter } from "@/presentation/hooks/common/use-locale-formatter";

export interface GameOverMetricsResult {
  isVictory: boolean;
  winnerName: string;
  winnerCode: string;
  winnerFlagCode: string;
  reasonTitle: string;
  reasonDescription: string;
  turnsPlayed: number;
  finalGdp: string;
  finalPopulation: string;
  conqueredPixels: string;
}

export function useGameOverMetrics(
  gameState: GameState | null,
): GameOverMetricsResult | null {
  const t = useTranslations("gameOver");
  const {
    formatCurrency,
    formatPopulation,
    formatNumber,
    toDigits,
    formatCountryName,
  } = useLocaleFormatter();

  return useMemo(() => {
    if (!gameState || !gameState.isGameOver) {
      return null;
    }

    const humanNation = NationGettersUtility.resolveNation(
      gameState.humanNationId,
      gameState.nations,
    );

    const pixelCount = humanNation
      ? NationGettersUtility.getTerritoryPixelCount(
          humanNation.id,
          gameState.provinces,
        )
      : 0;

    const rawReason = gameState.gameOverReason || "GENERIC";
    const isPlayerDefeated =
      !humanNation ||
      !humanNation.isAlive ||
      pixelCount === 0 ||
      rawReason === "HUMAN_PLAYER_DEFEATED";

    const winnerCanonical = gameState.winnerNationId
      ? CountryRegistry.resolveCanonicalId(gameState.winnerNationId)
      : null;

    const leadingAliveNation = Object.values(gameState.nations)
      .filter(
        (n) =>
          n.isAlive &&
          !GameStateMetricsUtility.isHumanNation(gameState.humanNationId, n.id),
      )
      .sort((a, b) => {
        const gdpA = getNationGdp(a, gameState.provinces);
        const gdpB = getNationGdp(b, gameState.provinces);
        return gdpB - gdpA;
      })[0];

    const effectiveWinnerNation = isPlayerDefeated
      ? winnerCanonical &&
        !GameStateMetricsUtility.isHumanNation(
          gameState.humanNationId,
          winnerCanonical,
        )
        ? NationGettersUtility.resolveNation(
            winnerCanonical,
            gameState.nations,
          ) || leadingAliveNation
        : leadingAliveNation
      : winnerCanonical
        ? NationGettersUtility.resolveNation(winnerCanonical, gameState.nations)
        : null;

    const isVictory =
      !isPlayerDefeated &&
      !!effectiveWinnerNation &&
      GameStateMetricsUtility.isHumanNation(
        gameState.humanNationId,
        effectiveWinnerNation.id,
      );

    const winnerDisplayName = effectiveWinnerNation
      ? formatCountryName(effectiveWinnerNation)
      : isPlayerDefeated
        ? t("reasons.fallbacks.rivalSuperpowers")
        : t("reasons.fallbacks.supremeGlobalPower");

    const winnerCode = effectiveWinnerNation
      ? effectiveWinnerNation.id
      : isPlayerDefeated
        ? "DEFEAT"
        : "WIN";
    const winnerFlagCode = effectiveWinnerNation?.flagCode || winnerCode;

    const turnsPlayed = gameState.currentTurn;
    const finalGdp = humanNation
      ? formatCurrency(getNationGdp(humanNation, gameState.provinces), true)
      : formatCurrency(0, true);

    const popCount = humanNation
      ? NationGettersUtility.getPopulation(humanNation.id, gameState.provinces)
      : 0;
    const finalPopulation = formatPopulation(popCount);
    const conqueredPixels = t("stats.pixelsUnit", {
      count: formatNumber(pixelCount),
    });

    const targetPctText = toDigits(
      VICTORY_CONFIG.TERRITORIAL_DOMINANCE_TARGET_PCT,
    );

    const outcomeCategory = isVictory ? "victory" : "defeat";
    const resolvedReasonKey =
      rawReason === "HUMAN_PLAYER_DEFEATED" ? "PLAYER_DEFEATED" : rawReason;

    const titlePath = `reasons.${outcomeCategory}.${resolvedReasonKey}.title`;
    const descPath = `reasons.${outcomeCategory}.${resolvedReasonKey}.description`;

    const reasonTitle = t.has(titlePath)
      ? t(titlePath as Parameters<typeof t>[0])
      : t("reasons.defaultTitle");

    const reasonDescription = t.has(descPath)
      ? t(descPath as Parameters<typeof t>[0], {
          name: winnerDisplayName,
          targetPct: targetPctText,
        })
      : "";

    return {
      isVictory,
      winnerName: winnerDisplayName,
      winnerCode,
      winnerFlagCode,
      reasonTitle,
      reasonDescription,
      turnsPlayed,
      finalGdp,
      finalPopulation,
      conqueredPixels,
    };
  }, [
    gameState,
    t,
    formatCurrency,
    formatPopulation,
    formatNumber,
    toDigits,
    formatCountryName,
  ]);
}
