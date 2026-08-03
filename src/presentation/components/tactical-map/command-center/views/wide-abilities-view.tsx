import React, { useState, useCallback } from "react";
import {
  REGIME_ABILITIES,
  AbilityCard,
  AbilityItem,
} from "@/presentation/components/tactical-map/sidebar/tabs/abilities/ability-card";
import { AbilityTargetModal } from "@/presentation/components/tactical-map/modals/ability-target-modal";

interface WideAbilitiesViewProps {
  currentGovernment: string;
  nationId: string;
}

export function WideAbilitiesView({
  currentGovernment,
  nationId,
}: WideAbilitiesViewProps) {
  const [selectedAbility, setSelectedAbility] = useState<string | null>(null);

  const openAbilityModal = useCallback((abilityName: string) => {
    setSelectedAbility(abilityName);
  }, []);

  const closeAbilityModal = useCallback(() => {
    setSelectedAbility(null);
  }, []);

  return (
    <div className="space-y-4 animate-in fade-in duration-200 dir-rtl text-right">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {REGIME_ABILITIES.map((ab: AbilityItem) => (
          <AbilityCard
            key={ab.id}
            ability={ab}
            currentGovernment={currentGovernment}
            nationId={nationId}
            onActivate={(ability: AbilityItem) =>
              openAbilityModal(ability.name)
            }
          />
        ))}
      </div>

      <AbilityTargetModal
        isOpen={selectedAbility !== null}
        abilityName={selectedAbility || ""}
        nationId={nationId}
        onClose={closeAbilityModal}
        onConfirmTarget={closeAbilityModal}
      />
    </div>
  );
}
