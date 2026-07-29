import React from "react";
import { DoctrineItemCard } from "./doctrine-item-card";
import { PRESENTATION_DOCTRINES } from "./doctrines.config";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { ActionFactory } from "@/domain/game/action-factory";

interface DoctrineListViewProps {
  unlockedDoctrines?: string[];
  nationId?: string;
}

export function DoctrineListView({
  unlockedDoctrines = [],
  nationId = "NATION_118",
}: DoctrineListViewProps) {
  const { dispatchAction } = useGameActions();

  const handleUnlock = async (doc: { id: string; name: string }) => {
    const action = ActionFactory.unlockDoctrine(nationId, doc.id);
    await dispatchAction(
      action,
      `آنلاک دکترین ${doc.name} با موفقیت انجام شد.`,
    );
  };

  return (
    <div className="space-y-2 dir-rtl text-right">
      {PRESENTATION_DOCTRINES.map((doc) => (
        <DoctrineItemCard
          key={doc.id}
          doctrine={{
            id: doc.id,
            name: doc.name,
            cost: doc.cost,
            unlocked: unlockedDoctrines.includes(doc.id),
          }}
          onUnlock={handleUnlock}
        />
      ))}
    </div>
  );
}
