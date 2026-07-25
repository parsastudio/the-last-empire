import { Nation } from "@/domain/nation/nation.schema";
import { IntelDataMasker } from "./intel/intel-data.masker";

export class IntelMasker {
  private masker = new IntelDataMasker();

  public maskNationData(
    nation: Nation,
    intelLevel: number,
    seed: number,
  ): Record<string, unknown> {
    return this.masker.maskNationData(nation, intelLevel, seed);
  }
}
