import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

interface CountryMapping {
  id: number;
  code: string;
  name: string;
  areaSqKm: number;
}

interface MappingsJson {
  countries?: CountryMapping[];
}

interface SimplifiedCountry {
  id: number;
  code: string;
  name: string;
}

export async function GET(): Promise<NextResponse> {
  try {
    const publicDir = path.join(process.cwd(), "public");
    const partitionedPath = path.join(
      publicDir,
      "partition-mask",
      "mappings.json",
    );

    const fileContent = await fs.readFile(partitionedPath, "utf-8");
    const parsed = JSON.parse(fileContent) as MappingsJson;
    const list = parsed.countries || [];

    const simplifiedList: SimplifiedCountry[] = list
      .filter((c) => c.id > 0)
      .map((c) => ({
        id: c.id,
        code: c.code,
        name: c.name,
      }));

    return NextResponse.json({
      success: true,
      countries: simplifiedList,
    });
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : "Failed to load countries summary";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
