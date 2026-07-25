import { ConquestCapper } from "@/engine/combat/capping/conquest-capper";

export function runConquestCapperTest(): boolean {
  const capper = new ConquestCapper();
  const result = capper.calculateCappedTarget(100, 50);
  return result === 25;
}
