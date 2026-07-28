import React from "react";
import { ShieldAlert } from "lucide-react";

export function ActiveModifiersCard() {
  const modifiers = [
    {
      id: "1",
      name: "حکومت نظامی فعال",
      type: "افزایش ثبات داخلی",
      turns: 3,
    },
  ];

  if (modifiers.length === 0) return null;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 px-1">
        <ShieldAlert size={13} className="text-military" />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
          تاثیرات و مودیفایرهای فعال
        </span>
      </div>

      <div className="space-y-2 font-mono text-xs">
        {modifiers.map((mod) => (
          <div
            key={mod.id}
            className="bg-background/40 border border-border/60 p-3 rounded-xl flex items-center justify-between"
          >
            <div className="space-y-0.5 text-right">
              <span className="text-xs font-bold text-foreground block font-sans">
                {mod.name}
              </span>
              <span className="text-[9px] text-muted-foreground block font-sans">
                {mod.type}
              </span>
            </div>
            <span className="text-[10px] bg-secondary px-2 py-0.5 rounded-lg text-muted-foreground">
              {mod.turns} نوبت دیگر
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
