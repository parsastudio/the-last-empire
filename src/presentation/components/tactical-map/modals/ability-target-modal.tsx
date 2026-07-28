import React, { useState } from "react";
import { X, Zap } from "lucide-react";
import { useToast } from "@/presentation/context/toast-context";

interface AbilityTargetModalProps {
  isOpen: boolean;
  abilityName: string;
  onClose: () => void;
  onConfirmTarget: (targetCode: string) => void;
}

export function AbilityTargetModal({
  isOpen,
  abilityName,
  onClose,
  onConfirmTarget,
}: AbilityTargetModalProps) {
  const [selectedCode, setSelectedCode] = useState<string>("USA");
  const { showToast } = useToast();

  if (!isOpen) return null;

  const targetOptions = [
    { code: "USA", name: "ایالات متحده آمریکا" },
    { code: "CHN", name: "چین" },
    { code: "RUS", name: "روسیه" },
    { code: "DEU", name: "آلمان" },
  ];

  const handleExecuteAbility = () => {
    showToast(
      "اجرای فرمان حکومتی",
      `قابلیت ${abilityName} با موفقیت روی کشور ${selectedCode} اجرا گردید.`,
      "success",
    );
    onConfirmTarget(selectedCode);
  };

  return (
    <div className="fixed inset-0 bg-background/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-smooth">
      <div className="bg-card border border-border w-full max-w-sm rounded-3xl p-5 space-y-4 text-right shadow-2xl relative dir-rtl">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl cursor-pointer"
        >
          <X size={14} />
        </button>

        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-treasury font-mono">
            <Zap size={14} />
            <span>انتخاب کشور هدف توانمندی</span>
          </div>
          <h3 className="text-sm font-bold text-foreground">{abilityName}</h3>
        </div>

        <div className="space-y-2">
          {targetOptions.map((opt) => (
            <button
              key={opt.code}
              onClick={() => setSelectedCode(opt.code)}
              className={`w-full p-3 rounded-xl border text-right transition-all flex items-center justify-between text-xs cursor-pointer ${
                selectedCode === opt.code
                  ? "bg-secondary border-primary font-bold"
                  : "bg-background/40 border-border/60 hover:bg-secondary/40"
              }`}
            >
              <span>{opt.name}</span>
              <span className="font-mono text-[9px] bg-background px-2 py-0.5 rounded">
                {opt.code}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={handleExecuteAbility}
          className="w-full py-3 bg-primary text-primary-foreground rounded-2xl font-bold text-xs cursor-pointer shadow-md"
        >
          اجرای توانمندی روی هدف
        </button>
      </div>
    </div>
  );
}
