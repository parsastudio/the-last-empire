import { useState, useCallback, useMemo } from "react";
import { Coordinate } from "@/domain/map/coordinate.schema";
import { GridState } from "@/engine/combat/state/grid-state";
import { ConquestMapAdapter } from "@/application/map/conquest-map-adapter";
import { EnclaveRegistry } from "@/engine/combat/registry/enclave-registry";
import { CombatLogistics } from "@/domain/combat/logistics.schema";

export function useGridConquest(gridState: GridState) {
  const [selectedPixel, setSelectedPixel] = useState<Coordinate | null>(null);
  const [logistics, setLogistics] = useState<CombatLogistics | null>(null);

  const adapter = useMemo(() => new ConquestMapAdapter(), []);
  const registry = useMemo(() => new EnclaveRegistry(), []);

  const handlePixelSelect = useCallback(
    (attackerId: string, pixel: Coordinate) => {
      setSelectedPixel(pixel);
      const result = adapter.getLogisticsForUIPlick(
        attackerId,
        pixel,
        gridState,
        registry,
      );
      setLogistics(result);
    },
    [gridState, adapter, registry],
  );

  return {
    selectedPixel,
    logistics,
    handlePixelSelect,
    clearSelection: () => {
      setSelectedPixel(null);
      setLogistics(null);
    },
  };
}
