import React from "react";
import { Nation } from "@/domain/nation/nation.schema";
import { Coins, Heart, Users, Fuel } from "lucide-react";

interface AssetRibbonProps {
  nation: Nation | null;
}

export function AssetRibbon({ nation }: AssetRibbonProps) {
  if (!nation) return null;

  return (
    <div className="absolute top-6 left-6 z-40 max-w-sm pointer-events-none">
      <div className="pointer-events-auto bg-slate-950/80 backdrop-blur-xl border border-slate-900 rounded-3xl p-4 shadow-2xl flex flex-col gap-3.5 dir-rtl text-right font-sans">
        <div className="flex items-center gap-3 border-b border-slate-900 pb-3">
          <span className="text-xl">
            {String.fromCodePoint(
              ...nation.flagCode
                .toUpperCase()
                .split("")
                .map((char) => 127397 + char.charCodeAt(0)),
            )}
          </span>
          <div>
            <h2 className="text-xs font-black text-slate-100">{nation.name}</h2>
            <p className="text-[9px] text-slate-500 font-mono tracking-wider mt-0.5">
              رژیم سیاسی:{" "}
              {nation.government.type === "DEMOCRACY"
                ? "دموکراسی مستقل"
                : "دیکتاتوری اقتدارگرا"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-950/40 border border-slate-900 p-2.5 rounded-2xl flex items-center gap-2.5">
            <Coins size={14} className="text-amber-500/80" />
            <div>
              <span className="text-[9px] text-slate-500 block font-bold">
                بودجه خزانه‌داری
              </span>
              <span className="text-xs font-bold text-slate-200 font-mono">
                {new Intl.NumberFormat("fa-IR").format(nation.treasury)} $
              </span>
            </div>
          </div>

          <div className="bg-slate-950/40 border border-slate-900 p-2.5 rounded-2xl flex items-center gap-2.5">
            <Heart size={14} className="text-rose-500/80" />
            <div>
              <span className="text-[9px] text-slate-500 block font-bold">
                ثبات ملی و اجتماعی
              </span>
              <span className="text-xs font-bold text-slate-200 font-mono">
                {new Intl.NumberFormat("fa-IR").format(
                  nation.government.stability,
                )}
                ٪
              </span>
            </div>
          </div>

          <div className="bg-slate-950/40 border border-slate-900 p-2.5 rounded-2xl flex items-center gap-2.5">
            <Users size={14} className="text-sky-500/80" />
            <div>
              <span className="text-[9px] text-slate-500 block font-bold">
                نیروی انسانی آماده
              </span>
              <span className="text-xs font-bold text-slate-200 font-mono">
                {new Intl.NumberFormat("fa-IR").format(
                  nation.resources.manpower,
                )}{" "}
                نفر
              </span>
            </div>
          </div>

          <div className="bg-slate-950/40 border border-slate-900 p-2.5 rounded-2xl flex items-center gap-2.5">
            <Fuel size={14} className="text-emerald-500/80" />
            <div>
              <span className="text-[9px] text-slate-500 block font-bold">
                ذخایر انرژی (نفت)
              </span>
              <span className="text-xs font-bold text-slate-200 font-mono">
                {new Intl.NumberFormat("fa-IR").format(nation.resources.oil)}{" "}
                بشکه
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
