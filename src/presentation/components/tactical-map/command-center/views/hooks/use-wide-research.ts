import { useMemo, useCallback } from "react";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import {
  COMPREHENSIVE_RESEARCH_TREE,
  ResearchNode,
} from "@/domain/politics/research-tree.config";
import { ActionFactory } from "@/domain/game/action-factory";

interface UseWideResearchProps {
  unlockedDoctrines?: string[];
  nationId: string;
  treasury: number;
  oilStock: number;
}

export function useWideResearch({
  unlockedDoctrines = ["gdp-booster"],
  nationId,
  treasury,
  oilStock,
}: UseWideResearchProps) {
  const { dispatchAction } = useGameActions();

  const mapNodeToView = useCallback(
    (node: ResearchNode) => {
      const unlocked = unlockedDoctrines.includes(node.id);
      const prereqsMet = node.prerequisites.every((req) =>
        unlockedDoctrines.includes(req),
      );
      const canAffordMoney = treasury >= node.moneyCost;
      const canAffordOil = node.oilCost === 0 || oilStock >= node.oilCost;

      return {
        id: node.id,
        name: node.nameFa,
        desc: node.desc,
        tier: node.tier,
        moneyCost: node.moneyCost,
        oilCost: node.oilCost,
        unlocked,
        canUnlock: !unlocked && prereqsMet,
        canAfford: canAffordMoney && canAffordOil,
        prerequisites: node.prerequisites,
      };
    },
    [unlockedDoctrines, treasury, oilStock],
  );

  const industrialDoctrines = useMemo(() => {
    return COMPREHENSIVE_RESEARCH_TREE.filter(
      (d) => d.branch === "INDUSTRIAL_TECH",
    ).map(mapNodeToView);
  }, [mapNodeToView]);

  const asymmetricDoctrines = useMemo(() => {
    return COMPREHENSIVE_RESEARCH_TREE.filter(
      (d) => d.branch === "ASYMMETRIC_MILITARY",
    ).map(mapNodeToView);
  }, [mapNodeToView]);

  const diplomaticDoctrines = useMemo(() => {
    return COMPREHENSIVE_RESEARCH_TREE.filter(
      (d) => d.branch === "DIPLOMATIC_HEGEMONY",
    ).map(mapNodeToView);
  }, [mapNodeToView]);

  const handleUnlock = useCallback(
    async (doc: { id: string; name: string }) => {
      const action = ActionFactory.unlockDoctrine(nationId, doc.id);
      await dispatchAction(action, `دکترین ${doc.name} با موفقیت آنلاک گردید.`);
    },
    [dispatchAction, nationId],
  );

  return {
    industrialDoctrines,
    asymmetricDoctrines,
    diplomaticDoctrines,
    handleUnlock,
  };
}
