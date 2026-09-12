import { Nation, AppLocale } from "@geopolitics/domain";
import {
  NationPresenter,
  PresentedNation,
} from "@/presentation/presenters/nation.presenter";

export type ResolvedNationEntity = PresentedNation;

export class NationResolverUtility {
  public static resolve(
    rawId?: string | null,
    nationsMap?: Record<string, Nation>,
    locale: AppLocale = "fa",
  ): ResolvedNationEntity {
    return NationPresenter.present(rawId, nationsMap, locale);
  }
}
