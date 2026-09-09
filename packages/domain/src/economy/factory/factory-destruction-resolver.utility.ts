import { ProvinceDynamicState } from "@/domain/province/province.schema";
import { FactoryBatchManagerUtility } from "@/domain/economy/factory/factory-batch-manager.utility";

export class FactoryDestructionResolverUtility {
  public static distributeFactoryDestruction(
    provincesMap: Record<string, ProvinceDynamicState>,
    candidateProvinces: ProvinceDynamicState[],
    factoriesToDestroy: number,
  ): {
    updatedProvinces: Record<string, ProvinceDynamicState>;
    actualDestroyed: number;
  } {
    if (factoriesToDestroy <= 0 || candidateProvinces.length === 0) {
      return { updatedProvinces: provincesMap, actualDestroyed: 0 };
    }

    const updatedProvinces: Record<string, ProvinceDynamicState> = {
      ...provincesMap,
    };
    let totalPoolFactories = 0;

    for (let i = 0; i < candidateProvinces.length; i++) {
      totalPoolFactories += candidateProvinces[i]!.factoriesCount;
    }

    if (totalPoolFactories <= 0) {
      return { updatedProvinces: provincesMap, actualDestroyed: 0 };
    }

    const minProtectedFloor = Math.max(1, Math.ceil(totalPoolFactories * 0.05));
    const maxDestroyable = Math.max(0, totalPoolFactories - minProtectedFloor);
    const actualDestroyCount = Math.min(factoriesToDestroy, maxDestroyable);

    if (actualDestroyCount <= 0) {
      return { updatedProvinces: provincesMap, actualDestroyed: 0 };
    }

    let remainingToDeduct = actualDestroyCount;
    const sortedProvinces = [...candidateProvinces].sort(
      (a, b) => b.factoriesCount - a.factoriesCount,
    );

    for (let i = 0; i < sortedProvinces.length && remainingToDeduct > 0; i++) {
      const p = sortedProvinces[i]!;
      const currentCount = p.factoriesCount;
      if (currentCount <= 0) continue;

      const proportionalShare = Math.floor(
        (currentCount / totalPoolFactories) * actualDestroyCount,
      );
      const deduct = Math.max(
        1,
        Math.min(currentCount, Math.min(remainingToDeduct, proportionalShare)),
      );

      const nextBatches = FactoryBatchManagerUtility.removeFactories(
        p.factoryTiers,
        deduct,
      );
      const nextCount = currentCount - deduct;

      updatedProvinces[p.provinceId.toString()] = {
        ...p,
        factoriesCount: nextCount,
        factoryTiers: nextBatches,
      };

      remainingToDeduct -= deduct;
    }

    let loopIndex = 0;
    while (remainingToDeduct > 0 && loopIndex < sortedProvinces.length) {
      const p = sortedProvinces[loopIndex]!;
      const current = updatedProvinces[p.provinceId.toString()]!;
      if (current.factoriesCount > 0) {
        const nextBatches = FactoryBatchManagerUtility.removeFactories(
          current.factoryTiers,
          1,
        );
        updatedProvinces[p.provinceId.toString()] = {
          ...current,
          factoriesCount: current.factoriesCount - 1,
          factoryTiers: nextBatches,
        };
        remainingToDeduct--;
      }
      loopIndex++;
    }

    return {
      updatedProvinces,
      actualDestroyed: actualDestroyCount - remainingToDeduct,
    };
  }
}
