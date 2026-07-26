import { useState, useCallback } from "react";
import { Coordinate } from "@/domain/map/coordinate.schema";
import { PixelSelectionDetector } from "@/application/map-rendering/pixel-selection-detector";
import { BattleValidationFacade } from "@/engine/combat/validation/battle-validation-facade";
import { GridState } from "@/engine/combat/state/grid-state";
import { BattleValidationResult } from "@/engine/combat/validation/battle-validation-result.schema";

export function useGridConquestInteraction(
  gridState: GridState,
  mapWidth: number,
  mapHeight: number,
) {
  const [detector] = useState(() => new PixelSelectionDetector());
  const [validator] = useState(() => new BattleValidationFacade());
  const [hoveredCell, setHoveredCell] = useState<Coordinate | null>(null);
  const [validation, setValidation] = useState<BattleValidationResult | null>(
    null,
  );

  const handlePointerHover = useCallback(
    (
      clientX: number,
      clientY: number,
      rect: DOMRect,
      position: { x: number; y: number },
      scale: number,
      attackerId: string,
    ) => {
      const coord = detector.detectGridCellCoordinate(
        clientX,
        clientY,
        rect,
        position,
        scale,
        mapWidth,
        mapHeight,
        4,
      );

      setHoveredCell(coord);

      const result = validator.validateAttackForUI(
        attackerId,
        coord,
        gridState,
      );
      setValidation(result);
    },
    [gridState, detector, validator, mapWidth, mapHeight],
  );

  return {
    hoveredCell,
    validation,
    handlePointerHover,
    clearHover: () => {
      setHoveredCell(null);
      setValidation(null);
    },
  };
}
