import { NextResponse } from "next/server";
import { FinalMapPipeline } from "@/infrastructure/map-preprocessing/final/final-map-pipeline";

export async function POST(): Promise<NextResponse> {
  try {
    const pipeline = new FinalMapPipeline();
    const result = await pipeline.buildFinalAssets("map1", 4096, 2048);

    return NextResponse.json({
      success: true,
      message: "فایل‌های نهایی نقشه جدید با موفقیت تولید و ذخیره شدند.",
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
