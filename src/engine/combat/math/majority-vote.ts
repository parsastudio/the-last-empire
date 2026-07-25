export class MajorityVote {
  public resolvePrimaryOwner(countryIds: string[]): {
    ownerId: string;
    confidence: number;
  } {
    const counts = new Map<string, number>();
    for (const id of countryIds) {
      counts.set(id, (counts.get(id) || 0) + 1);
    }

    let primaryOwner = "WATER";
    let maxCount = 0;

    for (const [id, count] of counts.entries()) {
      if (count > maxCount) {
        maxCount = count;
        primaryOwner = id;
      }
    }

    const confidence = countryIds.length > 0 ? maxCount / countryIds.length : 0;
    return { ownerId: primaryOwner, confidence };
  }

  public resolvePrimaryEnclave(enclaveIds: number[]): number {
    const counts = new Map<number, number>();
    for (const id of enclaveIds) {
      counts.set(id, (counts.get(id) || 0) + 1);
    }

    let primaryEnclave = 0;
    let maxCount = 0;

    for (const [id, count] of counts.entries()) {
      if (count > maxCount) {
        maxCount = count;
        primaryEnclave = id;
      }
    }

    return primaryEnclave;
  }
}
