import { Nation } from "@/domain/nation/nation.schema";
import { GameError } from "@/domain/shared/domain-utilities";
import { COMPREHENSIVE_RESEARCH_TREE } from "@/domain/politics/research-tree.config";

export class ResearchManager {
  public static getMilitaryTechCost(nation: Nation): number {
    const level = nation.military.techLevel || 1;
    switch (level) {
      case 1:
        return 15_000_000_000;
      case 2:
        return 75_000_000_000;
      case 3:
        return 300_000_000_000;
      case 4:
        return 1_200_000_000_000;
      default:
        return Math.floor(2_500_000_000_000 * Math.pow(1.5, level - 5));
    }
  }

  public investInMilitaryTech(nation: Nation): Nation {
    const cost = ResearchManager.getMilitaryTechCost(nation);
    if (nation.treasury < cost) {
      throw new GameError(
        "INSUFFICIENT_FUNDS",
        "موجودی خزانه برای پژوهش ارتقای فناوری نظامی کافی نیست.",
      );
    }

    return {
      ...nation,
      treasury: nation.treasury - cost,
      military: {
        ...nation.military,
        techLevel: nation.military.techLevel + 1,
      },
    };
  }

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

    return {
      ...nation,
      treasury: nation.treasury - node.moneyCost,
      doctrines: {
        ...nation.doctrines,
        unlockedDoctrines: [...currentUnlocked, doctrineId],
      },
    };
  }
}
