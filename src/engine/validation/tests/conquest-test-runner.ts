import { CombatTestSuite } from "@/engine/combat/tests/test-suite";

export function runAllLevel6Tests(): Record<string, boolean> {
  const suite = new CombatTestSuite();
  return suite.runAllTests();
}
