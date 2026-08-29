import { DiplomaticPosture } from "@geopolitics/domain";

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
