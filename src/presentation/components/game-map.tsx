"use client";

import React, { useRef, useEffect } from "react";
import type { GridCell } from "@/domain/map/grid.schema";

interface GameMapProps {
  grid: GridCell[][];
  width: number;
  height: number;
  hoveredNationId: string | null;
  selectedNationId: string | null;
  onMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseLeave: () => void;
  onClick: (e: React.MouseEvent<HTMLCanvasElement>) => void;
}

export function GameMap({
  grid,
  width,
  height,
  hoveredNationId,
  selectedNationId,
  onMouseMove,
  onMouseLeave,
  onClick,
}: GameMapProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const renderWidth = 1200;
  const renderHeight = 600;
  const scaleX = renderWidth / width;
  const scaleY = renderHeight / height;

  const getNationColor = (
    ownerId: string | null,
    isHovered: boolean,
    isSelected: boolean,
  ): string => {
    if (!ownerId) return "rgb(15, 23, 42)";
    let hash = 0;
    for (let i = 0; i < ownerId.length; i++) {
      hash = ownerId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const r = (Math.abs((hash & 0xff0000) >> 16) % 180) + 50;
    const g = (Math.abs((hash & 0x00ff00) >> 8) % 180) + 50;
    const b = (Math.abs(hash & 0x0000ff) % 180) + 50;

    if (isSelected) {
      return `rgb(${Math.min(255, r + 70)}, ${Math.min(255, g + 70)}, 255)`;
    }
    if (isHovered) {
      return `rgb(${Math.min(255, r + 45)}, ${Math.min(255, g + 45)}, ${Math.min(255, b + 45)})`;
    }
    return `rgb(${r}, ${g}, ${b})`;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, renderWidth, renderHeight);

    for (let y = 0; y < height; y++) {
      const row = grid[y];
      if (!row) continue;
      for (let x = 0; x < width; x++) {
        const cell = row[x];
        if (!cell) continue;

        if (cell.type === "SEA") {
          ctx.fillStyle = "rgb(10, 15, 30)";
        } else {
          const isHovered = cell.ownerId === hoveredNationId;
          const isSelected = cell.ownerId === selectedNationId;
          ctx.fillStyle = getNationColor(cell.ownerId, isHovered, isSelected);
        }
        ctx.fillRect(x * scaleX, y * scaleY, scaleX, scaleY);
      }
    }
  }, [grid, width, height, hoveredNationId, selectedNationId, scaleX, scaleY]);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-slate-950 p-4 rounded-3xl border border-slate-800/80 shadow-2xl shadow-emerald-950/20">
      <div className="relative w-full aspect-[2/1] max-w-5xl">
        <canvas
          ref={canvasRef}
          width={renderWidth}
          height={renderHeight}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
          onClick={onClick}
          className="w-full h-full object-cover cursor-crosshair"
          style={{
            filter: "url(#organic-map-borders)",
          }}
        />
      </div>

      <svg className="absolute w-0 h-0 invisible">
        <defs>
          <filter id="organic-map-borders">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="6.5"
              result="blur"
            />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 35 -15"
            />
          </filter>
        </defs>
      </svg>
    </div>
  );
}
