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

export class GuarantorRetaliationApplier {
  public static apply(
    state: GameState,
    attackerId: string,
    targetId: string,
  ): {
    updatedNations: Record<string, Nation>;
    retaliationLogs: TurnLogEntry[];
  } {
    const canonicalHuman = CountryRegistry.resolveCanonicalId(
      state.humanNationId,
    );
    const canonicalAttacker = CountryRegistry.resolveCanonicalId(attackerId);
    const canonicalTarget = CountryRegistry.resolveCanonicalId(targetId);

    const isAttackerHuman = canonicalAttacker === canonicalHuman;
    const isTargetHuman = canonicalTarget === canonicalHuman;

    if (!isAttackerHuman && !isTargetHuman) {
      return { updatedNations: state.nations, retaliationLogs: [] };
    }

    const target = state.nations[canonicalTarget] || state.nations[targetId];
    const attacker =
      state.nations[canonicalAttacker] || state.nations[attackerId];

    if (!target || !target.isAlive || !attacker || !attacker.isAlive) {
      return { updatedNations: state.nations, retaliationLogs: [] };
    }

    const updatedNations: Record<string, Nation> = { ...state.nations };
    const retaliationLogs: TurnLogEntry[] = [];

    if (isAttackerHuman) {
      const targetGuarantors = target.defenseGuarantorIds || [];
      const humanNation = updatedNations[canonicalHuman]!;
      const humanGuarantors = humanNation.defenseGuarantorIds || [];

      for (let i = 0; i < targetGuarantors.length; i++) {
        const guarantorId = targetGuarantors[i]!;
        const canonicalGuarantor =
          CountryRegistry.resolveCanonicalId(guarantorId);
        const guarantorNation =
          updatedNations[canonicalGuarantor] ||
          state.nations[canonicalGuarantor];

        if (!guarantorNation || !guarantorNation.isAlive) {
          continue;
        }

        const isMutualGuarantor = humanGuarantors.some(
          (hId) =>
            CountryRegistry.resolveCanonicalId(hId) === canonicalGuarantor,
        );

        if (isMutualGuarantor) {
          const newHumanGuarantors = (
            humanNation.defenseGuarantorIds || []
          ).filter(
            (hId) =>
              CountryRegistry.resolveCanonicalId(hId) !== canonicalGuarantor,
          );
          const newTargetGuarantors = (target.defenseGuarantorIds || []).filter(
            (tId) =>
              CountryRegistry.resolveCanonicalId(tId) !== canonicalGuarantor,
          );

          updatedNations[canonicalHuman] = {
            ...humanNation,
            defenseGuarantorIds: newHumanGuarantors,
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
                attackerId: humanNation.id,
                targetId: target.id,
                guarantorId: guarantorNation.id,
              },
            ),
          );
          continue;
        }

        const humanRelWithGuarantor =
          humanNation.relations?.[canonicalGuarantor];
        const guarantorRelWithHuman =
          guarantorNation.relations?.[canonicalHuman];

        const hasStrategicPartnershipWithPlayer =
          humanRelWithGuarantor?.stance === "STRATEGIC_PARTNERSHIP" ||
          guarantorRelWithHuman?.stance === "STRATEGIC_PARTNERSHIP";

        if (hasStrategicPartnershipWithPlayer) {
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
                partnerId: humanNation.id,
                targetId: target.id,
              },
            ),
          );
          continue;
        }

        if (guarantorRelWithHuman?.stance === "WAR") {
          continue;
        }

        const defRelations: Record<string, RelationProfile> = {
          ...(guarantorNation.relations || {}),
          [canonicalHuman]: {
            targetNationId: canonicalHuman,
            stance: "WAR",
            alignment: -100,
            tension: 100,
            warDeclaredTurn: state.currentTurn,
            warInitiatorId: guarantorNation.id,
          },
        };

        const currentHuman = updatedNations[canonicalHuman]!;
        const updatedHumanRelations: Record<string, RelationProfile> = {
          ...(currentHuman.relations || {}),
          [canonicalGuarantor]: {
            targetNationId: canonicalGuarantor,
            stance: "WAR",
            alignment: -100,
            tension: 100,
            warDeclaredTurn: state.currentTurn,
            warInitiatorId: guarantorNation.id,
          },
        };

        updatedNations[guarantorNation.id] = {
          ...guarantorNation,
          relations: defRelations,
          warFocusTargetId: canonicalHuman,
        };

        updatedNations[canonicalHuman] = {
          ...currentHuman,
          relations: updatedHumanRelations,
        };

        retaliationLogs.push(
          TurnLogBuilder.createGlobalWarLog(
            state.currentTurn,
            guarantorNation.id,
            canonicalHuman,
            "WAR_DECLARED",
            {
              isRetaliation: true,
              retaliationReason: "DEFENSE_GUARANTOR",
              protectedTargetId: canonicalTarget,
              protectedTargetName: target.name,
            },
            "CRITICAL",
          ),
        );
      }
    } else if (isTargetHuman) {
      const humanGuarantors = target.defenseGuarantorIds || [];
      const currentAttacker = updatedNations[canonicalAttacker] || attacker;
      const attackerGuarantors = currentAttacker.defenseGuarantorIds || [];

      for (let i = 0; i < humanGuarantors.length; i++) {
        const guarantorId = humanGuarantors[i]!;
        const canonicalGuarantor =
          CountryRegistry.resolveCanonicalId(guarantorId);
        const guarantorNation =
          updatedNations[canonicalGuarantor] ||
          state.nations[canonicalGuarantor];

        if (!guarantorNation || !guarantorNation.isAlive) {
          continue;
        }

        const isMutualGuarantor = attackerGuarantors.some(
          (aId) =>
            CountryRegistry.resolveCanonicalId(aId) === canonicalGuarantor,
        );

        if (isMutualGuarantor) {
          const newHumanGuarantors = (target.defenseGuarantorIds || []).filter(
            (hId) =>
              CountryRegistry.resolveCanonicalId(hId) !== canonicalGuarantor,
          );
          const newAttackerGuarantors = (
            currentAttacker.defenseGuarantorIds || []
          ).filter(
            (aId) =>
              CountryRegistry.resolveCanonicalId(aId) !== canonicalGuarantor,
          );

          updatedNations[canonicalHuman] = {
            ...target,
            defenseGuarantorIds: newHumanGuarantors,
          };
          updatedNations[canonicalAttacker] = {
            ...currentAttacker,
            defenseGuarantorIds: newAttackerGuarantors,
          };

          retaliationLogs.push(
            TurnLogBuilder.createDefensePactNeutralityLog(
              state.currentTurn,
              guarantorNation.id,
              canonicalHuman,
              {
                attackerId: currentAttacker.id,
                targetId: target.id,
                guarantorId: guarantorNation.id,
              },
            ),
          );
          continue;
        }

        const guarantorRelWithAttacker =
          guarantorNation.relations?.[canonicalAttacker];
        if (guarantorRelWithAttacker?.stance === "WAR") {
          continue;
        }

        const attackerRelWithGuarantor =
          currentAttacker.relations?.[canonicalGuarantor];
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
          const freshTarget = updatedNations[canonicalHuman] || target;

          updatedNations[canonicalGuarantor] = {
            ...freshGuarantor,
            treasury: Math.max(0, freshGuarantor.treasury - compensation),
          };

          updatedNations[canonicalHuman] = {
            ...freshTarget,
            treasury: freshTarget.treasury + compensation,
          };

          retaliationLogs.push(
            TurnLogBuilder.createDefensePactRefusalCompensationLog(
              state.currentTurn,
              guarantorNation.id,
              canonicalHuman,
              {
                compensationAmount: compensation,
                partnerId: currentAttacker.id,
                targetId: canonicalHuman,
              },
            ),
          );
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
            warInitiatorId: guarantorNation.id,
          },
        };

        const freshAttacker =
          updatedNations[canonicalAttacker] || currentAttacker;
        const updatedAttackerRelations: Record<string, RelationProfile> = {
          ...(freshAttacker.relations || {}),
          [canonicalGuarantor]: {
            targetNationId: canonicalGuarantor,
            stance: "WAR",
            alignment: -100,
            tension: 100,
            warDeclaredTurn: state.currentTurn,
            warInitiatorId: guarantorNation.id,
          },
        };

        updatedNations[guarantorNation.id] = {
          ...guarantorNation,
          relations: defRelations,
          warFocusTargetId: canonicalAttacker,
        };

        updatedNations[freshAttacker.id] = {
          ...freshAttacker,
          relations: updatedAttackerRelations,
        };

        retaliationLogs.push(
          TurnLogBuilder.createGlobalWarLog(
            state.currentTurn,
            guarantorNation.id,
            attacker.id,
            "WAR_DECLARED",
            {
              isRetaliation: true,
              retaliationReason: "DEFENSE_GUARANTOR",
              protectedTargetId: canonicalHuman,
              protectedTargetName: target.name,
            },
            "CRITICAL",
          ),
        );
      }
    }

    return { updatedNations, retaliationLogs };
  }
}
