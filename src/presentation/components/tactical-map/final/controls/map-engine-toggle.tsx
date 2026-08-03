import React from "react";
import { useRouter } from "next/navigation";
import { Cpu, Eye } from "lucide-react";

interface MapEngineToggleProps {
  currentEngine: "canvas2d" | "webgl2";
  gameId: string;
}

export function MapEngineToggle({
  currentEngine,
  gameId,
}: MapEngineToggleProps) {
  const router = useRouter();

  const handleToggle = () => {
    if (currentEngine === "canvas2d") {
      router.push(`/play-webgl/${gameId}`);
    } else {
      router.push(`/play/${gameId}`);
    }
  };

  return (
    <div className="fixed top-20 right-4 z-40 bg-card/90 backdrop-blur-xl border border-border p-1.5 rounded-2xl shadow-xl flex items-center gap-2 dir-rtl">
      <div className="flex items-center gap-1.5 px-2 text-xs font-bold text-muted-foreground">
        <Cpu size={14} className="text-primary" />
        <span className="text-[10px] hidden sm:inline font-sans">
          موتور رندرینگ:
        </span>
      </div>

      <button
        onClick={handleToggle}
        className="px-3 py-1.5 bg-primary/15 hover:bg-primary/25 text-primary border border-primary/30 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
      >
        <Eye size={13} />
        <span>
          {currentEngine === "canvas2d"
            title "سوییچ به WebGL2"
            : "سوییچ به Canvas2D"}
        </span>
      </button>
    </div>
  );
}