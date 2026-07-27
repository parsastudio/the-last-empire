import React, { useState } from "react";
import {
  findCountryProfileByCode,
  findCountryProfileById,
} from "@/domain/map/countries";
import { Globe, Swords, X } from "lucide-react";
import { motion } from "framer-motion";

interface CommandDrawerProps {
  countryCode: string;
  countryName: string;
  onClose: () => void;
  playerNationId: string | null;
  onRecruit: (
    unitType: "INFANTRY" | "AIR_FORCE" | "DRONE_MISSILE",
    qty: number,
  ) => void;
  onTrade: (resourceType: "oil" | "steel", qty: number) => void;
  onTaxChange: (rate: number) => void;
  onDeclareWar: () => void;
}

export function CommandDrawer({
  countryCode,
  countryName,
  onClose,
  playerNationId,
  onRecruit,
  onTrade,
  onTaxChange,
  onDeclareWar,
}: CommandDrawerProps) {
  const numericId = parseInt(countryCode.replace("NATION_", ""), 10);
  const profile = isNaN(numericId)
    ? findCountryProfileByCode(countryCode)
    : findCountryProfileById(numericId);

  const [activeTab, setActiveTab] = useState<
    "military" | "economy" | "diplomacy"
  >("military");
  const isSelf = playerNationId === countryCode;

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 30, stiffness: 220 }}
      className="absolute top-0 right-0 z-50 h-screen w-96 bg-slate-950/95 backdrop-blur-2xl border-l border-slate-900 shadow-2xl flex flex-col text-right dir-rtl"
    >
      <div className="p-6 border-b border-slate-900 flex items-center justify-between bg-slate-950/50">
        <div className="flex items-center gap-3">
          {profile?.flagCode ? (
            <span className="text-2xl">
              {String.fromCodePoint(
                ...profile.flagCode
                  .toUpperCase()
                  .split("")
                  .map((char) => 127397 + char.charCodeAt(0)),
              )}
            </span>
          ) : (
            <Globe className="text-emerald-500 w-6 h-6" />
          )}
          <div>
            <h2 className="text-sm font-black text-slate-100">
              {profile?.nameFa || countryName}
            </h2>
            <p className="text-[10px] text-slate-500 font-mono tracking-wider mt-0.5">
              {profile?.code || countryCode}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 bg-slate-900/60 border border-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
        >
          <X size={14} />
        </button>
      </div>

      <div className="flex border-b border-slate-900 text-xs font-bold">
        {(["military", "economy", "diplomacy"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-4 text-center border-b-2 transition-all cursor-pointer ${
              activeTab === tab
                ? "border-emerald-500 text-emerald-400 bg-emerald-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            {tab === "military"
              ? "عملیات نظامی"
              : tab === "economy"
                ? "تجارت و توسعه"
                : "روابط بین‌الملل"}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {activeTab === "military" && (
          <div className="space-y-5">
            <h4 className="text-xs font-black text-slate-300">
              سربازگیری و پدافند تاکتیکی
            </h4>
            {isSelf ? (
              <div className="space-y-4">
                <div className="bg-slate-950 p-4 border border-slate-900 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                    <span>پیاده نظام مکانیزه</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      100$ • ۱۰ نیروی انسانی
                    </span>
                  </div>
                  <button
                    onClick={() => onRecruit("INFANTRY", 10)}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-[10px] font-bold rounded-xl transition-all cursor-pointer"
                  >
                    اعزام واحد پیاده نظام (۱۰ واحد)
                  </button>
                </div>

                <div className="bg-slate-950 p-4 border border-slate-900 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                    <span>جنگنده نسل ۵</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      500$ • ۲ فولاد
                    </span>
                  </div>
                  <button
                    onClick={() => onRecruit("AIR_FORCE", 1)}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-[10px] font-bold rounded-xl transition-all cursor-pointer"
                  >
                    تولید جنگنده تاکتیکی (۱ واحد)
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-950 border border-slate-900 rounded-2xl text-center text-xs text-slate-500 italic">
                واحد فرماندهی نظامی فقط برای کنترل قلمرو خودی فعال است.
              </div>
            )}
          </div>
        )}

        {activeTab === "economy" && (
          <div className="space-y-5">
            <h4 className="text-xs font-black text-slate-300">
              بازار جهانی و بورس انرژی
            </h4>
            {isSelf ? (
              <div className="space-y-4">
                <div className="bg-slate-950 p-4 border border-slate-900 rounded-2xl space-y-3">
                  <div className="flex justify-between text-[11px] font-bold text-slate-400">
                    <span>تامین نفت خام</span>
                    <span className="text-[10px] text-slate-500">
                      خرید با نرخ بازار
                    </span>
                  </div>
                  <div className="grid grid-cols-1">
                    <button
                      onClick={() => onTrade("oil", 20)}
                      className="py-2.5 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold rounded-xl transition-all cursor-pointer"
                    >
                      خرید ۲۰ بشکه نفت خام
                    </button>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 border border-slate-900 rounded-2xl space-y-3">
                  <div className="flex justify-between text-[11px] font-bold text-slate-400">
                    <span>سیاست‌گذاری نرخ مالیات</span>
                    <span className="text-[10px] text-slate-500">
                      حفظ تعادل ثبات ملی
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => onTaxChange(10)}
                      className="py-2 bg-slate-900 hover:bg-slate-800 text-[10px] text-slate-300 rounded-lg transition-all cursor-pointer"
                    >
                      ۱۰٪ تهاجمی
                    </button>
                    <button
                      onClick={() => onTaxChange(15)}
                      className="py-2 bg-slate-900 hover:bg-slate-800 text-[10px] text-slate-300 rounded-lg transition-all cursor-pointer"
                    >
                      ۱۵٪ متعادل
                    </button>
                    <button
                      onClick={() => onTaxChange(22)}
                      className="py-2 bg-slate-900 hover:bg-slate-800 text-[10px] text-slate-300 rounded-lg transition-all cursor-pointer"
                    >
                      ۲۲٪ اضطراری
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-950 border border-slate-900 rounded-2xl text-center text-xs text-slate-500 italic">
                رژیم اقتصادی و تجاری فقط بر روی قلمرو خودی قابل تنسیق است.
              </div>
            )}
          </div>
        )}

        {activeTab === "diplomacy" && (
          <div className="space-y-5">
            <h4 className="text-xs font-black text-slate-300">
              حق حاکمیت ملی و بیانیه دیپلماسی
            </h4>
            {!isSelf ? (
              <div className="space-y-4">
                <div className="bg-slate-950 p-4 border border-slate-900 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2">
                    <Swords size={14} className="text-rose-500" />
                    <span className="text-[11px] font-bold text-slate-300">
                      بحران نظامی
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    با صدور بیانیه جنگ علیه دولت{" "}
                    {profile?.nameFa || countryName}، روابط به سرعت تاریک شده و
                    وارد فاز تهاجمی تاکتیکی می‌شوید.
                  </p>
                  <button
                    onClick={onDeclareWar}
                    className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-[10px] font-bold tracking-wider transition-all cursor-pointer border border-rose-500/20"
                  >
                    اعلام جنگ مستقیم
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-950 border border-slate-900 rounded-2xl text-center text-xs text-slate-500 italic">
                شما با خودتان در صلح مطلق هستید.
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
