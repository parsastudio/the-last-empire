import { useState } from "react";

interface CountryMapping {
  id: number;
  code: string;
  name: string;
  areaSqKm: number;
}

interface PartitionMetrics {
  readTimeMs: number;
  partitionTimeMs: number;
  areaRecalcTimeMs: number;
  writeTimeMs: number;
  totalTimeMs: number;
}

export function useMapGeneratorHandlers(
  setCountries: (c: CountryMapping[]) => void,
  setIsCached: (c: boolean) => void,
  setMapType: (m: "default" | "edited" | "partition") => void,
) {
  const [status, setStatus] = useState<
    "idle" | "generating" | "success" | "error"
  >("idle");
  const [partitionStatus, setPartitionStatus] = useState<
    "idle" | "compiling" | "success" | "error"
  >("idle");
  const [partitionMetrics, setPartitionMetrics] =
    useState<PartitionMetrics | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  const handleGenerate = async () => {
    setStatus("generating");
    setErrorMessage("");
    try {
      const res = await fetch("/api/map-generator?rebuild=true", {
        method: "GET",
        headers: { pragma: "no-cache", "cache-control": "no-cache" },
      });
      const json = await res.json();
      if (json.success) {
        setCountries(json.data.countries || []);
        setIsCached(false);
        setStatus("success");
        setMapType("default");
      } else {
        setStatus("error");
        setErrorMessage(json.error || "Generation process failed");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Network communication error during 4K build");
    }
  };

  const handlePartitionCompile = async (source: "default" | "edited") => {
    setPartitionStatus("compiling");
    setErrorMessage("");
    try {
      const res = await fetch(`/api/map-generator/partition?source=${source}`, {
        method: "POST",
      });
      const json = await res.json();
      if (json.success) {
        setCountries(json.data.countries || []);
        setPartitionMetrics(json.metrics || null);
        setMapType("partition");
        setPartitionStatus("success");
      } else {
        setPartitionStatus("error");
        setErrorMessage(json.error || "Symmetric partition process failed");
      }
    } catch {
      setPartitionStatus("error");
      setErrorMessage(
        "Network communication error during dynamic partition compiler",
      );
    }
  };

  return {
    status,
    partitionStatus,
    partitionMetrics,
    errorMessage,
    isImporting,
    setIsImporting,
    handleGenerate,
    handlePartitionCompile,
  };
}
