import React, { useState } from "react";
import { MilitaryForcesSection } from "../../military-forces-section";
import { MilitaryExpansionView } from "./military-expansion-view";
import { PlusCircle, ShieldAlert, Swords } from "lucide-react";

interface MilitaryTabProps {
  military: {
    infantry: number;
    airForce: number;
    droneMissile: number;
    experience: number;
    techLevel: number;
  };
}

export function MilitaryTab({ military }: MilitaryTabProps) {
  const [currentSubView, setCurrentSubView] = useState<
    "overview" | "expansion"
  >("overview");

  if (currentSubView === "expansion") {
    return (
      <div className="space-y-4 animate-in fade-in duration-200">
        <button
          onClick={() => setCurrentSubView("overview")}
          className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <span>← بازگشت به نمای ارتش</span>
        </button>
        <MilitaryExpansionView />
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <MilitaryForcesSection
        infantry={military.infantry}
        airForce={military.airForce}
        droneMissile={military.droneMissile}
        techLevel={military.techLevel}
        experience={military.experience}
      />

      <div className="space-y-2.5">
        <div className="flex items-center gap-2 px-1">
          <Swords size={13} className="text-military" />
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
            مدیریت راهبردی ارتش
          </span>
        </div>

        <button
          onClick={() => setCurrentSubView("expansion")}
          className="w-full p-4 bg-background/40 hover:bg-secondary/50 border border-border/80 rounded-2xl transition-all flex items-center justify-between text-right cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-military/10 flex items-center justify-center text-military group-hover:scale-105 transition-transform">
              <PlusCircle size={18} />
            </div>
            <div>
              <span className="text-xs font-bold text-foreground block">
                گسترش و استخدام نیروی نظامی
              </span>
              <span className="text-[10px] text-muted-foreground">
                ساخت پیاده‌نظام، جنگنده و یگان‌های موشکی جدید
              </span>
            </div>
          </div>
        </button>

        <div className="bg-background/40 border border-border/60 p-4 rounded-2xl space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              ارتقای سطح فناوری نظامی
            </span>
            <span className="font-mono font-bold text-gdp">$100,000</span>
          </div>
          <button
            onClick={() => alert("پژوهش نظامی آغاز شد.")}
            className="w-full py-2.5 bg-secondary hover:bg-secondary/80 text-foreground rounded-xl text-xs font-bold transition-all border border-border flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShieldAlert size={14} className="text-amber-500" />
            <span>تحقیق فناوری لِوِل بعد</span>
          </button>
        </div>
      </div>
    </div>
  );
}
