import React from "react";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { EspionageExecutionResult } from "@/domain/espionage/espionage.schema";
import { ReconResultView } from "@/presentation/components/tactical-map/command-center/views/espionage/components/recon-result-view";
import { SabotageResultView } from "@/presentation/components/tactical-map/command-center/views/espionage/components/sabotage-result-view";
import { TechTheftResultView } from "@/presentation/components/tactical-map/command-center/views/espionage/components/tech-theft-result-view";

export function EspionageResultBanner({
  result,
}: {
  result: EspionageExecutionResult;
}) {
  const isSuccess = result.outcome !== "CRITICAL_FAILURE";
  const isClean = result.outcome === "CLEAN_SUCCESS";

  return (
    <div
      className={`p-4 rounded-3xl border space-y-3.5 animate-in fade-in duration-200 dir-rtl text-right ${
        isClean
          ? "bg-emerald-500/10 border-emerald-500/40 text-foreground"
          : isSuccess
            ? "bg-amber-500/10 border-amber-500/40 text-foreground"
            : "bg-rose-500/10 border-rose-500/40 text-foreground"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isClean ? (
            <CheckCircle2 size={18} className="text-emerald-500" />
          ) : isSuccess ? (
            <AlertTriangle size={18} className="text-amber-500" />
          ) : (
            <XCircle size={18} className="text-rose-500" />
          )}
          <span className="text-xs font-black">
            {isClean
              ? "موفقیت کامل و بدون ردپا (Clean Hit)"
              : isSuccess
                ? "موفقیت عملیات همراه با ردیابی منشأ"
                : "شکست عملیات و مداخله ضدجاسوسی"}
          </span>
        </div>

        <span className="text-[9px] font-mono bg-background/80 px-2 py-0.5 rounded-lg border border-border/40 text-muted-foreground">
          {result.targetName}
        </span>
      </div>

      <p className="text-xs leading-relaxed font-sans">{result.message}</p>

      {result.reconData && <ReconResultView data={result.reconData} />}
      {result.sabotageData && <SabotageResultView data={result.sabotageData} />}
      {result.techTheftData && (
        <TechTheftResultView data={result.techTheftData} />
      )}
    </div>
  );
}
