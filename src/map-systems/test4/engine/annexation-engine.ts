import type { RegionPhase3 } from "./types";

const DELETED_CODES = new Set([
  "BHS",
  "BLZ",
  "SLV",
  "GTM",
  "HND",
  "NIC",
  "CRI",
  "PAN",
  "HTI",
  "DOM",
  "JAM",
  "PRI",
  "TTO",
  "SUR",
  "GUY",
  "PRY",
  "URY",
  "FLK",
  "MDA",
  "EST",
  "LVA",
  "LTU",
  "SVK",
  "SVN",
  "HRV",
  "BIH",
  "MKD",
  "MNE",
  "ALB",
  "KOS",
  "LUX",
  "CYP",
  "CYN",
  "BLR",
  "BRN",
  "LAO",
  "KHM",
  "TLS",
  "BTN",
  "MMR",
  "PNG",
  "SLB",
  "VUT",
  "FJI",
  "NCL",
  "ATF",
  "ERI",
  "SOM",
  "RWA",
  "BDI",
  "UGA",
  "MWI",
  "MOZ",
  "ZMB",
  "ZWE",
  "BWA",
  "NAM",
  "LSO",
  "SWZ",
  "BEN",
  "TGO",
  "BFA",
  "CIV",
  "LBR",
  "SLE",
  "GIN",
  "GNB",
  "GMB",
  "MRT",
  "MLI",
  "TCD",
  "CAF",
  "GAB",
  "GNQ",
  "CMR",
  "SSD",
  "ESH",
  "SEN",
  "GHA",
  "TZA",
  "AGO",
  "PSX",
]);

export function partitionAndDissolveRegions(
  phase3Regions: RegionPhase3[],
): RegionPhase3[] {
  const phase4Regions: RegionPhase3[] = phase3Regions.map((r) => ({
    ...r,
    coordinates: r.coordinates.map((pt) => [pt[0], pt[1]]),
    neighbors: [...r.neighbors],
  }));

  const regionOwner = new Map<string, { code: string; name: string }>();
  phase4Regions.forEach((r) => {
    regionOwner.set(r.id, { code: r.countryCode, name: r.countryName });
  });

  let changed = true;
  let limit = 0;

  while (changed && limit < 100) {
    changed = false;
    limit++;

    const nextOwners = new Map<string, { code: string; name: string }>();

    for (const reg of phase4Regions) {
      const currentOwner = regionOwner.get(reg.id);
      if (!currentOwner) continue;

      if (!DELETED_CODES.has(currentOwner.code)) {
        continue;
      }

      const neighborOwnerVotes = new Map<
        string,
        { count: number; name: string }
      >();
      reg.neighbors.forEach((neighborId) => {
        const nOwner = regionOwner.get(neighborId);
        if (nOwner && !DELETED_CODES.has(nOwner.code)) {
          const vote = neighborOwnerVotes.get(nOwner.code) || {
            count: 0,
            name: nOwner.name,
          };
          vote.count++;
          neighborOwnerVotes.set(nOwner.code, vote);
        }
      });

      if (neighborOwnerVotes.size > 0) {
        let bestCode = "";
        let bestName = "";
        let maxVotes = -1;

        neighborOwnerVotes.forEach((vote, code) => {
          if (vote.count > maxVotes) {
            maxVotes = vote.count;
            bestCode = code;
            bestName = vote.name;
          }
        });

        if (bestCode) {
          nextOwners.set(reg.id, { code: bestCode, name: bestName });
        }
      }
    }

    if (nextOwners.size > 0) {
      nextOwners.forEach((owner, id) => {
        regionOwner.set(id, owner);
      });
      changed = true;
    }
  }

  const filteredPhase4 = phase4Regions
    .filter((reg) => {
      const owner = regionOwner.get(reg.id);
      return owner && !DELETED_CODES.has(owner.code);
    })
    .map((reg) => {
      const owner = regionOwner.get(reg.id)!;
      return {
        ...reg,
        countryCode: owner.code,
        countryName: owner.name,
      };
    });

  const validIds = new Set(filteredPhase4.map((r) => r.id));
  filteredPhase4.forEach((r) => {
    r.neighbors = r.neighbors.filter((nId) => validIds.has(nId));
  });

  return filteredPhase4;
}
