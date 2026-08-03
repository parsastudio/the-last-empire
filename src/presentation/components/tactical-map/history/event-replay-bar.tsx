import React from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  History,
} from "lucide-react";
import { DomainEvent } from "@/domain/events/domain-event.schema";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface EventReplayBarProps {
  events: DomainEvent[];
  currentSequence: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onJump: (sequence: number) => void;
  onCloseReplay: () => void;
}

export function EventReplayBar({
  events,
  currentSequence,
  isPlaying,
  onTogglePlay,
  onNext,
  onPrev,
  onJump,
  onCloseReplay,
}: EventReplayBarProps) {
  const maxSequence = events.length > 0 ? events.length : 1;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-card/95 backdrop-blur-xl border border-primary/40 px-5 py-2.5 rounded-3xl shadow-2xl flex items-center gap-4 text-foreground dir-rtl font-sans animate-fade-smooth">
      <div className="flex items-center gap-2 border-l border-border/60 pl-3">
        <History size={16} className="text-primary animate-pulse" />
        <span className="text-xs font-bold text-primary">
          بازپخش زنده رویدادها
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onPrev}
          disabled={currentSequence <= 1}
          className="p-1.5 rounded-xl bg-secondary hover:bg-secondary/80 disabled:opacity-30 transition-all cursor-pointer"
          title="رویداد قبلی"
        >
          <SkipForward size={14} />
        </button>

        <button
          onClick={onTogglePlay}
          className="p-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer shadow-md"
          title={isPlaying ? "توقف" : "پخش"}
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
        </button>

        <button
          onClick={onNext}
          disabled={currentSequence >= maxSequence}
          className="p-1.5 rounded-xl bg-secondary hover:bg-secondary/80 disabled:opacity-30 transition-all cursor-pointer"
          title="رویداد بعدی"
        >
          <SkipBack size={14} />
        </button>
      </div>

      <div className="flex items-center gap-2 font-mono text-xs">
        <span className="text-muted-foreground text-[10px]">توالی:</span>
        <span className="font-bold text-gdp">
          {PersianNumberFormatter.toPersianDigits(currentSequence)} /{" "}
          {PersianNumberFormatter.toPersianDigits(maxSequence)}
        </span>
      </div>

      <input
        type="range"
        min="1"
        max={maxSequence}
        value={currentSequence}
        onChange={(e) => onJump(Number(e.target.value))}
        className="w-32 accent-blue-500 cursor-pointer h-1.5 bg-secondary rounded-lg"
      />

      <button
        onClick={onCloseReplay}
        className="p-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground text-xs font-bold transition-all cursor-pointer flex items-center gap-1 border border-border/60"
      >
        <RotateCcw size={13} />
        <span>خروج</span>
      </button>
    </div>
  );
}
