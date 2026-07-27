import React, { useState } from "react";
import { X, Calendar, Clock, ChevronLeft } from "lucide-react";

interface FakeSave {
  id: string;
  title: string;
  date: string;
  playtime: string;
  turn: number;
}

interface LoadCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSave: (saveId: string) => void;
}

const FAKE_SAVES: FakeSave[] = [
  {
    id: "save-1",
    title: "بازی ذخیره‌شده ۱ - حاکمیت ایران (IRN)",
    date: "۶ مرداد ۱۴۰۵ - ۱۵:۴۲",
    playtime: "۶ ساعت و ۱۲ دقیقه",
    turn: 42,
  },
  {
    id: "save-2",
    title: "بازی ذخیره‌شده ۲ - حاکمیت ایالات متحده (USA)",
    date: "۴ مرداد ۱۴۰۵ - ۱۱:۲۰",
    playtime: "۳ ساعت و ۴۵ دقیقه",
    turn: 19,
  },
  {
    id: "save-3",
    title: "بازی ذخیره‌شده ۳ - حاکمیت آلمان (DEU)",
    date: "۲۸ تیر ۱۴۰۵ - ۲۲:۰۵",
    playtime: "۱۲ ساعت و ۳۰ دقیقه",
    turn: 89,
  },
];

export function LoadCampaignModal({
  isOpen,
  onClose,
  onSelectSave,
}: LoadCampaignModalProps) {
  const [loadingSaveId, setLoadingSaveId] = useState<string | null>(null);
  const [loadingStep, setLoadingSaveStep] = useState<string>("");

  const handleSelect = (saveId: string) => {
    setLoadingSaveId(saveId);
    setLoadingSaveStep("در حال بازخوانی پرونده بازی...");

    setTimeout(() => {
      setLoadingSaveStep("همگام‌سازی اطلاعات نقشه...");
    }, 800);

    setTimeout(() => {
      setLoadingSaveStep("بارگذاری نهایی شبکه لوجستیک و مالی...");
    }, 1600);

    setTimeout(() => {
      onSelectSave(saveId);
    }, 2400);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/60 backdrop-blur-lg flex items-center justify-center p-4 z-50">
      <div className="bg-card border border-border w-full max-w-lg rounded-3xl p-6 shadow-2xl relative">
        {loadingSaveId ? (
          <div className="py-12 flex flex-col items-center justify-center gap-6 text-center">
            <div className="w-10 h-10 border-4 border-gdp border-t-transparent rounded-full animate-spin" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-foreground">{loadingStep}</p>
              <p className="text-[10px] text-muted-foreground font-mono">
                SYS_LOADER: ACTIVE | DATA_SYNC
              </p>
            </div>
          </div>
        ) : (
          <>
            <button
              onClick={onClose}
              className="absolute top-4 left-4 p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="space-y-1 mb-6 text-right">
              <span className="text-[10px] font-bold text-gdp uppercase tracking-widest">
                پایگاه داده اسناد بازی
              </span>
              <h3 className="text-lg font-bold text-foreground">
                بارگذاری بازی‌های ذخیره‌شده
              </h3>
              <p className="text-xs text-muted-foreground">
                یکی از بازی‌های ذخیره‌شده زیر را برای بازیابی اطلاعات نقشه و
                موقعیت استراتژیک حاکمیت خود انتخاب کنید.
              </p>
            </div>

            <div className="space-y-3">
              {FAKE_SAVES.map((save) => (
                <button
                  key={save.id}
                  onClick={() => handleSelect(save.id)}
                  className="w-full bg-background/50 hover:bg-secondary/40 border border-border/80 hover:border-primary/40 p-4 rounded-2xl text-right transition-all flex items-center justify-between gap-4 group cursor-pointer"
                >
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-foreground block">
                      {save.title}
                    </span>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar size={11} />
                        <span>{save.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={11} />
                        <span>زمان: {save.playtime}</span>
                      </div>
                      <div className="font-mono bg-secondary/80 px-1.5 py-0.5 rounded text-[9px]">
                        نوبت: {save.turn}
                      </div>
                    </div>
                  </div>
                  <ChevronLeft
                    size={14}
                    className="text-muted-foreground group-hover:translate-x-[-2px] transition-transform shrink-0"
                  />
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
