import React from "react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

export function UnitTechBreakdownBadge({
  breakdown,
}: {
  breakdown: Record<number, number>;
}) {
  const levels = Object.keys(breakdown)
    .map(Number)
    .filter((l) => breakdown[l]! > 0)
    .sort((a, b) => a - b);

  if (levels.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1 pt-1 font-mono text-[9px]">
      {levels.map((lvl) => (
        <span
          key={lvl}
          className="bg-secondary/90 border border-border/60 px-1.5 py-0.5 rounded text-muted-foreground"
        >
          سطح {PersianNumberFormatter.toPersianDigits(lvl)}:{" "}
          <strong className="text-foreground font-bold">
            {PersianNumberFormatter.toPersianDigits(breakdown[lvl]!)}
          </strong>
        </span>
      ))}
    </div>
  );
}
