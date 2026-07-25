import React from "react";

interface TacticalAssaultLaserProps {
  vector: {
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
  };
}

export function TacticalAssaultLaser({ vector }: TacticalAssaultLaserProps) {
  return (
    <g>
      <style>{`
        @keyframes tacticalDash {
          to {
            stroke-dashoffset: -20;
          }
        }
        .tactical-assault-laser {
          animation: tacticalDash 1.2s linear infinite;
        }
      `}</style>
      <path
        d={`M ${vector.fromX},${vector.fromY} Q ${(vector.fromX + vector.toX) / 2},${Math.min(vector.fromY, vector.toY) - 80} ${vector.toX},${vector.toY}`}
        fill="none"
        stroke="rgb(244, 63, 94)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeDasharray="6 4"
        className="tactical-assault-laser"
        filter="drop-shadow(0 0 4px rgb(244, 63, 94))"
      />
      <circle
        cx={vector.fromX}
        cy={vector.fromY}
        r="6"
        fill="rgb(16, 185, 129)"
        className="animate-ping"
      />
      <circle
        cx={vector.toX}
        cy={vector.toY}
        r="8"
        fill="none"
        stroke="rgb(244, 63, 94)"
        strokeWidth="2"
        className="animate-ping"
      />
    </g>
  );
}
