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
  Landmark,
  ShieldAlert,
  Info,
  AlertTriangle,
  Skull,
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

  const categoryMeta = useMemo(() => {
    switch (log.category as TurnLogCategory) {
      case "GLOBAL_WAR":
      case "MILITARY":
        return {
          label: "ستاد کل و نبرد",
          icon: Swords,
          color: "text-military",
          badgeBg: "bg-military/15 text-military border-military/30",
        };
      case "GLOBAL_DIPLOMACY":
      case "DIPLOMACY":
        return {
          label: "روابط بین‌الملل",
          icon: Users,
          color: "text-diplomacy",
          badgeBg: "bg-diplomacy/15 text-diplomacy border-diplomacy/30",
        };
      case "ESPIONAGE":
        return {
          label: "عملیات ویژه و اطلاعات",
          icon: Binary,
          color: "text-treasury",
          badgeBg: "bg-treasury/15 text-treasury border-treasury/30",
        };
      case "GLOBAL_ANNEXATION":
        return {
          label: "فروپاشی و الحاق سرزمینی",
          icon: Skull,
          color: "text-rose-500",
          badgeBg: "bg-rose-500/15 text-rose-500 border-rose-500/40",
        };
      case "DOMESTIC":
      default:
        return {
          label: "امور داخلی و خزانه",
          icon: Landmark,
          color: "text-gdp",
          badgeBg: "bg-gdp/15 text-gdp border-gdp/30",
        };
    }
  }, [log.category]);

  const levelMeta = useMemo(() => {
    switch (log.level as TurnLogLevel) {
      case "COMBAT":
        return {
          icon: Swords,
          border: "border-military/40 hover:border-military/70",
          cardBg: "bg-military/5",
        };
      case "CRITICAL":
        return {
          icon: ShieldAlert,
          border: "border-rose-500/50 hover:border-rose-500/80",
          cardBg: "bg-rose-500/10",
        };
      case "WARNING":
        return {
          icon: AlertTriangle,
          border: "border-treasury/40 hover:border-treasury/70",
          cardBg: "bg-treasury/5",
        };
      case "INFO":
      default:
        return {
          icon: Info,
          border: "border-border/60 hover:border-border",
          cardBg: "bg-secondary/30",
        };
    }
  }, [log.level]);

  const CategoryIcon = categoryMeta.icon;
  const LevelIcon = levelMeta.icon;

  return (
    <div
      className={`p-4 rounded-2xl border ${levelMeta.border} ${levelMeta.cardBg} space-y-2.5 transition-all font-sans text-right dir-rtl shadow-sm`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-background/80 border border-border/60 px-2.5 py-1 rounded-xl font-mono text-xs font-bold text-foreground shadow-inner">
            <LevelIcon size={13} className={categoryMeta.color} />
            <span>نوبت {PersianNumberFormatter.toPersianDigits(log.turn)}</span>
          </div>

          <span
            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-lg border flex items-center gap-1 ${categoryMeta.badgeBg}`}
          >
            <CategoryIcon size={12} />
            <span>{categoryMeta.label}</span>
          </span>
        </div>

        <span className="text-[10px] font-mono text-muted-foreground">
          {new Date(log.timestamp).toLocaleTimeString("fa-IR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-foreground leading-relaxed font-sans font-medium">
          {log.message}
        </p>

        {(sourceName || targetName) && (
          <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[10px]">
            {sourceName && (
              <div className="flex items-center gap-1 bg-background/60 border border-border/50 px-2 py-0.5 rounded-lg text-muted-foreground">
                <span className="text-sm">{sourceFlag}</span>
                <span className="font-bold text-foreground">{sourceName}</span>
              </div>
            )}

            {targetName && (
              <>
                <span className="text-muted-foreground">←</span>
                <div className="flex items-center gap-1 bg-background/60 border border-border/50 px-2 py-0.5 rounded-lg text-muted-foreground">
                  <span className="text-sm">{targetFlag}</span>
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
