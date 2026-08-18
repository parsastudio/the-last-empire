import { NextResponse } from "next/server";
import { QuadtreeExportService } from "@/infrastructure/quadtree-map/generator/quadtree-export-service";

export async function POST() {
  try {
    const result = await QuadtreeExportService.generateFromLiveState("map1");
    return NextResponse.json({
      success: true,
      message: "فایل کواد‌تری با موفقیت در کنار باینری اصلی ساخته شد.",
      result,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "خطا در ساخت ساختار کواد‌تری";
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  return POST();
}
