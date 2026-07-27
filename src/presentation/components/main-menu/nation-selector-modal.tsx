import React from "react";
import { X, ChevronLeft } from "lucide-react";

interface Nation {
  id: string;
  name: string;
  code: string;
  power: string;
  desc: string;
}

interface NationSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (nationId: string) => void;
}

const STARTING_NATIONS: Nation[] = [
  {
    id: "IRN",
    name: "ایران",
    code: "IR",
    power: "قدرت نظامی فرامنطقه‌ای",
    desc: "ذخایر سرشار نفت خام، ارتش قدرتمند و موقعیت ژئوپلیتیک استراتژیک در منطقه خاورمیانه.",
  },
  {
    id: "USA",
    name: "ایالات متحده آمریکا",
    code: "US",
    power: "ابر قدرت جهانی",
    desc: "بزرگترین اقتصاد دنیا، فناوری پیشرفته دفاعی و چتر امنیتی جهانی.",
  },
  {
    id: "RUS",
    name: "روسیه",
    code: "RU",
    power: "ابر قدرت نظامی",
    desc: "بزرگترین پهنه سرزمینی جهان، صنایع سنگین جنگ‌افزاری و صادرات گسترده منابع طبیعی.",
  },
  {
    id: "DEU",
    name: "آلمان",
    code: "DE",
    power: "پیشران صنعتی اروپا",
    desc: "صنایع فوق‌پیشرفته، اقتصاد باثبات قاره‌ای و نفوذ عمیق دیپلماتیک در اتحادیه اروپا.",
  },
];

export function NationSelectorModal({
  isOpen,
  onClose,
  onSelect,
}: NationSelectorModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/60 backdrop-blur-lg flex items-center justify-center p-4 z-50">
      <div className="bg-card border border-border w-full max-w-2xl rounded-3xl p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>

        <div className="space-y-1 mb-6 text-right">
          <span className="text-[10px] font-bold text-gdp uppercase tracking-widest">
            تنظیمات اولیه بازی جدید
          </span>
          <h3 className="text-lg font-bold text-foreground">
            انتخاب قدرت حاکمیتی
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            یکی از کشورهای زیر را برای فرماندهی هدایت امپراتوری خود انتخاب کنید.
            هر کشور دارای شرایط اولیه منحصر به فردی است.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {STARTING_NATIONS.map((nation) => (
            <button
              key={nation.id}
              onClick={() => onSelect(nation.id)}
              className="group bg-background/50 hover:bg-secondary/40 border border-border/80 hover:border-primary/40 p-5 rounded-2xl text-right transition-all flex flex-col justify-between h-48 cursor-pointer"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/flags/${nation.code.toLowerCase()}.png`}
                      alt={nation.name}
                      className="w-6 h-4 object-cover rounded shadow-sm border border-border"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                    <span className="text-xs font-bold text-foreground">
                      {nation.name}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono bg-secondary px-2 py-0.5 rounded text-muted-foreground">
                    {nation.id}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-3">
                  {nation.desc}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-border/40 pt-2.5">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] text-muted-foreground">
                    رده توانمندی:
                  </span>
                  <span className="text-[10px] font-bold text-primary">
                    {nation.power}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-gdp group-hover:translate-x-1 transition-transform">
                  <span>انتخاب</span>
                  <ChevronLeft size={12} />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
