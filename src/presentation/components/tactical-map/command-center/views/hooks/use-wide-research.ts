import { useMemo, useCallback } from "react";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { COMPREHENSIVE_RESEARCH_TREE } from "@/domain/politics/research-tree.config";
import { ActionFactory } from "@/domain/game/action-factory";

interface UseWideResearchProps {
  unlockedDoctrines?: string[];
  nationId: string;
}

export function useWideResearch({
  unlockedDoctrines = ["gdp-booster"],
  nationId,
}: UseWideResearchProps) {
  const { dispatchAction } = useGameActions();

  const mapNodeToView = useCallback(
    (node: (typeof COMPREHENSIVE_RESEARCH_TREE)[number]) => {
      const unlocked = unlockedDoctrines.includes(node.id);
      const prereqsMet = node.prerequisites.every((req) =>
        unlockedDoctrines.includes(req),
      );

      return {
        id: node.id,
        name: node.nameFa,
        desc: node.desc,
        tier: node.tier,
        cost: node.cost,
        unlocked,
        canUnlock: !unlocked && prereqsMet,
        prerequisites: node.prerequisites,
      };
    },
    [unlockedDoctrines],
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
    async (doc: { id: string; name: string; cost: number }) => {
      const action = ActionFactory.unlockDoctrine(nationId, doc.id);
      await dispatchAction(action, `آنلاک فناوری ${doc.name} انجام شد.`);
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
