import React from "react";
import {
  Swords,
  CheckCircle2,
  Handshake,
  Globe,
  ShieldCheck,
} from "lucide-react";
import { DiplomaticStance } from "@/domain/diplomacy/diplomacy.schema";

interface TreatyStatusBannerProps {
  stance: DiplomaticStance | string;
  hasSecurityGuarantee?: boolean;
}

export function TreatyStatusBanner({
  stance,
  hasSecurityGuarantee = false,
}: TreatyStatusBannerProps) {
  if (stance === "WAR") {
    return (
      <div className="w-full p-3 rounded-xl bg-rose-600/20 border border-rose-500/40 text-rose-500 flex items-center justify-between text-xs font-bold font-sans">
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

  if (hasSecurityGuarantee) {
    return (
      <div className="w-full p-3 rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 flex items-center justify-between text-xs font-bold font-sans">
        <span className="flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-cyan-400 animate-pulse" />
          پیمان چتر امنیتی و دفاع سرزمینی (فعال)
        </span>
        <span className="text-[9px] font-mono bg-cyan-500/20 px-2 py-0.5 rounded text-cyan-300">
          چتر فعال
        </span>
      </div>
    );
  }

  if (stance === "STRATEGIC_PARTNERSHIP") {
    return (
      <div className="w-full p-3 rounded-xl bg-gdp/15 border border-gdp/40 text-gdp flex items-center justify-between text-xs font-bold font-sans">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 size={14} />
          شراکت استراتژیک و اقتصادی (فعال)
        </span>
        <span className="text-[9px] font-mono bg-gdp/20 px-2 py-0.5 rounded text-gdp">
          وضعیت فعلی
        </span>
      </div>
    );
  }

  if (stance === "NON_AGGRESSION_PACT") {
    return (
      <div className="w-full p-3 rounded-xl bg-treasury/15 border border-treasury/40 text-treasury flex items-center justify-between text-xs font-bold font-sans">
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

  return (
    <div className="w-full p-3 rounded-xl bg-secondary/60 border border-border/60 text-muted-foreground flex items-center justify-between text-xs font-bold font-sans">
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
