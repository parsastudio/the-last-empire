import { useRef, useEffect } from "react";

export function useBaselineTreasury(
  treasury: number,
  dependencyKeys: unknown[] = [],
): number {
  const baselineTreasuryRef = useRef<number>(treasury);
  const prevKeysRef = useRef<unknown[]>(dependencyKeys);

  const keysChanged =
    dependencyKeys.length !== prevKeysRef.current.length ||
    dependencyKeys.some((k, i) => k !== prevKeysRef.current[i]);

  if (keysChanged) {
    prevKeysRef.current = dependencyKeys;
    baselineTreasuryRef.current = treasury;
  }

  useEffect(() => {
    if (treasury > baselineTreasuryRef.current) {
      baselineTreasuryRef.current = treasury;
    }
  }, [treasury]);

  return baselineTreasuryRef.current;
}
