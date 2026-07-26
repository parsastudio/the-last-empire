import { useState, useCallback } from "react";

export function useTacticalOptions() {
  const [forceSuccess, setForceSuccess] = useState(true);

  const toggleForceSuccess = useCallback(() => {
    setForceSuccess((prev) => !prev);
  }, []);

  return {
    forceSuccess,
    toggleForceSuccess,
  };
}
