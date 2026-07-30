import { NextResponse } from "next/server";
import { PngDecoder } from "@/infrastructure/map-preprocessing/encoders/png-decoder";
import { MapPathResolver } from "@/infrastructure/map-preprocessing/map-path-resolver";
import {
  ALL_COUNTRY_PROFILES,
  findCountryProfileById,
} from "@/infrastructure/data/countries";
import { CountryPaletteGenerator } from "@/infrastructure/map-preprocessing/shader/country-palette-generator";

export async function GET(): Promise<NextResponse> {
  try {
    const editedMaskPath = MapPathResolver.getEditedMaskServerPath();
    const decoded = await PngDecoder.decodeIndexedPng(
      editedMaskPath,
      4096,
      2048,
    );

    if (!decoded) {
      return NextResponse.json(
        {
          success: false,
          error: "edited-mask.png not found or decoding failed",
        },
        { status: 404 },
      );
    }

    const buffer = decoded.buffer;
    const width = decoded.width;
    const height = decoded.height;

    const pixelHistogram = new Map<number, number>();
    for (let i = 0; i < buffer.length; i++) {
      const val = buffer[i]!;
      pixelHistogram.set(val, (pixelHistogram.get(val) || 0) + 1);
    }

    const uniquePngIds = Array.from(pixelHistogram.keys()).sort(
      (a, b) => a - b,
    );

    const profilesWithAutoId = ALL_COUNTRY_PROFILES.map((p, idx) => ({
      autoId: idx + 11,
      code: p.code,
      flagCode: p.flagCode,
      nameFa: p.nameFa,
      pixelCountInPng: pixelHistogram.get(idx + 11) || 0,
    }));

    const unmappedPngIds: {
      id: number;
      pixelCount: number;
      profileByIdName?: string;
    }[] = [];
    const mappedPngIds: {
      id: number;
      pixelCount: number;
      matchedCode?: string;
      matchedName?: string;
    }[] = [];

    for (const id of uniquePngIds) {
      if (id === 0 || id === 254 || id >= 250) continue;

      const count = pixelHistogram.get(id) || 0;
      const profileByInd = ALL_COUNTRY_PROFILES[id - 11];
      const profileById = findCountryProfileById(id);

      if (!profileByInd) {
        unmappedPngIds.push({
          id,
          pixelCount: count,
          profileByIdName: profileById ? profileById.nameFa : "UNKNOWN",
        });
      } else {
        mappedPngIds.push({
          id,
          pixelCount: count,
          matchedCode: profileByInd.code,
          matchedName: profileByInd.nameFa,
        });
      }
    }

    const countriesList = ALL_COUNTRY_PROFILES.map((p, idx) => ({
      id: idx + 11,
      code: p.code,
      name: p.nameFa,
      color: [0, 0, idx + 11] as [number, number, number],
    }));

    const paletteGen = new CountryPaletteGenerator();
    const generatedPalette = paletteGen.generatePalette(countriesList);

    const missingPalettePngIds: number[] = [];
    for (const id of uniquePngIds) {
      if (id >= 11 && id < 250 && !generatedPalette[id]) {
        missingPalettePngIds.push(id);
      }
    }

    return NextResponse.json({
      success: true,
      maskDimensions: { width, height, totalPixels: buffer.length },
      totalUniquePngIds: uniquePngIds.length,
      allUniquePngIds: uniquePngIds,
      unmappedPngIdsCount: unmappedPngIds.length,
      unmappedPngIdsDetails: unmappedPngIds,
      missingPalettePngIds,
      sampleMappedPngIds: mappedPngIds.slice(0, 20),
      zeroPixelAutoIdProfilesCount: profilesWithAutoId.filter(
        (p) => p.pixelCountInPng === 0,
      ).length,
      zeroPixelAutoIdProfiles: profilesWithAutoId.filter(
        (p) => p.pixelCountInPng === 0,
      ),
      summary: {
        issueDetected:
          missingPalettePngIds.length > 0 || unmappedPngIds.length > 0,
        diagnosis:
          missingPalettePngIds.length > 0
            ? "PNG contains pixel IDs that are missing from the generated palette or profile AutoIDs, causing default white rendering."
            : "All PNG IDs matched palette successfully.",
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Diagnostic test failed";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
