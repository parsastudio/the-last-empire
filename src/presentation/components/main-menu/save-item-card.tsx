import React, { useState } from "react";
import { Calendar, Clock, ChevronLeft, Trash2, Check, X } from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

export interface SaveItemData {
  id: string;
  title: string;
  date: string;
  time: string;
  playtime: string;
  turn: number;
}

interface SaveItemCardProps {
  save: SaveItemData;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function SaveItemCard({ save, onSelect, onDelete }: SaveItemCardProps) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState<boolean>(false);

  return (
    <div
      onClick={() => onSelect(save.id)}
      className="w-full bg-background/50 hover:bg-secondary/40 border border-border/80 hover:border-primary/40 p-4 rounded-2xl text-right transition-all flex items-center justify-between gap-4 group cursor-pointer dir-rtl"
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
            نوبت: {PersianNumberFormatter.toPersianDigits(save.turn)}
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
              تایید حذف؟
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(save.id);
              }}
              className="p-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-all cursor-pointer flex items-center justify-center"
              title="تایید حذف"
            >
              <Check size={13} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsConfirmingDelete(false);
              }}
              className="p-1 bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground rounded-lg transition-all cursor-pointer flex items-center justify-center"
              title="انصراف"
            >
              <X size={13} />
            </button>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsConfirmingDelete(true);
              }}
              className="p-2 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
              title="حذف پرونده ذخیره‌شده"
            >
              <Trash2 size={15} />
            </button>
            <ChevronLeft
              size={14}
              className="text-muted-foreground group-hover:-translate-x-0.5 transition-transform shrink-0"
            />
          </>
        )}
      </div>
    </div>
  );
}
