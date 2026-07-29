import React from "react";
import { Zap } from "lucide-react";
import { REGIME_ABILITIES } from "./abilities.config";
import { AbilityCard } from "./ability-card";
import { AbilityTargetModal } from "../../modals/ability-target-modal";
import { useWideAbilities } from "../../command-center/views/hooks/use-wide-abilities";

interface AbilitiesTabProps {
  currentGovernment: string;
  nationId?: string;
}

export function AbilitiesTab({
  currentGovernment,
  nationId = "NATION_118",
}: AbilitiesTabProps) {
  const abilities = useWideAbilities();

  return (
    <div className="space-y-4 animate-in fade-in duration-200 dir-rtl text-right">
      <div className="flex items-center gap-2 px-1">
        <Zap size={13} className="text-treasury" />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
          قابلیت‌ها و توانمندی‌های ویژه حکومتی
        </span>
      </div>

      <div className="space-y-3">
        {REGIME_ABILITIES.map((ab) => (
          <AbilityCard
            key={ab.id}
            ability={ab}
            currentGovernment={currentGovernment}
            nationId={nationId}
            onActivate={(ability) => abilities.openAbilityModal(ability.name)}
          />
        ))}
      </div>

      <AbilityTargetModal
        isOpen={abilities.selectedAbility !== null}
        abilityName={abilities.selectedAbility || ""}
        nationId={nationId}
        onClose={abilities.closeAbilityModal}
        onConfirmTarget={abilities.closeAbilityModal}
      />
    </div>
  );
}
