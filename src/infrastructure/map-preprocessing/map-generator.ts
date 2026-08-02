import fs from "fs/promises";
import path from "path";
import { MapAreaPixelCounter } from "@/infrastructure/map-preprocessing/generator/map-area-pixel-counter";
import { LowResPacker } from "@/infrastructure/map-preprocessing/utils/low-res-packer";
import { ClosedSeaDetector } from "@/infrastructure/map-preprocessing/utils/closed-sea-detector";
import { MapPathResolver } from "@/infrastructure/map-preprocessing/map-path-resolver";
import { TerritoryPartitioner } from "@/infrastructure/map-preprocessing/generator/territory-partitioner";
import { PngDecoder } from "@/infrastructure/map-preprocessing/encoders/png-decoder";
import { GeometryDraw } from "@/infrastructure/map-preprocessing/utils/geometry-draw";
import { ALL_COUNTRY_PROFILES } from "@/domain/data/countries";

export interface CountryMapping {
  id: number;
  code: string;
  name: string;
  color: [number, number, number];
  areaSqKm: number;
}

export async function generateTest6Map(
  width: number,
  height: number,
): Promise<{ countries: CountryMapping[] }> {
  const targetDir = MapPathResolver.getMapServerDir("map1");
  await fs.mkdir(targetDir, { recursive: true });

  const editedMaskPath = MapPathResolver.getEditedMaskServerPath();
  const decodedMask = await PngDecoder.decodeIndexedPng(
    editedMaskPath,
    width,
    height,
  );

  if (!decodedMask || decodedMask.buffer.length !== width * height) {
    throw new Error(
      "فایل ماسک ادیت‌شده (edited-mask.png) یافت نشد یا ابعاد آن با ۴۰۹۶×۲۰۴۸ مطابقت ندارد.",
    );
  }

  const areaCounter = new MapAreaPixelCounter();
  const partitioner = new TerritoryPartitioner();
  const geometryDraw = new GeometryDraw();

  const activeIdToCodeMap = new Map<number, string>();

  const countries: CountryMapping[] = [
    {
      id: 0,
      code: "WATER",
      name: "Ocean",
      color: [0, 0, 0],
      areaSqKm: 0,
    },
  ];

  for (const profile of ALL_COUNTRY_PROFILES) {
    const profileId = profile.id ?? 0;
    if (profileId > 0) {
      countries.push({
        id: profileId,
        code: profile.code,
        name: profile.nameFa,
        color: [0, 0, profileId],
        areaSqKm: 0,
      });
      activeIdToCodeMap.set(profileId, profile.code);
    }
  }

  const buffer = new Uint8Array(width * height);
  buffer.set(decodedMask.buffer);

  partitioner.partitionBuffer(buffer, width, height, activeIdToCodeMap);

  geometryDraw.drawWaterLine(2414, 676, 2419, 687, buffer, width, height, 254);
  geometryDraw.drawWaterLine(1136, 915, 1145, 925, buffer, width, height, 254);
  geometryDraw.drawWaterLine(2688, 720, 2692, 725, buffer, width, height, 254);
  geometryDraw.drawWaterLine(2538, 878, 2542, 882, buffer, width, height, 254);

  const maxId = Math.max(...countries.map((c) => c.id), 255) + 1;
  const pixelAreas = areaCounter.calculateAreas(buffer, width, height, maxId);
  areaCounter.applyCalibratedAreas(countries, pixelAreas);

  await fs.writeFile(path.join(targetDir, "mask-4k.bin"), buffer);

  const packer = new LowResPacker();
  const packed1024 = packer.pack4KTo1024(buffer, 1024, 512, 4);

  const seaDetector = new ClosedSeaDetector();
  seaDetector.detectAndMarkClosedSeas(packed1024, 1024, 512);

  await fs.writeFile(path.join(targetDir, "mask-1024.bin"), packed1024);

  const validCountries = countries.filter((c) => c.id === 0 || c.areaSqKm > 0);

  return { countries: validCountries };
}
