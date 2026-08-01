import React, { useState } from "react";
import { X, Database } from "lucide-react";
import { SaveItemCard } from "./save-item-card";
import { useSavedCampaigns } from "./hooks/use-saved-campaigns";
import { useModalKeyboardShortcut } from "@/presentation/components/common/hooks/use-modal-keyboard-shortcut";

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
  const { saves, loading: isDbLoading, deleteSave } = useSavedCampaigns();

  useModalKeyboardShortcut(isOpen, onClose);

  const handleSelect = (saveId: string) => {
    setLoadingSaveId(saveId);
    onSelectSave(saveId);
  };

  const handleDelete = async (saveId: string) => {
    await deleteSave(saveId);
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-background/60 backdrop-blur-lg flex items-center justify-center p-4 z-50 dir-rtl text-right cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-card border border-border w-full max-w-lg max-h-[85vh] rounded-3xl p-6 shadow-2xl relative cursor-default flex flex-col overflow-hidden"
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
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-border/80 shrink-0">
              <div className="space-y-1 text-right">
                <div className="flex items-center gap-2">
                  <Database size={15} className="text-gdp" />
                  <span className="text-[10px] font-bold text-gdp uppercase tracking-widest font-mono">
                    پایگاه داده اسناد بازی
                  </span>
                </div>
                <h3 className="text-base font-bold text-foreground">
                  بارگذاری بازی‌های ذخیره‌شده
                </h3>
              </div>

              <button
                onClick={onClose}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-colors cursor-pointer shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            {isDbLoading ? (
              <div className="py-12 text-center text-xs text-muted-foreground">
                در حال جستجوی ذخیره‌ها در دیتابیس محلی...
              </div>
            ) : saves.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground italic bg-secondary/30 rounded-2xl border border-border/40 p-4">
                هیچ بازی ذخیره‌شده‌ای یافت نشد. یک کمپین جدید شروع کنید.
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto pr-1 space-y-3 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                {saves.map((save) => (
                  <SaveItemCard
                    key={save.id}
                    save={{
                      id: save.id,
                      title: save.title,
                      date: save.date,
                      time: save.time,
                      playtime: "کمپین فعال",
                      turn: save.turn,
                    }}
                    onSelect={handleSelect}
                    onDelete={handleDelete}
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
