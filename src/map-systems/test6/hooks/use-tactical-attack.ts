import { useState, useCallback } from "react";
import { Coordinate } from "@/domain/map/coordinate.schema";

export function useTacticalAttack(
  playerNationId: string | null,
  onAttackResult: () => void,
) {
  const [isAttacking, setIsAttacking] = useState(false);

  const executeAttack = useCallback(
    async (targetCountryId: string, coordinate: Coordinate) => {
      if (!playerNationId || isAttacking) {
        return;
      }

      setIsAttacking(true);

      try {
        const response = await fetch("/api/map-test6/cheat-attack", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            attackerId: playerNationId,
            targetId: targetCountryId,
            x: coordinate.x,
            y: coordinate.y,
          }),
        });

        if (response.ok) {
          onAttackResult();
        }
      } finally {
        setIsAttacking(false);
      }
    },
    [playerNationId, isAttacking, onAttackResult],
  );

  return {
    executeAttack,
    isAttacking,
  };
}
