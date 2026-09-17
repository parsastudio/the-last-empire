import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useSavedCampaigns } from "./hooks/use-saved-campaigns";
import { UnifiedModalShell } from "@/presentation/components/common/unified-modal-shell";
import { SaveItemCard } from "./components/save-item-card";

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
  const t = useTranslations("menu.saves");
  const [loadingSaveId, setLoadingSaveId] = useState<string | null>(null);
  const { saves, loading: isDbLoading, deleteSave } = useSavedCampaigns();

  const handleSelect = (saveId: string) => {
    setLoadingSaveId(saveId);
    onSelectSave(saveId);
  };

  const handleDelete = async (saveId: string) => {
    await deleteSave(saveId);
  };

  if (!isOpen) return null;

  return (
    <UnifiedModalShell
      isOpen={isOpen}
      title={t("modalTitle")}
      subtitle={t("modalSubtitle")}
      maxWidthClass="max-w-lg"
      onClose={onClose}
    >
      <div className="space-y-4 text-start font-sans">
        {loadingSaveId ? (
          <div className="py-12 flex flex-col items-center justify-center gap-6 text-center">
            <div className="w-10 h-10 border-4 border-gdp border-t-transparent rounded-full animate-spin" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-foreground">
                {t("loading")}
              </p>
              <p className="text-[10px] text-muted-foreground font-mono">
                INDEXED_DB: READ_STATE | SYNC_OK
              </p>
            </div>
          </div>
        ) : isDbLoading ? (
          <div className="py-12 text-center text-xs text-muted-foreground">
            {t("searching")}
          </div>
        ) : saves.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground italic bg-secondary/30 rounded-2xl border border-border/40 p-4">
            {t("empty")}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pe-1 space-y-3 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
            {saves.map((save) => (
              <SaveItemCard
                key={save.id}
                save={{
                  id: save.id,
                  title: save.title,
                  date: save.date,
                  time: save.time,
                  turn: save.turn,
                }}
                onSelect={handleSelect}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </UnifiedModalShell>
  );
}
