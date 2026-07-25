import { useState, useCallback, useMemo } from "react";
import { GridGenerator } from "../engine/grid-generator";
import type { GeoJsonData, VectorProvince } from "../engine/grid-generator";
import type { Province } from "@/domain/map/province.schema";

export function useMapLoader() {
  const [vectorProvinces, setVectorProvinces] = useState<
    VectorProvince[] | null
  >(null);
  const [provinces, setProvinces] = useState<Record<string, Province> | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const generator = useMemo(() => new GridGenerator(), []);

  const loadMapFromData = useCallback(
    async (geoJson: GeoJsonData, width: number, height: number) => {
      setLoading(true);
      setError(null);
      try {
        const payload = generator.generateVectorMap(geoJson, width, height);
        setVectorProvinces(payload.vectorProvinces);
        setProvinces(payload.provinces);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Map conversion failed");
      } finally {
        setLoading(false);
      }
    },
    [generator],
  );

  return {
    vectorProvinces,
    provinces,
    loading,
    error,
    loadMapFromData,
  };
}
