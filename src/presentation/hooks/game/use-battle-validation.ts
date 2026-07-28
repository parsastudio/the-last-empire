import { useState, useEffect } from "react";
import { BattleValidationResult } from "@/engine/combat/validation/battle-validation-result.schema";

export function useBattleValidation(
  attackerId: string,
  coordinate: { x: number; y: number } | null,
  isOpen: boolean,
) {
  const [validationResult, setValidationResult] =
    useState<BattleValidationResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !attackerId || !coordinate) {
      setValidationResult(null);
      return;
    }

    let active = true;

    async function validateAttackOnServer() {
      try {
        setLoading(true);
        const res = await fetch("/api/grid-conquest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            attackerId,
            x: coordinate.x,
            y: coordinate.y,
          }),
        });

        const json = await res.json();
        if (active && json.success && json.data) {
          setValidationResult(json.data as BattleValidationResult);
        }
      } catch {
        if (active) {
          setValidationResult(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    validateAttackOnServer();

    return () => {
      active = false;
    };
  }, [attackerId, coordinate, isOpen]);

  return { validationResult, loading };
}
