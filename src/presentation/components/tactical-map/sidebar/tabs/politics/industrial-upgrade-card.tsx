import React from "react";
import { Cpu } from "lucide-react";
import { useToast } from "@/presentation/context/toast-context";

interface IndustrialUpgradeCardProps {
  currentLevel?: number;
}

export function IndustrialUpgradeCard({
  currentLevel = 1,
}: IndustrialUpgradeCardProps) {
  const upgradeCost = Math.floor(50000 * Math.pow(1.3, currentLevel - 1));
  const { showToast } = useToast();

  const handleUpgrade = () => {
    showToast(
      "ارتقای توسعه صنعتی",
      `پروژه ارتقای صنایع سنگین به سطح ${currentLevel + 1} با موفقیت کلید خورد.`,
      "success",
    );
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 px-1">
        <Cpu size={13} className="text-gdp" />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
          توسعه صنعتی و تولیدی
        </span>
      </div>

      <div className="bg-background/40 border border-border/60 p-4 rounded-2xl space-y-3 text-right dir-rtl">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">سطح صنعت فعلی:</span>
          <span className="font-mono font-bold text-gdp">
            سطح {currentLevel}
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-muted-foreground font-sans">هزینه ارتقا:</span>
          <span className="font-bold text-foreground">
            ${upgradeCost.toLocaleString("fa-IR")}
          </span>
        </div>

        <button
          onClick={handleUpgrade}
          className="w-full py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-xl text-xs font-bold transition-all border border-border cursor-pointer"
        >
          ارتقا به سطح {currentLevel + 1}
        </button>
      </div>
    </div>
  );
}
