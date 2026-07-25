import React, { useState, useCallback } from "react";
import type { GridCell } from "@/domain/map/grid.schema";

interface UseMapInteractionProps {
  grid: GridCell[][] | null;
  gridWidth: number;
  gridHeight: number;
}

export function useMapInteraction({
  grid,
  gridWidth,
  gridHeight,
}: UseMapInteractionProps) {
  const [hoveredNationId, setHoveredNationId] = useState<string | null>(null);
  const [selectedNationId, setSelectedNationId] = useState<string | null>(null);

  const getCellFromEvent = useCallback(
    (
      e: React.MouseEvent<HTMLCanvasElement>,
      canvasElement: HTMLCanvasElement,
    ): GridCell | null => {
      if (!grid) return null;

      const rect = canvasElement.getBoundingClientRect();
      const scaleX = gridWidth / rect.width;
      const scaleY = gridHeight / rect.height;

      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      const gridX = Math.floor(clientX * scaleX);
      const gridY = Math.floor(clientY * scaleY);

      if (gridX >= 0 && gridX < gridWidth && gridY >= 0 && gridY < gridHeight) {
        const row = grid[gridY];
        if (row) {
          return row[gridX] || null;
        }
      }
      return null;
    },
    [grid, gridWidth, gridHeight],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = e.currentTarget;
      const cell = getCellFromEvent(e, canvas);
      if (cell && cell.type === "LAND") {
        setHoveredNationId(cell.ownerId);
      } else {
        setHoveredNationId(null);
      }
    },
    [getCellFromEvent],
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredNationId(null);
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = e.currentTarget;
      const cell = getCellFromEvent(e, canvas);
      if (cell && cell.type === "LAND" && cell.ownerId) {
        setSelectedNationId(cell.ownerId);
      }
    },
    [getCellFromEvent],
  );

  return {
    hoveredNationId,
    selectedNationId,
    setHoveredNationId,
    setSelectedNationId,
    handleMouseMove,
    handleMouseLeave,
    handleClick,
  };
}
