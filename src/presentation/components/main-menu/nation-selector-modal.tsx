import React, { useState } from "react";
import { X, Search, ChevronLeft, Shield, Globe, Award } from "lucide-react";

interface Nation {
  id: string;
  name: string;
  code: string;
  rank: number;
  power: string;
  gdp: string;
}

interface NationSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (nationId: string) => void;
}

const ALL_NATIONS: Nation[] = [
  {
    id: "USA",
    name: "ایالات متحده آمریکا",
    code: "us",
    rank: 1,
    power: "ابرقدرت جهانی",
    gdp: "۲۶.۸ تریلیون دلار",
  },
  {
    id: "CHN",
    name: "چین",
    code: "cn",
    rank: 2,
    power: "پیشران صنعتی و تجاری",
    gdp: "۱۸.۰ تریلیون دلار",
  },
  {
    id: "RUS",
    name: "روسیه",
    code: "ru",
    rank: 3,
    power: "قطب بزرگ نظامی",
    gdp: "۱.۷ تریلیون دلار",
  },
  {
    id: "IRN",
    name: "ایران",
    code: "ir",
    rank: 14,
    power: "قدرت فرامنطقه‌ای",
    gdp: "۴۵۰ میلیارد دلار",
  },
  {
    id: "DEU",
    name: "آلمان",
    code: "de",
    rank: 4,
    power: "اقتصاد برتر قاره‌ای",
    gdp: "۴.۳ تریلیون دلار",
  },
];

export function NationSelectorModal({
  isOpen,
  onClose,
  onSelect,
}: NationSelectorModalProps) {
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const filteredNations = ALL_NATIONS.filter(
    (n) =>
      n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.id.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="fixed inset-0 bg-background/60 backdrop-blur-lg flex items-center justify-center p-4 z-50">
      <div className="bg-card border border-border w-full max-w-xl rounded-3xl p-6 shadow-2xl relative flex flex-col max-h-[85vh]">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-colors cursor-pointer z-10"
        >
          <X size={16} />
        </button>

        <div className="space-y-1 mb-5 text-right shrink-0">
          <span className="text-[10px] font-bold text-gdp uppercase tracking-widest font-mono">
            گزینش حاکمیت استراتژیک
          </span>
          <h3 className="text-lg font-bold text-foreground">
            انتخاب کشور هدف برای شروع کمپین
          </h3>
          <p className="text-xs text-muted-foreground">
            قدرت حاکمیتی خود را از فهرست زیر انتخاب کنید یا نام کشور مورد نظر را
            جستجو کنید.
          </p>
        </div>

        <div className="relative mb-4 shrink-0">
          <Search
            size={15}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="جستجوی نام کشور یا نماد (مثل ایران، USA)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-border rounded-2xl py-2.5 pr-10 pl-4 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors text-right"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 pl-1 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          {filteredNations.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground italic">
              هیچ کشوری با این مشخصات یافت نشد.
            </div>
          ) : (
            filteredNations.map((nation) => (
              <button
                key={nation.id}
                onClick={() => onSelect(nation.id)}
                className="w-full bg-background/50 hover:bg-secondary/40 border border-border/80 hover:border-primary/40 p-3.5 rounded-2xl transition-all flex items-center justify-between gap-4 group cursor-pointer text-right"
              >
                <div className="flex items-center gap-3.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/flags/${nation.code.toLowerCase()}.png`}
                    alt={nation.name}
                    className="w-8 h-6 object-cover rounded shadow-sm border border-border shrink-0"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                        {nation.name}
                      </span>
                      <span className="text-[9px] font-mono bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">
                        {nation.id}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-mono">
                      <span className="flex items-center gap-1">
                        <Award size={11} className="text-amber-500" />
                        رتبه: {nation.rank}
                      </span>
                      <span className="flex items-center gap-1">
                        <Shield size={11} className="text-military" />
                        {nation.power}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-left hidden sm:block">
                    <span className="text-[9px] text-muted-foreground block font-mono">
                      تولید ناخالص
                    </span>
                    <span className="text-[10px] font-bold font-mono text-gdp">
                      {nation.gdp}
                    </span>
                  </div>
                  <div className="w-7 h-7 rounded-xl bg-secondary/80 flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all shrink-0">
                    <ChevronLeft size={14} />
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
