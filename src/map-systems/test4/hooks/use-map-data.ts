import { useEffect, useState } from "react";
import type { ApiResponse } from "../engine/types";

export function useMapData() {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/map-test4");
        const json = (await res.json()) as ApiResponse;
        if (json.success) {
          setData(json);
        } else {
          setError(json.error || "Failed to process map data.");
        }
      } catch {
        setError("Error fetching map data from local server API.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return { data, loading, error };
}
