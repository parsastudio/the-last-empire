import { useState, useCallback, useMemo } from "react";
import { GridGenerator } from "@/engine/map/grid-generator";
import type { GridCell } from "@/domain/map/grid.schema";
import type { GeoJsonData } from "@/engine/map/grid-generator";

export function useMapLoader() {
  const [grid, setGrid] = useState<GridCell[][] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const generator = useMemo(() => new GridGenerator(), []);

  const loadMapFromData = useCallback(
    async (
      geoJson: GeoJsonData,
      width: number,
      height: number,
      survivingNations: Set<string>,
    ) => {
      setLoading(true);
      setError(null);
      try {
        const generatedGrid = generator.generateGrid(
          geoJson,
          width,
          height,
          survivingNations,
        );
        setGrid(generatedGrid);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Map conversion failed");
      } finally {
        setLoading(false);
      }
    },
    [generator],
  );

  return {
    grid,
    loading,
    error,
    loadMapFromData,
  };
}
