import fs from "fs/promises";
import path from "path";
import { DistanceTransform } from "./distance-transform";
import { MapAreaPixelCounter } from "./generator/map-area-pixel-counter";
import { LowResPacker } from "./utils/low-res-packer";
import { ClosedSeaDetector } from "./utils/closed-sea-detector";
import { MapPathResolver } from "./map-path-resolver";
import { TerritoryPartitioner } from "./generator/territory-partitioner";
import { PngDecoder } from "./encoders/png-decoder";
import { ALL_COUNTRY_PROFILES } from "@/infrastructure/data/countries";

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
  const decodedMask = await PngDecoder.decodeIndexedPng(editedMaskPath);

  if (!decodedMask || decodedMask.buffer.length !== width * height) {
    throw new Error(
      "فایل ماسک ادیت‌شده (edited-mask.png) یافت نشد یا ابعاد آن با ۴۰۹۶×۲۰۴۸ مطابقت ندارد.",
    );
  }

  const distanceTransform = new DistanceTransform();
  const areaCounter = new MapAreaPixelCounter();
  const partitioner = new TerritoryPartitioner();

  const idToCodeMap = new Map<number, string>();
  const codeToIdMap = new Map<string, number>();

  const countries: CountryMapping[] = [
    {
      id: 0,
      code: "WATER",
      name: "Ocean",
      color: [0, 0, 0],
      areaSqKm: 0,
    },
  ];

  let autoId = 11;
  for (const profile of ALL_COUNTRY_PROFILES) {
    const profileId = autoId++;
    countries.push({
      id: profileId,
      code: profile.code,
      name: profile.nameFa,
      color: [0, 0, profileId],
      areaSqKm: 0,
    });
    idToCodeMap.set(profileId, profile.code);
    codeToIdMap.set(profile.code.toUpperCase(), profileId);
    if (profile.flagCode) {
      codeToIdMap.set(profile.flagCode.toUpperCase(), profileId);
    }
  }

  const buffer = new Uint8Array(width * height);
  buffer.set(decodedMask.buffer);

  partitioner.partitionBuffer(buffer, width, height, idToCodeMap);

  const maxId = Math.max(...countries.map((c) => c.id), 255) + 1;
  const pixelAreas = areaCounter.calculateAreas(buffer, width, height, maxId);
  areaCounter.applyCalibratedAreas(countries, pixelAreas);

  const dist = distanceTransform.calculate(buffer, width, height);
  distanceTransform.applySeaDepths(buffer, dist, width, height);

  await fs.writeFile(path.join(targetDir, "mask-4k.bin"), buffer);

  const packer = new LowResPacker();
  const packed1024 = packer.pack4KTo1024(buffer, 1024, 512, 4);

  const seaDetector = new ClosedSeaDetector();
  seaDetector.detectAndMarkClosedSeas(packed1024, 1024, 512);

  await fs.writeFile(path.join(targetDir, "mask-1024.bin"), packed1024);

  return { countries };
}
