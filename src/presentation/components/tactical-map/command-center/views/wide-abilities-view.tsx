import React, { useState } from "react";
import { REGIME_ABILITIES } from "../../sidebar/tabs/abilities/abilities.config";
import { AbilityCard } from "../../sidebar/tabs/abilities/ability-card";
import { AbilityTargetModal } from "../../modals/ability-target-modal";

interface WideAbilitiesViewProps {
  currentGovernment: string;
}

export function WideAbilitiesView({
  currentGovernment,
}: WideAbilitiesViewProps) {
  const [selectedAbility, setSelectedAbility] = useState<string | null>(null);

  return (
    <div className="space-y-4 animate-in fade-in duration-200 dir-rtl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {REGIME_ABILITIES.map((ab) => (
          <AbilityCard
            key={ab.id}
            ability={ab}
            currentGovernment={currentGovernment}
            onActivate={(ability) => setSelectedAbility(ability.name)}
          />
        ))}
      </div>

      <AbilityTargetModal
        isOpen={selectedAbility !== null}
        abilityName={selectedAbility || ""}
        onClose={() => setSelectedAbility(null)}
        onConfirmTarget={(targetCode) => {
          alert(
            `توانمندی ${selectedAbility} با موفقیت بر روی کشور ${targetCode} اجرا شد.`,
          );
          setSelectedAbility(null);
        }}
      />
    </div>
  );
}
