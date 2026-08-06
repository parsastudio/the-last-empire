import { NextResponse } from "next/server";
import { FinalMapPipeline } from "@/infrastructure/map-preprocessing/final/final-map-pipeline";
import { ClientFinalStateLoader } from "@/infrastructure/storage/client-final-state-loader";

export async function POST(): Promise<NextResponse> {
  try {
    ClientFinalStateLoader.clearCache();
    const pipeline = new FinalMapPipeline();
    const result = await pipeline.buildFinalAssets("map1", 4096, 2048);
    ClientFinalStateLoader.clearCache();

    return NextResponse.json({
      success: true,
      message: "فایل‌های باینری جدید نقشه و اقلیم‌ها با موفقیت بازتولید شدند.",
      byteLength: result.byteLength,
      timestamp: Date.now(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "خطا در تولید فایل‌ها";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
