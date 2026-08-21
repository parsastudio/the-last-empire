import React, { useMemo } from "react";
import { TurnLogEntry } from "@/domain/game/game-state.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";
import {
  Swords,
  Users,
  Binary,
  Coins,
  Skull,
  Info,
  ArrowLeft,
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

  const style = useMemo(() => {
    const isAnnexation =
      log.category === "GLOBAL_ANNEXATION" ||
      log.message.includes("سقوط") ||
      log.message.includes("انحلال");

    const isWar =
      log.category === "GLOBAL_WAR" ||
      log.category === "MILITARY" ||
      log.level === "COMBAT" ||
      log.level === "CRITICAL" ||
      log.message.includes("اعلان جنگ") ||
      log.message.includes("نبرد") ||
      log.message.includes("تهاجم");

    const isEspionage = log.category === "ESPIONAGE";
    const isMoneyOrAid =
      log.message.includes("کمک مالی") ||
      log.message.includes("خزانه") ||
      log.category === "DOMESTIC";
    const isDiplomacy =
      log.category === "DIPLOMACY" || log.category === "GLOBAL_DIPLOMACY";

    if (isAnnexation) {
      return {
        cardBg: "bg-red-950/20",
        border: "border-red-600/50 hover:border-red-500",
        icon: Skull,
        iconBg: "bg-red-500/20 text-red-400 border-red-500/40",
      };
    }

    if (isWar) {
      return {
        cardBg: "bg-rose-950/20",
        border: "border-rose-500/40 hover:border-rose-500",
        icon: Swords,
        iconBg: "bg-rose-500/20 text-rose-400 border-rose-500/40",
      };
    }

    if (isEspionage) {
      return {
        cardBg: "bg-amber-950/20",
        border: "border-amber-500/40 hover:border-amber-500",
        icon: Binary,
        iconBg: "bg-amber-500/20 text-amber-400 border-amber-500/40",
      };
    }

    if (isMoneyOrAid) {
      return {
        cardBg: "bg-emerald-950/20",
        border: "border-emerald-500/40 hover:border-emerald-500",
        icon: Coins,
        iconBg: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
      };
    }

    if (isDiplomacy) {
      return {
        cardBg: "bg-indigo-950/20",
        border: "border-indigo-500/40 hover:border-indigo-500",
        icon: Users,
        iconBg: "bg-indigo-500/20 text-indigo-400 border-indigo-500/40",
      };
    }

    return {
      cardBg: "bg-secondary/30",
      border: "border-border/60 hover:border-border",
      icon: Info,
      iconBg: "bg-secondary text-muted-foreground border-border/50",
    };
  }, [log]);

  const Icon = style.icon;

  return (
    <div
      className={`p-4 rounded-2xl border ${style.border} ${style.cardBg} flex items-start gap-3.5 transition-all font-sans text-right dir-rtl backdrop-blur-sm shadow-sm hover:shadow-md`}
    >
      <div
        className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 shadow-sm ${style.iconBg}`}
      >
        <Icon size={16} />
      </div>

      <div className="flex-1 space-y-2.5 overflow-hidden">
        <p className="text-xs text-foreground leading-relaxed font-sans font-medium">
          {log.message}
        </p>

        {(sourceName || targetName) && (
          <div className="flex flex-wrap items-center gap-2 pt-0.5 font-mono text-[10px]">
            {sourceName && (
              <div className="flex items-center gap-1.5 bg-background/80 border border-border/60 px-2.5 py-1 rounded-xl text-muted-foreground shadow-sm">
                <span className="text-base select-none">{sourceFlag}</span>
                <span className="font-bold text-foreground">{sourceName}</span>
              </div>
            )}

            {targetName && (
              <>
                <ArrowLeft
                  size={11}
                  className="text-muted-foreground shrink-0"
                />
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
