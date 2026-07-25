import { EnclaveMeta } from "@/domain/nation/enclave.schema";

export class OutpostNamingProvider {
  public generateOutpostName(meta: EnclaveMeta): string {
    return `${meta.originalName} Garrison`;
  }
}
