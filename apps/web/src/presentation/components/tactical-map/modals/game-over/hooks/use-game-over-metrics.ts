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

    const winnerProfile = effectiveWinnerNation
      ? CountryRegistry.getCountry(effectiveWinnerNation.id)
      : null;

    const winnerDisplayName = effectiveWinnerNation
      ? locale === "en"
        ? winnerProfile?.nameEn || effectiveWinnerNation.name
        : effectiveWinnerNation.name
      : isPlayerDefeated
        ? locale === "en"
          ? "Rival Superpowers"
          : "قدرت‌های رقیب"
        : locale === "en"
          ? "Supreme Global Power"
          : "قدرت برتر جهانی";

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
    const conqueredPixels = `${formatNumber(pixelCount)} ${locale === "en" ? "pixels" : "پیکسل"}`;

    const targetPctText = toDigits(
      VICTORY_CONFIG.TERRITORIAL_DOMINANCE_TARGET_PCT,
    );

    let reasonTitle =
      locale === "en"
        ? "Game Conclusion & World Order"
        : "پایان بازی و سرنوشت جهان";
    let reasonDescription = "";

    if (isVictory) {
      if (rawReason === "ECONOMIC_DOMINANCE") {
        reasonTitle =
          locale === "en"
            ? "Absolute Victory: Global Economic Dominance"
            : "پیروزی مطلق: تسخیر نبض اقتصاد جهان";
        reasonDescription =
          locale === "en"
            ? `The ${winnerDisplayName} realm captured over ${targetPctText}% of global economic wealth, establishing unquestioned hegemony.`
            : `امپراتوری ${winnerDisplayName} با تصاحب بیش از ${targetPctText}٪ کل ثروت و اقتصاد دنیا، ابرقدرت بلامنازع زمین شد و تمام رقبا را به زانو درآورد.`;
      } else if (rawReason === "TERRITORIAL_DOMINANCE") {
        reasonTitle =
          locale === "en"
            ? "Military Victory: Territorial Unification"
            : "پیروزی نظامی: یکپارچه‌سازی کره زمین با شمشیر و آتش";
        reasonDescription =
          locale === "en"
            ? `Armed forces of ${winnerDisplayName} captured over ${targetPctText}% of global sovereign territory, winning absolute supremacy.`
            : `ارتش ${winnerDisplayName} با فتح بیش از ${targetPctText}٪ وسعت خاک و پیکسل‌های نقشه، جهان را یکپارچه کرد و به پیروزی قاطع رسید.`;
      } else if (rawReason === "WORLD_CONQUEST") {
        reasonTitle =
          locale === "en"
            ? "Total Conquest & Complete Capitulation"
            : "فتح کامل و تسلیم تمام کشورها";
        reasonDescription =
          locale === "en"
            ? `The ${winnerDisplayName} empire eliminated all rival powers, becoming the sole sovereign ruler of Earth.`
            : `امپراتوری ${winnerDisplayName} تمامی کشورهای رقیب را مغلوب ساخت و تنها حاکمیت باقی‌مانده بر کره زمین شد.`;
      } else {
        reasonTitle =
          locale === "en"
            ? "Strategic Triumph over the World"
            : "پیروزی استراتژیک بر جهان";
        reasonDescription =
          locale === "en"
            ? `The realm of ${winnerDisplayName} achieved all international hegemony benchmarks.`
            : `امپراتوری ${winnerDisplayName} تمامی شروط غلبه بر رقبای بین‌المللی را به انجام رساند.`;
      }
    } else {
      if (isPlayerDefeated) {
        reasonTitle =
          locale === "en"
            ? "Total State Collapse & Loss of Sovereignty"
            : "فروپاشی کامل دولت و شکست حاکمیت";
        reasonDescription =
          locale === "en"
            ? "Your realm lost all provinces, military garrisons, and governance authority, falling from the geopolitical map."
            : "کشور شما در جریان نبردها تمامی استان‌ها، قلمرو و پایداری حاکمیتی خود را از دست داد و از جغرافیای سیاسی جهان حذف گردید.";
      } else if (rawReason === "ECONOMIC_DOMINANCE") {
        reasonTitle =
          locale === "en"
            ? "Rival Victory in Economic Marathon"
            : "پیروزی رقیب در ماراتن اقتصادی";
        reasonDescription =
          locale === "en"
            ? `${winnerDisplayName} reached over ${targetPctText}% of global GDP output first, claiming world economic hegemony.`
            : `کشور ${winnerDisplayName} توانست زودتر از سایر قدرت‌ها به بیش از ${targetPctText}٪ ثروت و GDP کل جهان دست یابد و هژمونی اقتصادی را فتح کند.`;
      } else if (rawReason === "TERRITORIAL_DOMINANCE") {
        reasonTitle =
          locale === "en"
            ? "Rival Territorial Conquest Victory"
            : "پیروزی رقیب در فتوحات سرزمینی";
        reasonDescription =
          locale === "en"
            ? `${winnerDisplayName} conquered over ${targetPctText}% of global territory, establishing the supreme imperial realm.`
            : `کشور ${winnerDisplayName} با پیشروی مداوم توانست بیش از ${targetPctText}٪ خاک جهان را تصرف کند و به عنوان امپراتوری برتر برگزیده شود.`;
      } else if (rawReason === "WORLD_CONQUEST") {
        reasonTitle =
          locale === "en"
            ? "Decisive Superpower Conquest"
            : "پیروزی قاطع قدرت رقیب";
        reasonDescription =
          locale === "en"
            ? `${winnerDisplayName} eliminated all opposition and unified the world order.`
            : `کشور ${winnerDisplayName} موفق به برچیدن تمامی رقبا و یکپارچه‌سازی جهان شد.`;
      } else {
        reasonTitle =
          locale === "en" ? "Rival Imperial Triumph" : "پیروزی امپراتوری رقیب";
        reasonDescription =
          locale === "en"
            ? `${winnerDisplayName} fulfilled all conditions for world dominion first.`
            : `کشور ${winnerDisplayName} توانست امتیازات لازم برای سلطه بر نظم نوین جهانی را زودتر تکمیل نماید.`;
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
