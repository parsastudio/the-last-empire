import { useState, useCallback } from "react";

export function useTurnProgression(onSuccess: () => void) {
  const [isAdvancing, setIsAdvancing] = useState(false);

  const advanceTurn = useCallback(async () => {
    if (isAdvancing) {
      return;
    }
    setIsAdvancing(true);
    try {
      const response = await fetch("/api/map-test6/next-turn", {
        method: "POST",
      });
      if (response.ok) {
        onSuccess();
      }
    } finally {
      setIsAdvancing(false);
    }
  }, [isAdvancing, onSuccess]);

  return {
    advanceTurn,
    isAdvancing,
  };
}
