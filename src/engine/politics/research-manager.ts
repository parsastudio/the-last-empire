import { Nation } from "@/domain/nation/nation.schema";
import { GameError } from "@/domain/shared/domain-utilities";
import { COMPREHENSIVE_RESEARCH_TREE } from "@/domain/politics/research-tree.config";

export class ResearchManager {
  public unlockDoctrine(nation: Nation, doctrineId: string): Nation {
    const node = COMPREHENSIVE_RESEARCH_TREE.find((d) => d.id === doctrineId);
    if (!node) {
      throw new GameError("INVALID_ACTION", "دکترین مورد نظر یافت نشد.");
    }

    const currentUnlocked = nation.doctrines?.unlockedDoctrines || [];
    if (currentUnlocked.includes(doctrineId)) {
      throw new GameError("INVALID_ACTION", "این دکترین قبلاً آنلاک شده است.");
    }

    const missingPrereqs = node.prerequisites.filter(
      (req) => !currentUnlocked.includes(req),
    );
    if (missingPrereqs.length > 0) {
      throw new GameError(
        "INVALID_ACTION",
        "پیش‌نیازهای این دکترین هنوز آنلاک نشده‌اند.",
      );
    }

    if (nation.treasury < node.moneyCost) {
      throw new GameError("INSUFFICIENT_FUNDS", "موجودی خزانه کافی نیست.");
    }

    if (node.oilCost > 0 && nation.resources.oil < node.oilCost) {
      throw new GameError(
        "INSUFFICIENT_RESOURCES",
        "ذخایر نفت استراتژیک کافی نیست.",
      );
    }

    return {
      ...nation,
      treasury: nation.treasury - node.moneyCost,
      resources: {
        ...nation.resources,
        oil: Math.max(0, nation.resources.oil - node.oilCost),
      },
      doctrines: {
        ...nation.doctrines,
        unlockedDoctrines: [...currentUnlocked, doctrineId],
      },
    };
  }
}
