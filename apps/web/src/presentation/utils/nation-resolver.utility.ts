import { Nation } from "@geopolitics/domain";
import {
  NationPresenter,
  PresentedNation,
  CountryNameTranslator,
} from "@/presentation/presenters/nation.presenter";

export type ResolvedNationEntity = PresentedNation;

export class NationResolverUtility {
  public static resolve(
    rawId?: string | null,
    nationsMap?: Record<string, Nation>,
    translator?: CountryNameTranslator,
  ): ResolvedNationEntity {
    return NationPresenter.present(rawId, nationsMap, translator);
  }
}
