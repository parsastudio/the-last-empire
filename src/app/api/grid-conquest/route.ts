import { NextResponse } from "next/server";
import { GridStateProvider } from "@/engine/combat/state/grid-state-provider";
import { BattleValidationFacade } from "@/engine/combat/validation/battle-validation-facade";
import { GridLoaderService } from "@/engine/combat/state/grid-loader.service";
import { NationIdResolver } from "@/domain/shared/nation-id-resolver";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as {
      attackerId?: string;
      targetCode?: string;
      targetNationId?: string;
      x?: number;
      y?: number;
    };
    const { attackerId, targetCode, targetNationId, x, y } = body;

    if (!attackerId || x === undefined || y === undefined) {
      return NextResponse.json(
        { success: false, error: "پارامترهای ورودی کامل نیستند." },
        { status: 400 },
      );
    }

    const canonicalAttackerId = NationIdResolver.resolveCanonicalId(attackerId);
    const resolvedTargetCode = targetCode || targetNationId || "";
    const canonicalTargetId = resolvedTargetCode
      ? NationIdResolver.resolveCanonicalId(resolvedTargetCode)
      : "";

    const scaledX = Math.floor(x / 4);
    const scaledY = Math.floor(y / 4);

    const gridState = GridStateProvider.getInstance();
    await GridLoaderService.ensureGridLoaded(gridState);

    const validator = new BattleValidationFacade();
    const result = validator.validateAttackForUI(
      canonicalAttackerId,
      canonicalTargetId,
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
