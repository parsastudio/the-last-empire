import { NextResponse } from "next/server";
import { SimulationFacade } from "@/application/map-rendering/simulation-facade";
import { GameAction } from "@/domain/game/action.schema";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const action = (await request.json()) as GameAction;

    if (!action || !action.type || !action.nationId) {
      return NextResponse.json(
        { success: false, message: "پارامترهای اکشن ناقص است." },
        { status: 400 },
      );
    }

    const facade = new SimulationFacade();
    const currentState = facade.getActiveSessionState();

    if (!currentState) {
      return NextResponse.json(
        { success: false, message: "هیچ نشست فعال بازی یافت نشد." },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message: `دستور ${action.type} با موفقیت ثبت شد.`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "خطای داخلی سیستم";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
