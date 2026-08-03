import React from "react";
import { DomainEvent } from "@/domain/events/domain-event.schema";
import { EventLoggerUtility } from "@/domain/events/event-logger.utility";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { Eye, FileCode } from "lucide-react";

interface EventCardItemProps {
  event: DomainEvent;
  onInspectDelta: (event: DomainEvent) => void;
}

export function EventCardItem({ event, onInspectDelta }: EventCardItemProps) {
  const title = EventLoggerUtility.getEventTitle(event.type);
  const seqText = PersianNumberFormatter.toPersianDigits(
    event.metadata.sequence,
  );
  const turnText = PersianNumberFormatter.toPersianDigits(event.metadata.turn);
  const patchCountText = PersianNumberFormatter.toPersianDigits(
    event.deltaPatches.length,
  );

  return (
    <div className="bg-background/40 hover:bg-secondary/40 border border-border/60 p-3 rounded-2xl flex items-center justify-between gap-3 text-right transition-all dir-rtl font-sans">
      <div className="space-y-0.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-foreground">{title}</span>
          <span className="text-[9px] font-mono bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">
            #{seqText}
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground font-mono block">
          نوبت: {turnText} | تغییرات دلتا: {patchCountText} مورد
        </span>
      </div>

      <button
        onClick={() => onInspectDelta(event)}
        className="px-2.5 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-xl text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0"
        title="مشاهده جزئیات تغییرات پچ"
      >
        <FileCode size={12} />
        <span>دلتای پچ</span>
      </button>
    </div>
  );
}
