import { useCallback } from "react";
import { BitPackedGridState } from "@/engine/combat/final/bit-packed-grid-state";
import { CameraPosition } from "./map-camera-transform";

interface GridPickResult {
  nationId: number;
  enclaveId: number;
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
        return { nationId: 0, enclaveId: 0 };
      }

      const mapX = Math.floor((rx - pos.x) / scale);
      const mapY = Math.floor((ry - pos.y) / scale);

      if (mapX < 0 || mapX >= 4096 || mapY < 0 || mapY >= 2048) {
        return { nationId: 0, enclaveId: 0 };
      }

      const buffer = BitPackedGridState.getInstance().getBuffer();
      const nationId = buffer.getNationId(mapX, mapY);

      if (nationId < 11 || nationId >= 250) {
        return { nationId: 0, enclaveId: 0 };
      }

      const enclaveId = buffer.getEnclaveId(mapX, mapY);
      return { nationId, enclaveId };
    },
    [],
  );

  return { pickAtScreenPos };
}
