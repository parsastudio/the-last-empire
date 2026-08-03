import React, { useState } from "react";
import { Zap, Search } from "lucide-react";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { UnifiedModalShell } from "@/presentation/components/common/unified-modal-shell";
import { ActionFactory } from "@/domain/game/action-factory";
import { useAbilityTargetOptions } from "@/presentation/components/tactical-map/modals/hooks/use-ability-target-options";

interface AbilityTargetModalProps {
  isOpen: boolean;
  abilityName: string;
  nationId: string;
  onClose: () => void;
  onConfirmTarget: (targetCode: string) => void;
}

export function AbilityTargetModal({
  isOpen,
  abilityName,
  nationId,
  onClose,
  onConfirmTarget,
}: AbilityTargetModalProps) {
  const targetOptions = useAbilityTargetOptions(nationId);
  const [selectedCode, setSelectedCode] = useState<string>(
    targetOptions[0]?.code || "",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const { dispatchAction } = useGameActions();

  if (!isOpen) return null;

  const filteredOptions = targetOptions.filter(
    (opt: { name: string; code: string }) =>
      opt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opt.code.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleExecuteAbility = async () => {
    if (!selectedCode) return;

    const action = ActionFactory.activateAbility(
      nationId,
      "DIPLOMATIC_SUMMIT",
      selectedCode,
    );

    await dispatchAction(
      action,
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
          {filteredOptions.map((opt: { name: string; code: string }) => (
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
          disabled={!selectedCode}
          className="w-full py-3 bg-primary text-primary-foreground disabled:opacity-40 rounded-2xl font-bold text-xs cursor-pointer shadow-md flex items-center justify-center gap-2"
        >
          <Zap size={14} />
          <span>اجرای توانمندی روی هدف</span>
        </button>
      </div>
    </UnifiedModalShell>
  );
}
