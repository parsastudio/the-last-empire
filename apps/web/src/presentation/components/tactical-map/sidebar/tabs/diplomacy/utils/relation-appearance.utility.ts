import { DiplomaticStance, DiplomaticPosture } from "@geopolitics/domain";

export function getPostureLabel(posture: DiplomaticPosture): string {
  switch (posture) {
    case "NATURAL_ALLY":
      return "متحد طبیعی و همسو";
    case "OPPORTUNISTIC_PREDATOR":
      return "شکارچی و رقیب متخاصم";
    case "WARY_BUFFER":
      return "مدافع محتاط و نگران";
    case "NEUTRAL_COEXISTENCE":
    default:
      return "همزیستی مسالمت‌آمیز";
  }
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
): string {
  switch (stance) {
    case "WAR":
      return "وضعیت نبرد";
    case "STRATEGIC_PARTNERSHIP":
      return "شراکت استراتژیک";
    case "NON_AGGRESSION_PACT":
      return "عدم تخاصم";
    case "NORMAL_DIPLOMACY":
    default:
      return "دیپلماسی عادی";
  }
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

export function getProposalTypeName(type: string): string {
  switch (type) {
    case "STRATEGIC_PARTNERSHIP":
      return "شراکت استراتژیک";
    case "SECURITY_GUARANTEE":
      return "پیمان چتر امنیتی";
    case "EMERGENCY_PROTECTORATE":
      return "معاهده تحت‌الحمایگی استعماری";
    case "CANCEL_SECURITY_GUARANTEE":
      return "لغو چتر امنیتی";
    case "CANCEL_EMERGENCY_PROTECTORATE":
      return "لغو معاهده استعماری";
    case "NON_AGGRESSION_PACT":
      return "پیمان عدم تخاصم";
    case "PEACE_TREATY":
      return "معاهده صلح";
    case "SEND_FOREIGN_AID":
      return "کمک مالی";
    case "DECLARE_WAR":
      return "اعلان جنگ";
    case "CANCEL_TREATY":
      return "تنزل روابط و لغو معاهده";
    default:
      return "معاهده دیپلماتیک";
  }
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
