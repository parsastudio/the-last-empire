import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Calendar, Clock, Trash2, Check, X } from "lucide-react";
import { useLocaleFormatter } from "@/presentation/hooks/common/use-locale-formatter";
import { TacticalSound } from "@/presentation/utils/tactical-sound";

export interface SaveItemData {
  id: string;
  title: string;
  date: string;
  time: string;
  turn: number;
}

interface SaveItemCardProps {
  save: SaveItemData;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function SaveItemCard({ save, onSelect, onDelete }: SaveItemCardProps) {
  const t = useTranslations("menu.saves");
  const { toDigits } = useLocaleFormatter();
  const [isConfirmingDelete, setIsConfirmingDelete] = useState<boolean>(false);

  const handleCardClick = () => {
    TacticalSound.playUiClick();
    onSelect(save.id);
  };

  const handleStartDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    TacticalSound.playToastAlert("warning");
    setIsConfirmingDelete(true);
  };

  const handleConfirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    TacticalSound.playModalClose();
    onDelete(save.id);
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    TacticalSound.playUiClick();
    setIsConfirmingDelete(false);
  };

  return (
    <div
      onClick={handleCardClick}
      className="w-full bg-background/50 hover:bg-secondary/40 border border-border/80 hover:border-primary/40 p-4 rounded-2xl text-start transition-all flex items-center justify-between gap-4 group cursor-pointer"
    >
      <div className="space-y-2">
        <span className="text-xs font-bold text-foreground block">
          {save.title}
        </span>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1 font-mono">
            <Calendar size={11} className="text-primary" />
            <span>{save.date}</span>
          </div>
          <div className="flex items-center gap-1 font-mono">
            <Clock size={11} className="text-treasury" />
            <span>{save.time}</span>
          </div>
          <div className="font-mono bg-secondary/80 px-2 py-0.5 rounded-md text-[9px] font-bold text-foreground">
            {t("turnPrefix", { turn: toDigits(save.turn) })}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {isConfirmingDelete ? (
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/30 p-1.5 rounded-xl text-[10px] animate-fade-smooth"
          >
            <span className="text-rose-400 font-bold font-sans px-1">
              {t("confirmDelete")}
            </span>
            <button
              type="button"
              onClick={handleConfirmDelete}
              className="p-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-all cursor-pointer flex items-center justify-center"
            >
              <Check size={13} />
            </button>
            <button
              type="button"
              onClick={handleCancelDelete}
              className="p-1 bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground rounded-lg transition-all cursor-pointer flex items-center justify-center"
            >
              <X size={13} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleStartDelete}
            className="p-2 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
            title={t("deleteTitle")}
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>
    </div>
  );
}
