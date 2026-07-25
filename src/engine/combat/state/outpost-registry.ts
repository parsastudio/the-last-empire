import { EnclaveMeta } from "@/domain/nation/enclave.schema";

export class OutpostRegistry {
  private outposts = new Map<string, EnclaveMeta>();

  public registerOutpost(key: string, meta: EnclaveMeta): void {
    this.outposts.set(key, meta);
  }

  public getOutpostMeta(key: string): EnclaveMeta | undefined {
    return this.outposts.get(key);
  }

  public removeOutpost(key: string): void {
    this.outposts.delete(key);
  }

  public clear(): void {
    this.outposts.clear();
  }
}
