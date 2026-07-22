import type { Nation } from "@/modules/nation/schemas/nation.schema";

export class AttritionManager {
  public applyUpkeepDeficitAttrition(
    nation: Nation,
    attritionRate = 0.05,
  ): Nation {
    if (nation.treasury > 0) {
      return nation;
    }

    return {
      ...nation,
      military: {
        ...nation.military,
        infantry: Math.floor(nation.military.infantry * (1 - attritionRate)),
        airForce: Math.floor(nation.military.airForce * (1 - attritionRate)),
        navy: Math.floor(nation.military.navy * (1 - attritionRate)),
        droneMissile: Math.floor(
          nation.military.droneMissile * (1 - attritionRate),
        ),
      },
    };
  }
}
