import { useState, useCallback } from "react";

export function useWideAbilities() {
  const [selectedAbility, setSelectedAbility] = useState<string | null>(null);

  const openAbilityModal = useCallback((abilityName: string) => {
    setSelectedAbility(abilityName);
  }, []);

  const closeAbilityModal = useCallback(() => {
    setSelectedAbility(null);
  }, []);

  return {
    selectedAbility,
    openAbilityModal,
    closeAbilityModal,
  };
}
