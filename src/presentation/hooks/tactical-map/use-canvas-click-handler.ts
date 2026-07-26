import { useCallback, RefObject } from "react";
import { GridCombatBridge } from "@/application/map-rendering/grid-combat-bridge";

interface UseCanvasClickHandlerProps {
  isDragging: boolean;
  hoveredCountry: { id: number; code: string; name: string } | null;
  dataLoading: boolean;
  canvasDestRef: RefObject<HTMLCanvasElement | null>;
  position: { x: number; y: number };
  scale: number;
  mapWidth: number;
  mapHeight: number;
  playerNationId: string | null;
  bridge: GridCombatBridge;
  onSelectPending: (pending: { id: string; name: string } | null) => void;
  onExecuteAttack: (
    targetCode: string,
    gridCoord: { x: number; y: number },
  ) => void;
}

export function useCanvasClickHandler({
  isDragging,
  hoveredCountry,
  dataLoading,
  canvasDestRef,
  position,
  scale,
  mapWidth,
  mapHeight,
  playerNationId,
  bridge,
  onSelectPending,
  onExecuteAttack,
}: UseCanvasClickHandlerProps) {
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isDragging || !hoveredCountry || dataLoading) {
        return;
      }

      const rect = canvasDestRef.current?.getBoundingClientRect();
      if (!rect) return;

      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      const fx = mapWidth / rect.width;
      const fy = mapHeight / rect.height;

      const mapX = Math.floor(((clientX - position.x) / scale) * fx);
      const mapY = Math.floor(((clientY - position.y) / scale) * fy);

      const gridCoord = bridge.mapHighResToGridCell({ x: mapX, y: mapY });

      if (!playerNationId) {
        onSelectPending({ id: hoveredCountry.code, name: hoveredCountry.name });
      } else if (hoveredCountry.code !== playerNationId) {
        onExecuteAttack(hoveredCountry.code, gridCoord);
      }
    },
    [
      isDragging,
      hoveredCountry,
      dataLoading,
      canvasDestRef,
      position,
      scale,
      mapWidth,
      mapHeight,
      playerNationId,
      bridge,
      onSelectPending,
      onExecuteAttack,
    ],
  );

  return handleCanvasClick;
}
