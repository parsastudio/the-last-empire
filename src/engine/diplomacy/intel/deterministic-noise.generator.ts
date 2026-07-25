export class DeterministicNoiseGenerator {
  public deterministicRandom(seed: number, nationId: string): number {
    let hash = seed;
    for (let i = 0; i < nationId.length; i++) {
      hash = (hash << 5) - hash + nationId.charCodeAt(i);
      hash |= 0;
    }
    const x = Math.sin(hash) * 10000;
    return x - Math.floor(x);
  }
}
