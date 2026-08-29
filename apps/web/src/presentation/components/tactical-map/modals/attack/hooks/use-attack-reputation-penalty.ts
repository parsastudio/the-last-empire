import { useMemo } from "react";
import { Nation } from "@/domain/nation/nation.schema";
import { NationRelationResolver } from "@/domain/diplomacy/nation-relation-resolver.utility";
import { DiplomaticStance } from "@/domain/diplomacy/diplomacy.schema";

interface UseAttackReputationPenaltyProps {
  humanNation: Nation | null;
  targetNation: Nation | null;
}

export function useAttackReputationPenalty({
  humanNation,
  targetNation,
}: UseAttackReputationPenaltyProps) {
  const currentStance = useMemo<DiplomaticStance>(() => {
    if (!humanNation || !targetNation) return "NORMAL_DIPLOMACY";
    return NationRelationResolver.getStance(
      humanNation.relations,
      targetNation.id,
    );
  }, [humanNation, targetNation]);

  const isWarStance = currentStance === "WAR";

  const reputationPenalty = useMemo(() => {
    if (isWarStance) return 0;
    if (currentStance === "STRATEGIC_PARTNERSHIP") return 40;
    if (currentStance === "NON_AGGRESSION_PACT") return 25;
    return 15;
  }, [isWarStance, currentStance]);

  return {
    currentStance,
    isWarStance,
    reputationPenalty,
  };
}
