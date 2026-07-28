import { HomelandMilitiaCalculator } from "../math/homeland-militia-calculator";

export function runMilitiaGarrisonTest(): boolean {
  const calculator = new HomelandMilitiaCalculator();

  const militiaPower = calculator.calculateMilitiaGarrisonPower(36000000, 80);

  return militiaPower === 288;
}
