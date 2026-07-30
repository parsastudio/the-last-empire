import { NextResponse } from "next/server";
import { GridStateProvider } from "@/engine/combat/state/grid-state-provider";
import { BattleValidationFacade } from "@/engine/combat/validation/battle-validation-facade";
import { GridLoaderService } from "@/engine/combat/state/grid-loader.service";
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
    await GridLoaderService.ensureGridLoaded(gridState);

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
