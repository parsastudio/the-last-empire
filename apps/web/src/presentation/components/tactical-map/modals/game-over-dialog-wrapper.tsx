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
  const isVictoryDebriefOpen = useUiStore(
    (state) => state.isVictoryDebriefOpen,
  );
  const setIsVictoryDebriefOpen = useUiStore(
    (state) => state.setIsVictoryDebriefOpen,
  );
  const [isDismissed, setIsDismissed] = useState(false);

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

    const winnerCanonical = gameState.winnerNationId
      ? CountryRegistry.resolveCanonicalId(gameState.winnerNationId)
      : null;

    const winnerNation = winnerCanonical
      ? gameState.nations[winnerCanonical] ||
        gameState.nations[gameState.winnerNationId || ""]
      : null;

    const isVictory = !!winnerCanonical && winnerCanonical === humanCanonical;

    const winnerName = winnerNation ? winnerNation.name : "قدرت برتر جهانی";
    const winnerCode = winnerNation ? winnerNation.id : "WIN";
    const winnerFlagCode = winnerNation?.flagCode || winnerCode;

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

    const pixelCount = humanNation
      ? NationGettersUtility.getTerritoryPixelCount(
          humanNation.id,
          gameState.provinces,
        )
      : 0;
    const conqueredPixels = `${PersianNumberFormatter.toPersianDigits(pixelCount.toLocaleString("en-US"))} پیکسل`;

    let reasonTitle = "سلطه و پایان رقابت بین‌المللی";
    let reasonDescription = "";

    const rawReason = gameState.gameOverReason || "";

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
      if (humanNation && !humanNation.isAlive) {
        reasonTitle = "فروپاشی کامل دولت ملی";
        reasonDescription = `کشور شما در جریان نبردها تمامی قلمروها و پایداری حاکمیتی خود را از دست داد و از جغرافیای جهان حذف گردید.`;
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

  const handleContinueSandbox = () => {
    setIsDismissed(true);
    setIsVictoryDebriefOpen(false);
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
      onContinueSandbox={handleContinueSandbox}
      onRestart={() => router.push("/select-nation")}
      onHome={() => router.push("/")}
    />
  );
}
