import React, { useState, useMemo } from "react";
import { Zap, Search } from "lucide-react";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { ALL_COUNTRY_PROFILES } from "@/domain/map/countries";
import { UnifiedModalShell } from "@/presentation/components/common/unified-modal-shell";

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
    <UnifiedModalShell
      isOpen={isOpen}
      title={abilityName}
      subtitle="انتخاب کشور هدف توانمندی ویژه"
      maxWidthClass="max-w-sm"
      onClose={onClose}
    >
      <div className="space-y-4 text-right dir-rtl">
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
          className="w-full py-3 bg-primary text-primary-foreground rounded-2xl font-bold text-xs cursor-pointer shadow-md flex items-center justify-center gap-2"
        >
          <Zap size={14} />
          <span>اجرای توانمندی روی هدف</span>
        </button>
      </div>
    </UnifiedModalShell>
  );
}
