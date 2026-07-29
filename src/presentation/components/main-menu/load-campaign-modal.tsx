import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { SaveItemCard } from "./save-item-card";
import { useSavedCampaigns } from "./hooks/use-saved-campaigns";

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
  const { saves, loading: isDbLoading } = useSavedCampaigns();

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleSelect = (saveId: string) => {
    setLoadingSaveId(saveId);
    onSelectSave(saveId);
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-background/60 backdrop-blur-lg flex items-center justify-center p-4 z-50 dir-rtl text-right cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-card border border-border w-full max-w-lg rounded-3xl p-6 shadow-2xl relative cursor-default"
      >
        {loadingSaveId ? (
          <div className="py-12 flex flex-col items-center justify-center gap-6 text-center">
            <div className="w-10 h-10 border-4 border-gdp border-t-transparent rounded-full animate-spin" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-foreground">
                در حال بازخوانی اطلاعات کمپین...
              </p>
              <p className="text-[10px] text-muted-foreground font-mono">
                INDEXED_DB: READ_STATE | SYNC_OK
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
              <span className="text-[10px] font-bold text-gdp uppercase tracking-widest font-mono">
                پایگاه داده اسناد بازی
              </span>
              <h3 className="text-lg font-bold text-foreground">
                بارگذاری بازی‌های ذخیره‌شده
              </h3>
              <p className="text-xs text-muted-foreground">
                پرونده‌های ذخیره‌شده حقیقی در مرورگر جهت بازیابی موقعیت
                استراتژیک.
              </p>
            </div>

            {isDbLoading ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                در حال جستجوی ذخیره‌ها در دیتابیس محلی...
              </div>
            ) : saves.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground italic bg-secondary/30 rounded-2xl border border-border/40 p-4">
                هیچ بازی ذخیره‌شده‌ای یافت نشد. یک کمپین جدید شروع کنید.
              </div>
            ) : (
              <div className="space-y-3">
                {saves.map((save) => (
                  <SaveItemCard
                    key={save.id}
                    save={{
                      id: save.id,
                      title: save.title,
                      date: save.date,
                      playtime: "کمپین فعال",
                      turn: save.turn,
                    }}
                    onSelect={handleSelect}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
