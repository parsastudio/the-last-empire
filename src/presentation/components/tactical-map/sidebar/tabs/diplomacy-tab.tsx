import React from "react";
import { Users, Shield, Swords, Coins } from "lucide-react";

export function DiplomacyTab() {
  const relations = [
    { code: "USA", name: "ایالات متحده آمریکا", stance: "PEACE", opinion: 45 },
    { code: "CHN", name: "چین", stance: "ALLIANCE", opinion: 85 },
    { code: "RUS", name: "روسیه", stance: "ALLIANCE", opinion: 75 },
    { code: "DEU", name: "آلمان", stance: "WAR", opinion: -40 },
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="space-y-2.5">
        <div className="flex items-center gap-2 px-1">
          <Users size={13} className="text-diplomacy" />
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
            وضعیت روابط و معاهدات جهانی
          </span>
        </div>

        <div className="space-y-2">
          {relations.map((rel) => (
            <div
              key={rel.code}
              className="bg-background/40 border border-border/60 p-3 rounded-2xl flex items-center justify-between gap-3"
            >
              <div className="space-y-0.5 text-right">
                <span className="text-xs font-bold text-foreground block">
                  {rel.name}
                </span>
                <span className="text-[9px] font-mono text-muted-foreground">
                  وضعیت: {rel.stance} | نظر: {rel.opinion}°
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() =>
                    alert(`ارسال پیشنهاد دیپلماتیک به ${rel.name}`)
                  }
                  className="px-2.5 py-1.5 bg-secondary hover:bg-secondary/80 text-foreground rounded-xl text-[10px] font-bold border border-border cursor-pointer"
                >
                  تعامل
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
