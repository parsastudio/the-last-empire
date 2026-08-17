import React from "react";
import { Swords, CheckCircle2, Handshake, Ban, Globe } from "lucide-react";
import { DiplomaticStance } from "@/domain/diplomacy/diplomacy.schema";

interface TreatyStatusBannerProps {
  stance: DiplomaticStance | string;
}

export function TreatyStatusBanner({ stance }: TreatyStatusBannerProps) {
  if (stance === "WAR") {
    return (
      <div className="w-full p-3 rounded-xl bg-rose-600/20 border border-rose-500/40 text-rose-500 flex items-center justify-between text-xs font-bold">
        <span className="flex items-center gap-1.5">
          <Swords size={14} />
          در حال نبرد نظامی فعال (متخاصم)
        </span>
        <span className="text-[9px] font-mono bg-rose-500/20 px-2 py-0.5 rounded text-rose-400">
          وضعیت فعلی
        </span>
      </div>
    );
  }

  if (stance === "ALLIANCE") {
    return (
      <div className="w-full p-3 rounded-xl bg-gdp/15 border border-gdp/40 text-gdp flex items-center justify-between text-xs font-bold">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 size={14} />
          اتحاد نظامی کامل (فعال)
        </span>
        <span className="text-[9px] font-mono bg-gdp/20 px-2 py-0.5 rounded text-gdp">
          وضعیت فعلی
        </span>
      </div>
    );
  }

  if (stance === "NON_AGGRESSION_PACT") {
    return (
      <div className="w-full p-3 rounded-xl bg-treasury/15 border border-treasury/40 text-treasury flex items-center justify-between text-xs font-bold">
        <span className="flex items-center gap-1.5">
          <Handshake size={14} />
          پیمان عدم تخاصم (فعال)
        </span>
        <span className="text-[9px] font-mono bg-treasury/20 px-2 py-0.5 rounded text-treasury">
          وضعیت فعلی
        </span>
      </div>
    );
  }

  if (stance === "SEVERED_RELATIONS") {
    return (
      <div className="w-full p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-between text-xs font-bold">
        <span className="flex items-center gap-1.5">
          <Ban size={14} />
          قطع روابط تجاری و تحریم (فعال)
        </span>
        <span className="text-[9px] font-mono bg-rose-500/20 px-2 py-0.5 rounded text-rose-400">
          وضعیت فعلی
        </span>
      </div>
    );
  }

  return (
    <div className="w-full p-3 rounded-xl bg-secondary/60 border border-border/60 text-muted-foreground flex items-center justify-between text-xs font-bold">
      <span className="flex items-center gap-1.5">
        <Globe size={14} />
        دیپلماسی عادی و بی‌طرف (فعال)
      </span>
      <span className="text-[9px] font-mono bg-background px-2 py-0.5 rounded text-muted-foreground">
        وضعیت فعلی
      </span>
    </div>
  );
}
