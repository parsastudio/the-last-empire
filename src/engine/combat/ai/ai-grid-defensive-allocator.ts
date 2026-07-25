import { Nation } from "@/domain/nation/nation.schema";

export class AiGridDefensiveAllocator {
  public allocateDefenseBudget(defender: Nation, threatLevel: number): number {
    const baseAllocationRatio = threatLevel / 100;
    const reservedFunds = defender.treasury * 0.2;
    const availableFunds = Math.max(0, defender.treasury - reservedFunds);
    return Math.floor(availableFunds * baseAllocationRatio);
  }
}
