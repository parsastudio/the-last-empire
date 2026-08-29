import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { GameOverModal } from "./game-over-modal";
import { GameState } from "@/domain/game/game-state.schema";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";
import { CountryRegistry } from "@/domain/data/countries";
import { NationGettersUtility } from "@geopolitics/domain";
import { useGameStore } from "@/presentation/stores/use-game-store";
import { useUiStore } from "@/presentation/stores/use-ui-store";

interface GameOverDialogWrapperProps {
  gameState: GameState | null;
}

export function GameOverDialogWrapper({
  gameState,
}: GameOverDialogWrapperProps) {
  const router = useRouter();
  const enableSandboxMode = useGameStore((state) => state.enableSandboxMode);
  const activeModal = useUiStore((state) => state.activeModal);
  const closeModal = useUiStore((state) => state.closeModal);
  const [isDismissed, setIsDismissed] = useState(false);

  const isVictoryDebriefOpen = activeModal?.type === "VICTORY_DEBRIEF";

  const metrics = useMemo(() => {
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
    const conqueredPixels = `${PersianNumberFormatter.toPersianDigits(pixelCount.toLocaleString("en-US"))} پیکسل`;

    let reasonTitle = "پایان بازی و سرنوشت جهان";
    let reasonDescription = "";

    if (isVictory) {
      if (rawReason === "ECONOMIC_DOMINANCE") {
        reasonTitle = "هژمونی و سلطه اقتصادی بر جهان";
        reasonDescription = `امپراتوری ${winnerName} با دستیابی به بیش از ۶۵٪ کل تولید ناخالص (GDP) جهان، نبض اقتصاد بین‌الملل را در دست گرفت و پیروز مطلق کمپین شد.`;
      } else if (rawReason === "TERRITORIAL_DOMINANCE") {
        reasonTitle = "سلطه سرزمینی و الحاق قلمروها";
        reasonDescription = `ارتش ${winnerName} با فتح بیش از ۶۵٪ وسعت خاک و پیکسل‌های نقشه، جهان را یکپارچه کرد و به پیروزی قاطع رسید.`;
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
        reasonDescription = `کشور ${winnerName} توانست زودتر از سایر قدرت‌ها به بیش از ۶۵٪ ثروت و GDP کل جهان دست یابد و هژمونی اقتصادی را فتح کند.`;
      } else if (rawReason === "TERRITORIAL_DOMINANCE") {
        reasonTitle = "پیروزی رقیب در فتوحات سرزمینی";
        reasonDescription = `کشور ${winnerName} با پیشروی مداوم توانست بیش از ۶۵٪ خاک جهان را تصرف کند و به عنوان امپراتوری برتر برگزیده شود.`;
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

  if (!gameState || !gameState.isGameOver || !metrics) {
    return null;
  }

  const isModalOpen =
    isVictoryDebriefOpen || (!gameState.isSandboxMode && !isDismissed);

  const handleInspectOrContinue = () => {
    setIsDismissed(true);
    closeModal();
    void enableSandboxMode();
  };

  return (
    <GameOverModal
      isOpen={isModalOpen}
      isVictory={metrics.isVictory}
      winnerName={metrics.winnerName}
      winnerCode={metrics.winnerCode}
      winnerFlagCode={metrics.winnerFlagCode}
      reasonTitle={metrics.reasonTitle}
      reasonDescription={metrics.reasonDescription}
      turnsPlayed={metrics.turnsPlayed}
      finalGdp={metrics.finalGdp}
      finalPopulation={metrics.finalPopulation}
      conqueredPixels={metrics.conqueredPixels}
      onInspectOrContinue={handleInspectOrContinue}
      onRestart={() => router.push("/select-nation")}
      onHome={() => router.push("/")}
    />
  );
}
