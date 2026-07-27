import React from "react";
import { findCountryProfileByCode } from "@/domain/map/countries";
import { Trophy, Globe, Map, Sparkles } from "lucide-react";
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
  rankings?: { id: string; score: number; rank: number }[];
}

export function BottomHud({
  hoveredCountry,
  playerNationId,
  rankings = [],
}: BottomHudProps) {
  const profile = hoveredCountry
    ? findCountryProfileByCode(hoveredCountry.code)
    : null;

  const isPlayer = playerNationId && hoveredCountry?.code === playerNationId;
  const isColony = hoveredCountry
    ? hoveredCountry.id >= 40 && hoveredCountry.id !== 118
    : false;

  const countryRank = hoveredCountry
    ? rankings.find((r) => r.id === hoveredCountry.code)?.rank || 12
    : null;

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-sm px-4 pointer-events-none">
      <AnimatePresence mode="wait">
        {hoveredCountry && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="pointer-events-auto w-full bg-slate-950/85 backdrop-blur-2xl border border-slate-900 rounded-2xl px-4 py-3 shadow-2xl flex items-center justify-between gap-4 dir-rtl text-right font-sans"
          >
            <div className="flex items-center gap-2.5">
              {profile?.flagCode ? (
                <span className="text-xl">
                  {String.fromCodePoint(
                    ...profile.flagCode
                      .toUpperCase()
                      .split("")
                      .map((char) => 127397 + char.charCodeAt(0)),
                  )}
                </span>
              ) : (
                <Globe className="text-emerald-500 w-4 h-4" />
              )}
              <div>
                <h3 className="text-xs font-black text-slate-100 flex items-center gap-1.5">
                  <span>{profile?.nameFa || hoveredCountry.name}</span>
                  {isColony ? (
                    <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded-md">
                      (مستعمره شماره {hoveredCountry.id})
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold text-slate-500">
                      ({isPlayer ? "قلمرو خودی" : "مستقل"})
                    </span>
                  )}
                </h3>
                <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-1">
                  <div className="flex items-center gap-1">
                    <Map size={10} />
                    <span>
                      {hoveredCountry.areaSqKm
                        ? `${new Intl.NumberFormat("fa-IR").format(hoveredCountry.areaSqKm)} km²`
                        : "۰ km²"}
                    </span>
                  </div>
                  {countryRank && (
                    <div className="flex items-center gap-1 text-amber-500/80">
                      <Trophy size={10} />
                      <span>
                        رتبه{" "}
                        {new Intl.NumberFormat("fa-IR").format(countryRank)}{" "}
                        جهان
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {profile?.traits?.includes("INDUSTRIAL_HUB") && (
              <div className="bg-slate-900/60 p-1.5 rounded-xl border border-slate-850">
                <Sparkles size={11} className="text-emerald-400" />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
