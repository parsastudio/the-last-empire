import { NextResponse } from "next/server";
import { GridStateProvider } from "@/engine/combat/state/grid-state-provider";
import { BattleValidationFacade } from "@/engine/combat/validation/battle-validation-facade";
import { MapDataProvider } from "@/engine/combat/state/map-data-provider";
import { LowResPacker } from "@/application/map-rendering/utils/low-res-packer";
import { GridCell } from "@/domain/map/grid-cell.schema";
import { NationIdResolver } from "@/domain/shared/nation-id-resolver";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as {
      attackerId?: string;
      x?: number;
      y?: number;
    };
    const { attackerId, x, y } = body;

    if (!attackerId || x === undefined || y === undefined) {
      return NextResponse.json(
        { success: false, error: "پارامترهای ورودی کامل نیستند." },
        { status: 400 },
      );
    }

    const canonicalAttackerId = NationIdResolver.resolveCanonicalId(attackerId);

    const scaledX = x > 1024 ? Math.floor(x / 4) : x;
    const scaledY = y > 512 ? Math.floor(y / 4) : y;

    const gridState = GridStateProvider.getInstance();

    if (gridState.getAllCells().length === 0) {
      const mapProvider = new MapDataProvider();
      const packedBuffer = await mapProvider.load1024PackedBuffer();

      if (packedBuffer && packedBuffer.length === 1024 * 512 * 2) {
        for (let gy = 0; gy < 512; gy++) {
          for (let gx = 0; gx < 1024; gx++) {
            const pIdx = (gy * 1024 + gx) * 2;
            const geoByte = packedBuffer[pIdx] || 0;
            const nationByte = packedBuffer[pIdx + 1] || 0;
            const enclaveId = geoByte >> 2;

            let ownerId = "WATER";
            if (nationByte >= 11) {
              ownerId = `NATION_${nationByte}`;
            } else if ((geoByte & 0x3) === 2) {
              ownerId = "CLOSED_SEA";
            }

            const cell: GridCell = {
              x: gx,
              y: gy,
              ownerId,
              isOccupied: false,
              occupierId: null,
              highResPixelCount: nationByte >= 11 ? 16 : 0,
              enclaveId,
              seaAccess: geoByte & 0x3,
            };
            gridState.setCell(gx, gy, cell);
          }
        }
      } else {
        const rawBuffer = await mapProvider.loadRawMaskBuffer();
        if (rawBuffer && rawBuffer.length === 4096 * 2048) {
          const packer = new LowResPacker();
          const generatedPacked = packer.pack4KTo1024(rawBuffer, 1024, 512, 4);
          for (let gy = 0; gy < 512; gy++) {
            for (let gx = 0; gx < 1024; gx++) {
              const pIdx = (gy * 1024 + gx) * 2;
              const geoByte = generatedPacked[pIdx] || 0;
              const nationByte = generatedPacked[pIdx + 1] || 0;
              const enclaveId = geoByte >> 2;

              let ownerId = "WATER";
              if (nationByte >= 11) {
                ownerId = `NATION_${nationByte}`;
              } else if ((geoByte & 0x3) === 2) {
                ownerId = "CLOSED_SEA";
              }

              const cell: GridCell = {
                x: gx,
                y: gy,
                ownerId,
                isOccupied: false,
                occupierId: null,
                highResPixelCount: nationByte >= 11 ? 16 : 0,
                enclaveId,
                seaAccess: geoByte & 0x3,
              };
              gridState.setCell(gx, gy, cell);
            }
          }
        }
      }
    }

    const validator = new BattleValidationFacade();
    const result = validator.validateAttackForUI(
      canonicalAttackerId,
      { x: scaledX, y: scaledY },
      gridState,
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "خطای داخلی سیستم";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
