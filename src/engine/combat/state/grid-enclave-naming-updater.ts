import { EnclaveMeta } from "@/domain/nation/enclave.schema";
import { OutpostNamingProvider } from "./outpost-naming-provider";

export class GridEnclaveNamingUpdater {
  private namer = new OutpostNamingProvider();

  public assignCustomEnclaveNames(metas: EnclaveMeta[]): EnclaveMeta[] {
    return metas.map((meta) => {
      meta.originalName = this.namer.generateOutpostName(meta);
      return meta;
    });
  }
}
