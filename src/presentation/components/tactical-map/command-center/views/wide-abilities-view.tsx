import React from "react";
import { REGIME_ABILITIES } from "../../sidebar/tabs/abilities/abilities.config";
import { AbilityCard } from "../../sidebar/tabs/abilities/ability-card";
import { AbilityTargetModal } from "../../modals/ability-target-modal";
import { useWideAbilities } from "./hooks/use-wide-abilities";

interface WideAbilitiesViewProps {
  currentGovernment: string;
  nationId?: string;
}

export function WideAbilitiesView({
  currentGovernment,
  nationId = "NATION_USA",
}: WideAbilitiesViewProps) {
  const abilities = useWideAbilities();

  return (
    <div className="space-y-4 animate-in fade-in duration-200 dir-rtl text-right">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
