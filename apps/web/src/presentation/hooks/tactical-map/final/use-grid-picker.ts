import { useCallback } from "react";
import { BitPackedGridState } from "@/engine/combat/final/bit-packed-grid-state";
import { CameraPosition } from "@/presentation/hooks/tactical-map/final/map-camera-transform";
import { BitPackedCellUtility } from "@/domain/map/bit-packed-cell.utility";

interface GridPickResult {
  provinceId: number;
}

export function useGridPicker() {
  const pickAtScreenPos = useCallback(
    (
      rx: number,
      ry: number,
      pos: CameraPosition,
      scale: number,
    ): GridPickResult => {
      if (scale <= 0) {
        return { provinceId: 0 };
      }

      const mapX = Math.floor((rx - pos.x) / scale);
      const mapY = Math.floor((ry - pos.y) / scale);

      if (mapX < 0 || mapX >= 4096 || mapY < 0 || mapY >= 2048) {
        return { provinceId: 0 };
      }

      const buffer = BitPackedGridState.getInstance().getBuffer();
      const rawPixel = buffer.getPixel(mapX, mapY);
      const provinceId = BitPackedCellUtility.getProvinceId(rawPixel);

      return { provinceId };
    },
    [],
  );

  return { pickAtScreenPos };
}
