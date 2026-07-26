import { EnclaveMeta } from "@/domain/nation/enclave.schema";

export class GridEnclaveNamingUpdater {
  public assignCustomEnclaveNames(metas: EnclaveMeta[]): EnclaveMeta[] {
    return metas.map((meta) => {
      meta.originalName = `${meta.originalName} Garrison`;
      return meta;
    });
  }
}
