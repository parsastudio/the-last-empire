"use client";

import React, { useState, useEffect, useRef } from "react";
import { MapGeneratorHeader } from "@/presentation/components/map-generator/map-generator-header";
import { CompilationCard } from "@/presentation/components/map-generator/compilation-card";
import { PartitionCard } from "@/presentation/components/map-generator/partition-card";
import { EditorCard } from "@/presentation/components/map-generator/editor-card";
import { InsightsCard } from "@/presentation/components/map-generator/insights-card";
import { TerritoryDatabase } from "@/presentation/components/map-generator/territory-database";

interface CountryMapping {
  id: number;
  code: string;
  name: string;
  areaSqKm: number;
}

export default function MapGeneratorPage() {
  const [status, setStatus] = useState<
    "idle" | "generating" | "success" | "error"
  >("idle");
  const [partitionStatus, setPartitionStatus] = useState<
    "idle" | "compiling" | "success" | "error"
  >("idle");
  const [countries, setCountries] = useState<CountryMapping[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCached, setIsCached] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [mapType, setMapType] = useState<"default" | "edited" | "partition">(
    "default",
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        let apiPath = "/api/map-generator";
        if (mapType === "edited") {
          apiPath = "/api/map-generator?type=edited";
        } else if (mapType === "partition") {
          const res = await fetch("/api/map-generator");
          const json = await res.json();
          if (active && json.success) {
            try {
              const resPart = await fetch("/partition-mask/mappings.json");
              const jsonPart = await resPart.json();
              if (active) {
                setCountries(jsonPart.countries || []);
                setIsCached(true);
              }
              return;
            } catch {
              if (active) {
                setCountries([]);
                setIsCached(false);
              }
              return;
            }
          }
        }
        const res = await fetch(apiPath);
        const json = await res.json();
        if (active && json.success) {
          setCountries(json.data.countries || []);
          setIsCached(!!json.cached);
        } else if (
          active &&
          !json.success &&
          (mapType === "edited" || mapType === "partition")
        ) {
          setCountries([]);
          setIsCached(false);
        }
      } catch {
        if (active) {
          setErrorMessage("Failed to check active map status");
        }
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [mapType]);

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

  const handleExportFlatMap = () => {
    const img = new Image();
    let srcPath = "/test6/world-mask.png";
    if (mapType === "edited") {
      srcPath = "/edited-mask/world-mask.png";
    } else if (mapType === "partition") {
      srcPath = "/partition-mask/world-mask.png";
    }
    img.src = srcPath;
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 4096;
      canvas.height = 2048;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, 4096, 2048);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const b = data[i + 2];
        if (b !== undefined && b >= 11) {
          data[i] = 150 + ((b * 7) % 105);
          data[i + 1] = 100 + ((b * 13) % 120);
          data[i + 2] = b;
        } else if (b !== undefined) {
          data[i] = 20;
          data[i + 1] = 30;
          data[i + 2] = b;
        }
      }
      ctx.putImageData(imgData, 0, 0);
      const link = document.createElement("a");
      link.download = "world-flat-edit.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
  };

  const handleImportFlatMap = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = async () => {
        const canvas = document.createElement("canvas");
        canvas.width = 4096;
        canvas.height = 2048;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          setIsImporting(false);
          return;
        }
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, 4096, 2048);
        const data = imgData.data;
        const raw = new Uint8Array(4096 * 2048);
        for (let i = 0; i < raw.length; i++) {
          raw[i] = data[i * 4 + 2] || 0;
        }
        try {
          const res = await fetch("/api/map-generator/import-raw", {
            method: "POST",
            headers: {
              "Content-Type": "application/octet-stream",
            },
            body: raw,
          });
          const json = await res.json();
          if (json.success) {
            setMapType("edited");
            window.location.reload();
          } else {
            alert(json.error || "Import failed");
          }
        } catch {
          alert("Network error during import");
        } finally {
          setIsImporting(false);
        }
      };
    };
    reader.readAsDataURL(file);
  };

  const totalArea = countries.reduce((acc, c) => acc + c.areaSqKm, 0);
  const statesCount = countries.length > 0 ? countries.length - 1 : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans text-left flex flex-col">
      <MapGeneratorHeader
        isCached={isCached}
        mapType={mapType}
        onMapTypeChange={setMapType}
      />

      <main className="max-w-7xl mx-auto px-6 py-8 flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
        <div className="lg:col-span-1 space-y-6">
          <CompilationCard status={status} onGenerate={handleGenerate} />

          <PartitionCard
            partitionStatus={partitionStatus}
            errorMessage={errorMessage}
            onPartitionCompile={handlePartitionCompile}
          />

          <EditorCard
            isImporting={isImporting}
            fileInputRef={fileInputRef}
            onExport={handleExportFlatMap}
            onImport={handleImportFlatMap}
          />

          <InsightsCard statesCount={statesCount} totalArea={totalArea} />
        </div>

        <TerritoryDatabase
          countries={countries}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </main>
    </div>
  );
}
