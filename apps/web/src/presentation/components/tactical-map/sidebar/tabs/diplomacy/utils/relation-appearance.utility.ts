import {
  DiplomaticStance,
  DiplomaticPosture,
  DiplomaticProposalType,
  DIPLOMATIC_PROPOSAL_LABELS_FA,
  DIPLOMATIC_PROPOSAL_LABELS_EN,
  DIPLOMATIC_STANCE_LABELS_FA,
  DIPLOMATIC_STANCE_LABELS_EN,
  DIPLOMATIC_POSTURE_LABELS_FA,
  DIPLOMATIC_POSTURE_LABELS_EN,
} from "@geopolitics/domain";

export function getPostureLabel(
  posture: DiplomaticPosture,
  locale: "fa" | "en" = "fa",
): string {
  const map =
    locale === "en"
      ? DIPLOMATIC_POSTURE_LABELS_EN
      : DIPLOMATIC_POSTURE_LABELS_FA;
  return (
    map[posture] ||
    (locale === "en" ? "Neutral Coexistence" : "همزیستی مسالمت‌آمیز")
  );
}

export function getPostureBadgeClass(posture: DiplomaticPosture): string {
  switch (posture) {
    case "NATURAL_ALLY":
      return "bg-gdp/15 text-gdp border-gdp/30";
    case "OPPORTUNISTIC_PREDATOR":
      return "bg-rose-500/15 text-rose-500 border-rose-500/30";
    case "WARY_BUFFER":
      return "bg-amber-500/15 text-amber-500 border-amber-500/30";
    case "NEUTRAL_COEXISTENCE":
    default:
      return "bg-secondary text-muted-foreground border-border/60";
  }
}

export function getDiplomaticStanceLabel(
  stance: DiplomaticStance | string,
  locale: "fa" | "en" = "fa",
): string {
  const map =
    locale === "en" ? DIPLOMATIC_STANCE_LABELS_EN : DIPLOMATIC_STANCE_LABELS_FA;
  if (stance in map) {
    return map[stance as DiplomaticStance];
  }
  return String(stance);
}

export function getDiplomaticStanceBadgeClass(
  stance: DiplomaticStance | string,
): string {
  switch (stance) {
    case "WAR":
      return "bg-rose-600/25 text-rose-500 border-rose-500/40";
    case "STRATEGIC_PARTNERSHIP":
      return "bg-gdp/20 text-gdp border-gdp/30";
    case "NON_AGGRESSION_PACT":
      return "bg-treasury/20 text-treasury border-treasury/30";
    case "NORMAL_DIPLOMACY":
    default:
      return "bg-secondary text-muted-foreground border-border/60";
  }
}

export function getProposalTypeName(
  type: string,
  locale: "fa" | "en" = "fa",
): string {
  const map =
    locale === "en"
      ? DIPLOMATIC_PROPOSAL_LABELS_EN
      : DIPLOMATIC_PROPOSAL_LABELS_FA;
  if (type in map) {
    return map[type as DiplomaticProposalType];
  }
  return locale === "en" ? "Diplomatic Accord" : "معاهده دیپلماتیک";
}

export function getAlignmentColor(alignment: number): string {
  if (alignment >= 40) return "text-emerald-500 font-bold";
  if (alignment >= 15) return "text-emerald-400 font-semibold";
  if (alignment >= -15) return "text-muted-foreground font-medium";
  if (alignment >= -40) return "text-amber-500 font-semibold";
  return "text-rose-500 font-bold";
}

export function getTensionColor(tension: number): string {
  if (tension >= 60) return "text-rose-500 font-bold";
  if (tension >= 35) return "text-amber-500 font-semibold";
  return "text-emerald-400 font-medium";
}
