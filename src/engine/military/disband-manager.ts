import { Nation } from "@/domain/nation/nation.schema";
import { UnitType } from "@/domain/military/military.schema";
import { DisbandValidator } from "./disband/disband-validator";
import { DisbandEffectApplier } from "./disband/disband-effect-applier";

export class DisbandManager {
  private validator = new DisbandValidator();
  private effectApplier = new DisbandEffectApplier();

  public disbandUnits(
    nation: Nation,
    unitType: UnitType,
    quantity: number,
    manpowerRefundRate = 0.4,
  ): Nation {
    this.validator.validateDisband(nation, unitType, quantity);
    return this.effectApplier.applyDisbandEffects(
      nation,
      unitType,
      quantity,
      manpowerRefundRate,
    );
  }
}
