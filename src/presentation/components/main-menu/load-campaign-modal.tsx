import React, { useState } from "react";
import { X } from "lucide-react";
import { FAKE_SAVES } from "./config/fake-saves.config";
import { SaveItemCard } from "./save-item-card";

interface LoadCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSave: (saveId: string) => void;
}

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
                <SaveItemCard
                  key={save.id}
                  save={save}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
