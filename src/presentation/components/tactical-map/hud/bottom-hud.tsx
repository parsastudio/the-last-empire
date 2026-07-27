import React from "react";
import {
  findCountryProfileByCode,
  findCountryProfileById,
} from "@/domain/map/countries";
import {
  Trophy,
  Globe,
  Map,
  Sparkles,
  Swords,
  ShieldAlert,
  Settings,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CountryMapping {
  id: number;
  code: string;
  name: string;
  color: [number, number, number];
  areaSqKm?: number;
  enclaveId?: number;
}

interface BottomHudProps {
  hoveredCountry: CountryMapping | null;
  playerNationId: string | null;
  rankings?: { id: string; score: number; rank: number }[];
  onAttack?: () => void;
  onDeclareWar?: () => void;
  onManage?: () => void;
}

export function BottomHud({
  hoveredCountry,
  playerNationId,
  rankings = [],
  onAttack,
  onDeclareWar,
  onManage,
}: BottomHudProps) {
  const profile = hoveredCountry
    ? findCountryProfileByCode(hoveredCountry.code)
    : null;

  const isPlayer =
    playerNationId &&
    hoveredCountry &&
    (playerNationId === hoveredCountry.code ||
      playerNationId === `NATION_${hoveredCountry.id}`);
  const enclaveId = hoveredCountry?.enclaveId || 0;
  const isColony = enclaveId > 0;

  const nationKey = profile ? `NATION_${profile.id}` : null;
  const countryRank = nationKey
    ? rankings.find((r) => r.id === nationKey)?.rank
    : null;

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-4 pointer-events-none">
      <AnimatePresence mode="wait">
        {hoveredCountry && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="pointer-events-auto w-full bg-slate-950/85 backdrop-blur-2xl border border-slate-900 rounded-2xl px-5 py-3.5 shadow-2xl flex items-center justify-between gap-6 dir-rtl text-right font-sans"
          >
            <div className="flex items-center gap-3">
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
                      (مستعمره شماره {enclaveId})
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

            <div className="flex items-center gap-2">
              {!isPlayer && onAttack && (
                <button
                  onClick={onAttack}
                  className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-[10px] font-bold"
                >
                  <Swords size={12} />
                  <span>تهاجم</span>
                </button>
              )}
              {!isPlayer && onDeclareWar && (
                <button
                  onClick={onDeclareWar}
                  className="p-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-[10px] font-bold"
                >
                  <ShieldAlert size={12} />
                  <span>اعلام جنگ</span>
                </button>
              )}
              {onManage && (
                <button
                  onClick={onManage}
                  className="p-2 bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-[10px] font-bold"
                >
                  <Settings size={12} />
                  <span>مدیریت</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
