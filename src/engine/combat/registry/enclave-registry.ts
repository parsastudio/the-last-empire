import { EnclaveMeta } from "@/domain/nation/enclave.schema";

export class EnclaveRegistry {
  private registry = new Map<string, EnclaveMeta[]>();

  public registerEnclave(countryId: string, meta: EnclaveMeta): void {
    const existing = this.registry.get(countryId) || [];
    if (!existing.some((e) => e.enclaveId === meta.enclaveId)) {
      existing.push(meta);
      this.registry.set(countryId, existing);
    }
  }

  public resolveEnclaveMeta(
    countryId: string,
    enclaveId: number,
  ): EnclaveMeta | undefined {
    const list = this.registry.get(countryId);
    if (!list) return undefined;
    return list.find((e) => e.enclaveId === enclaveId);
  }

  public clear(): void {
    this.registry.clear();
  }
}
