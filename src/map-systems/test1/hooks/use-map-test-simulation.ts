import { useState, useCallback } from "react";
import { executeProvinceAttack } from "@/application/province-engine";
import type { Province } from "@/domain/map/province.schema";

interface UseMapTestSimulationProps {
  playerCountryCode: string | null;
  setPlayerCountryCode: (code: string | null) => void;
  provincesMap: Record<string, Province[]>;
  setOccupiedProvinceIds: React.Dispatch<React.SetStateAction<Set<string>>>;
}

export function useMapTestSimulation({
  playerCountryCode,
  setPlayerCountryCode,
  provincesMap,
  setOccupiedProvinceIds,
}: UseMapTestSimulationProps) {
  const [isAttacking, setIsAttacking] = useState<boolean>(false);
  const [assaultVector, setAssaultVector] = useState<{
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
  } | null>(null);

  const handleCountryClick = useCallback(
    (countryCode: string) => {
      if (!playerCountryCode) {
        const confirmed = window.confirm(
          "Are you sure you want to select this nation?",
        );
        if (confirmed) {
          setPlayerCountryCode(countryCode);
        }
        return;
      }

      if (countryCode === playerCountryCode || isAttacking) return;

      const result = executeProvinceAttack(
        countryCode,
        provincesMap,
        playerCountryCode,
      );

      if (result.newlyConqueredProvIds.length > 0) {
        setIsAttacking(true);

        const fromProv = Object.values(provincesMap)
          .flat()
          .find((p) => p.id === result.attackerSourceId);
        const toProv = Object.values(provincesMap)
          .flat()
          .find((p) => p.id === result.defenderEntryId);

        if (fromProv && toProv) {
          setAssaultVector({
            fromX: fromProv.x,
            fromY: fromProv.y,
            toX: toProv.x,
            toY: toProv.y,
          });
        }

        let index = 0;
        const queuedIds = result.newlyConqueredProvIds;

        const interval = setInterval(() => {
          if (index < queuedIds.length) {
            const nextId = queuedIds[index];
            if (nextId) {
              setOccupiedProvinceIds((prev) => {
                const next = new Set(prev);
                next.add(nextId);
                return next;
              });
            }
            index++;
          } else {
            clearInterval(interval);
            setIsAttacking(false);
            setAssaultVector(null);
          }
        }, 150);
      }
    },
    [
      playerCountryCode,
      isAttacking,
      provincesMap,
      setPlayerCountryCode,
      setOccupiedProvinceIds,
    ],
  );

  return {
    isAttacking,
    assaultVector,
    handleCountryClick,
    setAssaultVector,
  };
}
