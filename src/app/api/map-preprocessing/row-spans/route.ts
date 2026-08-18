import { NextResponse } from "next/server";
import { RowSpansExportService } from "@/infrastructure/row-spans-map/generator/row-spans-export-service";

export async function POST() {
  try {
    const result = await RowSpansExportService.generateFromLiveState("map1");
    return NextResponse.json({
      success: true,
      message: "فایل باینری سطری با موفقیت تولید و صحت آن ارزیابی شد.",
      result,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "خطا در ساخت ساختار باینری سطری";
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
