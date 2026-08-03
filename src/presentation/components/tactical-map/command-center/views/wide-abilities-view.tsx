import React from "react";
import { REGIME_ABILITIES } from "@/presentation/components/tactical-map/sidebar/tabs/abilities/abilities.config";
import { AbilityCard } from "@/presentation/components/tactical-map/sidebar/tabs/abilities/ability-card";
import { AbilityTargetModal } from "@/presentation/components/tactical-map/modals/ability-target-modal";
import { useWideAbilities } from "@/presentation/components/tactical-map/command-center/views/hooks/use-wide-abilities";

interface WideAbilitiesViewProps {
  currentGovernment: string;
  nationId: string;
}

export function WideAbilitiesView({
  currentGovernment,
  nationId,
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
