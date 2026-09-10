import { useMemo } from "react";
import { GameState } from "@/domain/game/game-state.schema";
import {
  PersianNumberFormatter,
  getNationGdp,
  CountryRegistry,
  NationGettersUtility,
  VICTORY_CONFIG,
} from "@geopolitics/domain";

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

    const winnerName = effectiveWinnerNation
      ? effectiveWinnerNation.name
      : isPlayerDefeated
        ? "قدرت‌های رقیب"
        : "قدرت برتر جهانی";
    const winnerCode = effectiveWinnerNation
      ? effectiveWinnerNation.id
      : isPlayerDefeated
        ? "DEFEAT"
        : "WIN";
    const winnerFlagCode = effectiveWinnerNation?.flagCode || winnerCode;

    const turnsPlayed = gameState.currentTurn;
    const finalGdp = humanNation
      ? PersianNumberFormatter.formatCurrency(
          getNationGdp(humanNation, gameState.provinces),
          true,
        )
      : PersianNumberFormatter.formatCurrency(0, true);

    const popCount = humanNation
      ? NationGettersUtility.getPopulation(humanNation.id, gameState.provinces)
      : 0;
    const finalPopNum = popCount / 1e6;
    const finalPopulation = `${PersianNumberFormatter.toPersianDigits(finalPopNum.toFixed(1))}M نفر`;
    const conqueredPixels = `${PersianNumberFormatter.formatNumberWithCommas(pixelCount)} پیکسل`;

    let reasonTitle = "پایان بازی و سرنوشت جهان";
    let reasonDescription = "";

    const targetPctText = PersianNumberFormatter.toPersianDigits(
      VICTORY_CONFIG.TERRITORIAL_DOMINANCE_TARGET_PCT,
    );

    if (isVictory) {
      if (rawReason === "ECONOMIC_DOMINANCE") {
        reasonTitle = "پیروزی مطلق: تسخیر نبض اقتصاد جهان";
        reasonDescription = `امپراتوری ${winnerName} با تصاحب بیش از ${targetPctText}٪ کل ثروت و اقتصاد دنیا، ابرقدرت بلامنازع زمین شد و تمام رقبا را به زانو درآورد.`;
      } else if (rawReason === "TERRITORIAL_DOMINANCE") {
        reasonTitle = "پیروزی نظامی: یکپارچه‌سازی کره زمین با شمشیر و آتش";
        reasonDescription = `ارتش ${winnerName} با فتح بیش از ${targetPctText}٪ وسعت خاک و پیکسل‌های نقشه، جهان را یکپارچه کرد و به پیروزی قاطع رسید.`;
      } else if (rawReason === "WORLD_CONQUEST") {
        reasonTitle = "فتح کامل و تسلیم تمام کشورها";
        reasonDescription = `امپراتوری ${winnerName} تمامی کشورهای رقیب را مغلوب ساخت و تنها حاکمیت باقی‌مانده بر کره زمین شد.`;
      } else {
        reasonTitle = "پیروزی استراتژیک بر جهان";
        reasonDescription = `امپراتوری ${winnerName} تمامی شروط غلبه بر رقبای بین‌المللی را به انجام رساند.`;
      }
    } else {
      if (isPlayerDefeated) {
        reasonTitle = "فروپاشی کامل دولت و شکست حاکمیت";
        reasonDescription = `کشور شما در جریان نبردها تمامی استان‌ها، قلمرو و پایداری حاکمیتی خود را از دست داد و از جغرافیای سیاسی جهان حذف گردید.`;
      } else if (rawReason === "ECONOMIC_DOMINANCE") {
        reasonTitle = "پیروزی رقیب در ماراتن اقتصادی";
        reasonDescription = `کشور ${winnerName} توانست زودتر از سایر قدرت‌ها به بیش از ${targetPctText}٪ ثروت و GDP کل جهان دست یابد و هژمونی اقتصادی را فتح کند.`;
      } else if (rawReason === "TERRITORIAL_DOMINANCE") {
        reasonTitle = "پیروزی رقیب در فتوحات سرزمینی";
        reasonDescription = `کشور ${winnerName} با پیشروی مداوم توانست بیش از ${targetPctText}٪ خاک جهان را تصرف کند و به عنوان امپراتوری برتر برگزیده شود.`;
      } else if (rawReason === "WORLD_CONQUEST") {
        reasonTitle = "پیروزی قاطع قدرت رقیب";
        reasonDescription = `کشور ${winnerName} موفق به برچیدن تمامی رقبا و یکپارچه‌سازی جهان شد.`;
      } else {
        reasonTitle = "پیروزی امپراتوری رقیب";
        reasonDescription = `کشور ${winnerName} توانست امتیازات لازم برای سلطه بر نظم نوین جهانی را زودتر تکمیل نماید.`;
      }
    }

    return {
      isVictory,
      winnerName,
      winnerCode,
      winnerFlagCode,
      reasonTitle,
      reasonDescription,
      turnsPlayed,
      finalGdp,
      finalPopulation,
      conqueredPixels,
    };
  }, [gameState]);
}
