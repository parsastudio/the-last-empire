import React from "react";
import { findCountryProfileByCode } from "@/domain/map/countries";
import { Shield, Map, Activity, Users, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CountryMapping {
  id: number;
  code: string;
  name: string;
  color: [number, number, number];
  areaSqKm?: number;
}

interface BottomHudProps {
  hoveredCountry: CountryMapping | null;
  playerNationId: string | null;
}

export function BottomHud({ hoveredCountry, playerNationId }: BottomHudProps) {
  const profile = hoveredCountry
    ? findCountryProfileByCode(hoveredCountry.code)
    : null;

  const isPlayer = playerNationId && hoveredCountry?.code === playerNationId;

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-lg px-4 pointer-events-none">
      <AnimatePresence mode="wait">
        {hoveredCountry && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="pointer-events-auto w-full bg-slate-950/80 backdrop-blur-xl border border-slate-900 rounded-3xl p-5 shadow-2xl shadow-black/50 dir-rtl text-right font-sans flex flex-col gap-4"
          >
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <div className="flex items-center gap-3.5">
                {profile?.flagCode ? (
                  <span className="text-2xl shadow-lg">
                    {String.fromCodePoint(
                      ...profile.flagCode
                        .toUpperCase()
                        .split("")
                        .map((char) => 127397 + char.charCodeAt(0)),
                    )}
                  </span>
                ) : (
                  <Globe className="text-emerald-500 w-5 h-5 animate-pulse" />
                )}
                <div>
                  <h3 className="text-sm font-bold text-slate-100 tracking-tight">
                    {profile?.nameFa || hoveredCountry.name}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5 tracking-wider">
                    {hoveredCountry.code} • شناسه بین‌المللی {hoveredCountry.id}
                  </p>
                </div>
              </div>
              <div>
                {isPlayer ? (
                  <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold rounded-full font-mono uppercase tracking-widest">
                    قلمرو شما
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-slate-900/80 border border-slate-800 text-slate-400 text-[9px] font-bold rounded-full font-mono uppercase tracking-widest">
                    دولت مستقل
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-950/50 border border-slate-900 p-3 rounded-2xl flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Map size={11} className="text-slate-400" />
                  <span className="text-[10px] font-bold">وسعت قلمرو</span>
                </div>
                <span className="text-xs font-bold text-slate-200 font-mono mt-1">
                  {hoveredCountry.areaSqKm
                    ? `${new Intl.NumberFormat("fa-IR").format(hoveredCountry.areaSqKm)} کیلومتر مربع`
                    : "محاسبه نشده"}
                </span>
              </div>

              <div className="bg-slate-950/50 border border-slate-900 p-3 rounded-2xl flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Users size={11} className="text-slate-400" />
                  <span className="text-[10px] font-bold">جمعیت تخمینی</span>
                </div>
                <span className="text-xs font-bold text-slate-200 font-mono mt-1">
                  {profile?.population
                    ? `${(profile.population / 1e6).toFixed(1)} میلیون نفر`
                    : "نامشخص"}
                </span>
              </div>

              <div className="bg-slate-950/50 border border-slate-900 p-3 rounded-2xl flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Shield size={11} className="text-slate-400" />
                  <span className="text-[10px] font-bold">دکترین نظامی</span>
                </div>
                <span className="text-xs font-bold text-slate-200 mt-1">
                  {profile?.traits?.includes("MILITARISTIC")
                    ? "میلیتاریستی"
                    : "پدافند غیرعامل"}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
