import {
  GameState,
  Nation,
  CountryRegistry,
  TurnLogBuilder,
  RelationProfile,
  TurnLogEntry,
  getNationGdp,
  SecurityFeeCalculatorUtility,
} from "@geopolitics/domain";

export interface RetaliatingGuarantorInfo {
  id: string;
  name: string;
  flagCode: string;
}

export interface GuarantorRetaliationOutput {
  updatedNations: Record<string, Nation>;
  retaliationLogs: TurnLogEntry[];
  retaliatingGuarantors: RetaliatingGuarantorInfo[];
}

export class GuarantorRetaliationApplier {
  public static apply(
    state: GameState,
    attackerId: string,
    targetId: string,
  ): GuarantorRetaliationOutput {
    const canonicalAttacker = CountryRegistry.resolveCanonicalId(attackerId);
    const canonicalTarget = CountryRegistry.resolveCanonicalId(targetId);

    const target = state.nations[canonicalTarget] || state.nations[targetId];
    const attacker =
      state.nations[canonicalAttacker] || state.nations[attackerId];

    if (!target || !target.isAlive || !attacker || !attacker.isAlive) {
      return {
        updatedNations: state.nations,
        retaliationLogs: [],
        retaliatingGuarantors: [],
      };
    }

    const existingRel = attacker.relations?.[canonicalTarget];
    if (existingRel?.isIntervener) {
      return {
        updatedNations: state.nations,
        retaliationLogs: [],
        retaliatingGuarantors: [],
      };
    }

    const targetGuarantors = target.defenseGuarantorIds || [];
    if (targetGuarantors.length === 0) {
      return {
        updatedNations: state.nations,
        retaliationLogs: [],
        retaliatingGuarantors: [],
      };
    }

    const updatedNations: Record<string, Nation> = { ...state.nations };
    const retaliationLogs: TurnLogEntry[] = [];
    const retaliatingGuarantors: RetaliatingGuarantorInfo[] = [];

    const attackerGuarantors = attacker.defenseGuarantorIds || [];

    for (let i = 0; i < targetGuarantors.length; i++) {
      const guarantorId = targetGuarantors[i]!;
      const canonicalGuarantor =
        CountryRegistry.resolveCanonicalId(guarantorId);
      const guarantorNation =
        updatedNations[canonicalGuarantor] || state.nations[canonicalGuarantor];

      if (!guarantorNation || !guarantorNation.isAlive) {
        continue;
      }

      if (canonicalGuarantor === canonicalAttacker) {
        continue;
      }

      const isMutual = attackerGuarantors.some(
        (aId) => CountryRegistry.resolveCanonicalId(aId) === canonicalGuarantor,
      );

      if (isMutual) {
        const newAttackerGuarantors = attackerGuarantors.filter(
          (aId) =>
            CountryRegistry.resolveCanonicalId(aId) !== canonicalGuarantor,
        );
        const newTargetGuarantors = (target.defenseGuarantorIds || []).filter(
          (tId) =>
            CountryRegistry.resolveCanonicalId(tId) !== canonicalGuarantor,
        );

        updatedNations[canonicalAttacker] = {
          ...attacker,
          defenseGuarantorIds: newAttackerGuarantors,
        };
        updatedNations[canonicalTarget] = {
          ...target,
          defenseGuarantorIds: newTargetGuarantors,
        };

        retaliationLogs.push(
          TurnLogBuilder.createDefensePactNeutralityLog(
            state.currentTurn,
            guarantorNation.id,
            target.id,
            {
              attackerId: attacker.id,
              targetId: target.id,
              guarantorId: guarantorNation.id,
            },
          ),
        );
        continue;
      }

      const guarantorRelWithAttacker =
        guarantorNation.relations?.[canonicalAttacker];
      const attackerRelWithGuarantor = attacker.relations?.[canonicalGuarantor];

      const hasStrategicPartnership =
        guarantorRelWithAttacker?.stance === "STRATEGIC_PARTNERSHIP" ||
        attackerRelWithGuarantor?.stance === "STRATEGIC_PARTNERSHIP";

      if (hasStrategicPartnership) {
        const guarantorGdp = getNationGdp(guarantorNation, state.provinces);
        const compensation =
          SecurityFeeCalculatorUtility.calculateRefusalCompensation(
            guarantorGdp,
          );

        const freshGuarantor =
          updatedNations[canonicalGuarantor] || guarantorNation;
        const freshTarget = updatedNations[canonicalTarget] || target;

        updatedNations[canonicalGuarantor] = {
          ...freshGuarantor,
          treasury: Math.max(0, freshGuarantor.treasury - compensation),
        };

        updatedNations[canonicalTarget] = {
          ...freshTarget,
          treasury: freshTarget.treasury + compensation,
        };

        retaliationLogs.push(
          TurnLogBuilder.createDefensePactRefusalCompensationLog(
            state.currentTurn,
            guarantorNation.id,
            target.id,
            {
              compensationAmount: compensation,
              partnerId: attacker.id,
              targetId: target.id,
            },
          ),
        );
        continue;
      }

      if (guarantorRelWithAttacker?.stance === "WAR") {
        continue;
      }

      const defRelations: Record<string, RelationProfile> = {
        ...(guarantorNation.relations || {}),
        [canonicalAttacker]: {
          targetNationId: canonicalAttacker,
          stance: "WAR",
          alignment: -100,
          tension: 100,
          warDeclaredTurn: state.currentTurn,
          isIntervener: true,
        },
      };

      const freshAttacker = updatedNations[canonicalAttacker] || attacker;
      const updatedAttackerRelations: Record<string, RelationProfile> = {
        ...(freshAttacker.relations || {}),
        [canonicalGuarantor]: {
          targetNationId: canonicalGuarantor,
          stance: "WAR",
          alignment: -100,
          tension: 100,
          warDeclaredTurn: state.currentTurn,
          isIntervener: true,
        },
      };

      updatedNations[guarantorNation.id] = {
        ...guarantorNation,
        relations: defRelations,
        warFocusTargetId: canonicalAttacker,
      };

      updatedNations[canonicalAttacker] = {
        ...freshAttacker,
        relations: updatedAttackerRelations,
      };

      retaliatingGuarantors.push({
        id: guarantorNation.id,
        name: guarantorNation.id,
        flagCode: guarantorNation.flagCode || guarantorNation.id,
      });

      retaliationLogs.push(
        TurnLogBuilder.createGlobalWarLog(
          state.currentTurn,
          guarantorNation.id,
          canonicalAttacker,
          "WAR_DECLARED",
          {
            isRetaliation: true,
            retaliationReason: "DEFENSE_GUARANTOR",
            protectedTargetId: canonicalTarget,
            protectedTargetName: target.id,
          },
          "CRITICAL",
        ),
      );
    }

    return {
      updatedNations,
      retaliationLogs,
      retaliatingGuarantors,
    };
  }
}
