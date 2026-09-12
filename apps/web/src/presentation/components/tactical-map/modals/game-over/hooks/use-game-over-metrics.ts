import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { GameState } from "@/domain/game/game-state.schema";
import {
  getNationGdp,
  CountryRegistry,
  NationGettersUtility,
  VICTORY_CONFIG,
} from "@geopolitics/domain";
import { useLocaleFormatter } from "@/presentation/hooks/common/use-locale-formatter";
import { NationPresenter } from "@/presentation/presenters/nation.presenter";

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
  const { formatCurrency, formatPopulation, formatNumber, toDigits, locale } =
    useLocaleFormatter();

  return useMemo(() => {
    if (!gameState || !gameState.isGameOver) {
      return null;
    }

    const humanCanonical = CountryRegistry.resolveCanonicalId(
      gameState.humanNationId,
    );
    const humanNation =
      gameState.nations[humanCanonical] ||
      gameState.nations[gameState.humanNationId];

    const pixelCount = humanNation
      ? NationGettersUtility.getTerritoryPixelCount(
          humanNation.id,
          gameState.provinces,
        )
      : 0;

    const rawReason = gameState.gameOverReason || "";
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
          CountryRegistry.resolveCanonicalId(n.id) !== humanCanonical,
      )
      .sort((a, b) => {
        const gdpA = getNationGdp(a, gameState.provinces);
        const gdpB = getNationGdp(b, gameState.provinces);
        return gdpB - gdpA;
      })[0];

    const effectiveWinnerNation = isPlayerDefeated
      ? winnerCanonical && winnerCanonical !== humanCanonical
        ? gameState.nations[winnerCanonical] || leadingAliveNation
        : leadingAliveNation
      : winnerCanonical
        ? gameState.nations[winnerCanonical] || null
        : null;

    const isVictory =
      !isPlayerDefeated &&
      !!effectiveWinnerNation &&
      CountryRegistry.resolveCanonicalId(effectiveWinnerNation.id) ===
        humanCanonical;

    const winnerDisplayName = effectiveWinnerNation
      ? NationPresenter.formatName(effectiveWinnerNation, locale)
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

    let reasonTitle = t("reasons.defaultTitle");
    let reasonDescription = "";

    if (isVictory) {
      if (rawReason === "ECONOMIC_DOMINANCE") {
        reasonTitle = t("reasons.victory.ECONOMIC_DOMINANCE.title");
        reasonDescription = t(
          "reasons.victory.ECONOMIC_DOMINANCE.description",
          {
            name: winnerDisplayName,
            targetPct: targetPctText,
          },
        );
      } else if (rawReason === "TERRITORIAL_DOMINANCE") {
        reasonTitle = t("reasons.victory.TERRITORIAL_DOMINANCE.title");
        reasonDescription = t(
          "reasons.victory.TERRITORIAL_DOMINANCE.description",
          {
            name: winnerDisplayName,
            targetPct: targetPctText,
          },
        );
      } else if (rawReason === "WORLD_CONQUEST") {
        reasonTitle = t("reasons.victory.WORLD_CONQUEST.title");
        reasonDescription = t("reasons.victory.WORLD_CONQUEST.description", {
          name: winnerDisplayName,
        });
      } else {
        reasonTitle = t("reasons.victory.GENERIC.title");
        reasonDescription = t("reasons.victory.GENERIC.description", {
          name: winnerDisplayName,
        });
      }
    } else {
      if (isPlayerDefeated) {
        reasonTitle = t("reasons.defeat.PLAYER_DEFEATED.title");
        reasonDescription = t("reasons.defeat.PLAYER_DEFEATED.description");
      } else if (rawReason === "ECONOMIC_DOMINANCE") {
        reasonTitle = t("reasons.defeat.ECONOMIC_DOMINANCE.title");
        reasonDescription = t("reasons.defeat.ECONOMIC_DOMINANCE.description", {
          name: winnerDisplayName,
          targetPct: targetPctText,
        });
      } else if (rawReason === "TERRITORIAL_DOMINANCE") {
        reasonTitle = t("reasons.defeat.TERRITORIAL_DOMINANCE.title");
        reasonDescription = t(
          "reasons.defeat.TERRITORIAL_DOMINANCE.description",
          {
            name: winnerDisplayName,
            targetPct: targetPctText,
          },
        );
      } else if (rawReason === "WORLD_CONQUEST") {
        reasonTitle = t("reasons.defeat.WORLD_CONQUEST.title");
        reasonDescription = t("reasons.defeat.WORLD_CONQUEST.description", {
          name: winnerDisplayName,
        });
      } else {
        reasonTitle = t("reasons.defeat.GENERIC.title");
        reasonDescription = t("reasons.defeat.GENERIC.description", {
          name: winnerDisplayName,
        });
      }
    }

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
    locale,
  ]);
}
