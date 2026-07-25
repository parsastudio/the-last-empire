import React from "react";
import type { Province } from "@/domain/map/province.schema";

interface NetworkConnectionLinesProps {
  targetProvs: Province[];
}

export function NetworkConnectionLines({
  targetProvs,
}: NetworkConnectionLinesProps) {
  return (
    <>
      {targetProvs.map((p) =>
        p.neighbors.map((nId) => {
          const targetProv = targetProvs.find((tp) => tp.id === nId);
          if (targetProv && p.id < nId) {
            return (
              <line
                key={`line-${p.id}-${nId}`}
                x1={p.x}
                y1={p.y}
                x2={targetProv.x}
                y2={targetProv.y}
                stroke="rgba(16, 185, 129, 0.45)"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
            );
          }
          return null;
        }),
      )}
    </>
  );
}
