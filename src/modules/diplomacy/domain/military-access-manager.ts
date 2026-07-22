import type { Nation } from "@/core/types";

export class MilitaryAccessManager {
  public grantMilitaryAccess(nation: Nation, targetId: string): Nation {
    const relation = nation.relations[targetId];
    if (!relation) {
      return nation;
    }

    return {
      ...nation,
      relations: {
        ...nation.relations,
        [targetId]: {
          ...relation,
          militaryAccess: true,
        },
      },
    };
  }

  public revokeMilitaryAccess(nation: Nation, targetId: string): Nation {
    const relation = nation.relations[targetId];
    if (!relation) {
      return nation;
    }

    return {
      ...nation,
      relations: {
        ...nation.relations,
        [targetId]: {
          ...relation,
          militaryAccess: false,
        },
      },
    };
  }
}
