import React, { useState, useMemo } from "react";
import { X, Zap, Search } from "lucide-react";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { ALL_COUNTRY_PROFILES } from "@/domain/map/countries";

interface AbilityTargetModalProps {
  isOpen: boolean;
  abilityName: string;
  nationId?: string;
  onClose: () => void;
  onConfirmTarget: (targetCode: string) => void;
}

export function AbilityTargetModal({
  isOpen,
  abilityName,
  nationId = "NATION_118",
  onClose,
  onConfirmTarget,
}: AbilityTargetModalProps) {
  const [selectedCode, setSelectedCode] = useState<string>("NATION_15");
  const [searchQuery, setSearchQuery] = useState("");
  const { dispatchAction } = useGameActions();

  const targetOptions = useMemo(() => {
    return ALL_COUNTRY_PROFILES.map((p) => ({
      code: `NATION_${p.id}`,
      name: p.nameFa,
    }));
  }, []);

  if (!isOpen) return null;

  const filteredOptions = targetOptions.filter(
    (opt) =>
      opt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opt.code.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleExecuteAbility = async () => {
    await dispatchAction(
      {
        id: `ability-target-${Date.now()}`,
        nationId,
        type: "ACTIVATE_ABILITY",
        abilityType: "DIPLOMATIC_SUMMIT",
        targetNationId: selectedCode,
      },
      `قابلیت ${abilityName} با موفقیت روی کشور هدف اجرا گردید.`,
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

        <div className="relative">
          <Search
            size={13}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="جستجوی کشور..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-secondary/50 border border-border rounded-xl py-1.5 pr-8 pl-3 text-xs text-foreground text-right"
          />
        </div>

        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
          {filteredOptions.map((opt) => (
            <button
              key={opt.code}
              onClick={() => setSelectedCode(opt.code)}
              className={`w-full p-2.5 rounded-xl border text-right transition-all flex items-center justify-between text-xs cursor-pointer ${
                selectedCode === opt.code
                  ? "bg-secondary border-primary font-bold"
                  : "bg-background/40 border-border/60 hover:bg-secondary/40"
              }`}
            >
              <span>{opt.name}</span>
              <span className="font-mono text-[9px] bg-background px-2 py-0.5 rounded text-muted-foreground">
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
