import React, { useMemo } from "react";
import {
  TurnLogEntry,
  TurnLogCategory,
  TurnLogLevel,
} from "@/domain/game/game-state.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import {
  Swords,
  Users,
  Binary,
  Coins,
  ShieldAlert,
  Info,
  AlertTriangle,
  Skull,
  Flame,
} from "lucide-react";

interface ReportCardProps {
  log: TurnLogEntry;
  nationsMap?: Record<string, Nation>;
}

export function ReportCard({ log, nationsMap }: ReportCardProps) {
  const sourceCanonical = CountryRegistry.resolveCanonicalId(
    log.sourceNationId,
  );
  const sourceNation = nationsMap ? nationsMap[sourceCanonical] : null;
  const sourceName = sourceNation ? sourceNation.name : log.sourceNationId;
  const sourceFlag = getFlagEmoji(sourceNation?.flagCode || sourceCanonical);

  let targetName: string | null = null;
  let targetFlag: string | null = null;

  if (log.targetNationId) {
    const targetCanonical = CountryRegistry.resolveCanonicalId(
      log.targetNationId,
    );
    const targetNation = nationsMap ? nationsMap[targetCanonical] : null;
    targetName = targetNation ? targetNation.name : log.targetNationId;
    targetFlag = getFlagEmoji(targetNation?.flagCode || targetCanonical);
  }

  const visualStyle = useMemo(() => {
    const isWarOrCombat =
      log.category === "GLOBAL_WAR" ||
      log.category === "MILITARY" ||
      log.level === "COMBAT";

    const isAnnexation =
      log.category === "GLOBAL_ANNEXATION" ||
      log.message.includes("سقوط") ||
      log.message.includes("انحلال");

    const isEspionage = log.category === "ESPIONAGE";
    const isDiplomacy =
      log.category === "DIPLOMACY" || log.category === "GLOBAL_DIPLOMACY";
    const isAidOrMoney =
      log.message.includes("کمک مالی") ||
      log.message.includes("خزانه") ||
      log.category === "DOMESTIC";

    if (isAnnexation) {
      return {
        cardBg: "bg-red-950/20",
        border: "border-red-600/60 hover:border-red-500",
        badgeBg: "bg-red-600/20 text-red-300 border-red-500/40",
        label: "سقوط حاکمیت",
        priorityLabel: "رویداد تاریخی و الحاق",
        priorityTagColor: "text-red-400 bg-red-950/60 border-red-800/60",
        icon: Skull,
        accentColor: "text-red-400",
      };
    }

    if (isWarOrCombat || log.level === "CRITICAL") {
      return {
        cardBg: "bg-rose-950/25",
        border: "border-rose-500/50 hover:border-rose-500 shadow-rose-950/20",
        badgeBg: "bg-rose-500/20 text-rose-300 border-rose-500/40",
        label: "نبرد و فرمان آتش",
        priorityLabel: "اولویت ۱: تحولات رزمی جبهه",
        priorityTagColor: "text-rose-400 bg-rose-950/60 border-rose-800/60",
        icon: Swords,
        accentColor: "text-rose-400",
      };
    }

    if (isEspionage) {
      return {
        cardBg: "bg-amber-950/20",
        border:
          "border-amber-500/40 hover:border-amber-500 shadow-amber-950/20",
        badgeBg: "bg-amber-500/20 text-amber-300 border-amber-500/40",
        label: "عملیات ویژه اطلاعاتی",
        priorityLabel: "اولویت ۲: امنیت و سایبر",
        priorityTagColor: "text-amber-400 bg-amber-950/60 border-amber-800/60",
        icon: Binary,
        accentColor: "text-amber-400",
      };
    }

    if (isDiplomacy) {
      return {
        cardBg: "bg-indigo-950/20",
        border:
          "border-indigo-500/40 hover:border-indigo-500 shadow-indigo-950/20",
        badgeBg: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
        label: "دیپلماسی و معاهدات",
        priorityLabel: "اولویت ۳: روابط خارجی",
        priorityTagColor:
          "text-indigo-400 bg-indigo-950/60 border-indigo-800/60",
        icon: Users,
        accentColor: "text-indigo-400",
      };
    }

    if (isAidOrMoney) {
      return {
        cardBg: "bg-emerald-950/20",
        border:
          "border-emerald-500/40 hover:border-emerald-500 shadow-emerald-950/20",
        badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
        label: "امور مالی و خزانه‌داری",
        priorityLabel: "اولویت ۴: مراودات اقتصادی",
        priorityTagColor:
          "text-emerald-400 bg-emerald-950/60 border-emerald-800/60",
        icon: Coins,
        accentColor: "text-emerald-400",
      };
    }

    return {
      cardBg: "bg-secondary/30",
      border: "border-border/60 hover:border-border",
      badgeBg: "bg-secondary text-muted-foreground border-border/50",
      label: "گزارش عادی",
      priorityLabel: "گزارش عمومی",
      priorityTagColor:
        "text-muted-foreground bg-secondary/50 border-border/40",
      icon: Info,
      accentColor: "text-primary",
    };
  }, [log]);

  const Icon = visualStyle.icon;

  return (
    <div
      className={`p-4 rounded-2xl border ${visualStyle.border} ${visualStyle.cardBg} space-y-3 transition-all font-sans text-right dir-rtl shadow-md backdrop-blur-sm`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border/40">
        <div className="flex items-center gap-2">
          <span
            className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-lg border flex items-center gap-1 ${visualStyle.priorityTagColor}`}
          >
            <Flame size={10} />
            <span>{visualStyle.priorityLabel}</span>
          </span>

          <span
            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-lg border flex items-center gap-1.5 ${visualStyle.badgeBg}`}
          >
            <Icon size={12} className={visualStyle.accentColor} />
            <span>{visualStyle.label}</span>
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
          <span className="bg-background/80 border border-border/60 px-2 py-0.5 rounded-md font-bold text-foreground">
            نوبت {PersianNumberFormatter.toPersianDigits(log.turn)}
          </span>
          <span>
            {new Date(log.timestamp).toLocaleTimeString("fa-IR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-foreground leading-relaxed font-sans font-medium">
          {log.message}
        </p>

        {(sourceName || targetName) && (
          <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[10px]">
            {sourceName && (
              <div className="flex items-center gap-1.5 bg-background/80 border border-border/60 px-2.5 py-1 rounded-xl text-muted-foreground shadow-sm">
                <span className="text-base select-none">{sourceFlag}</span>
                <span className="font-bold text-foreground">{sourceName}</span>
              </div>
            )}

            {targetName && (
              <>
                <span className="text-muted-foreground font-bold">←</span>
                <div className="flex items-center gap-1.5 bg-background/80 border border-border/60 px-2.5 py-1 rounded-xl text-muted-foreground shadow-sm">
                  <span className="text-base select-none">{targetFlag}</span>
                  <span className="font-bold text-foreground">
                    {targetName}
                  </span>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
