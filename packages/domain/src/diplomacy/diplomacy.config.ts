import {
  DiplomaticProposalType,
  DiplomaticStance,
  DiplomaticPosture,
} from "@/domain/diplomacy/diplomacy.schema";

export const DIPLOMACY_CONFIG = {
  POST_WAR_COOLDOWN_TURNS: 8,
  BETRAYAL_PENALTIES: {
    STRATEGIC_PARTNERSHIP: 40,
    NON_AGGRESSION_PACT: 25,
    NORMAL_DIPLOMACY: 15,
  },
} as const;

export const DIPLOMATIC_PROPOSAL_LABELS_FA: Record<
  DiplomaticProposalType,
  string
> = {
  STRATEGIC_PARTNERSHIP: "شراکت استراتژیک و اقتصادی",
  SECURITY_GUARANTEE: "پیمان دفاعی و امنیت سرزمینی متقابل",
  EMERGENCY_PROTECTORATE: "پیمان استمداد و تسلیم حاکمیت به ابرقدرت",
  CANCEL_SECURITY_GUARANTEE: "لغو پیمان دفاعی",
  CANCEL_EMERGENCY_PROTECTORATE: "لغو پیمان استمداد و اعلام استقلال",
  NON_AGGRESSION_PACT: "پیمان عدم تخاصم",
  PEACE_TREATY: "معاهده صلح",
  SEND_FOREIGN_AID: "کمک مالی و دیپلماتیک",
  DECLARE_WAR: "اعلان جنگ رسمی",
  CANCEL_TREATY: "تنزل روابط و لغو معاهده",
};

export const DIPLOMATIC_PROPOSAL_LABELS_EN: Record<
  DiplomaticProposalType,
  string
> = {
  STRATEGIC_PARTNERSHIP: "Strategic & Economic Partnership",
  SECURITY_GUARANTEE: "Mutual Defense & Territorial Security Pact",
  EMERGENCY_PROTECTORATE: "Emergency Protectorate Treaty",
  CANCEL_SECURITY_GUARANTEE: "Revoke Defense Pact",
  CANCEL_EMERGENCY_PROTECTORATE: "Terminate Protectorate Treaty",
  NON_AGGRESSION_PACT: "Non-Aggression Pact",
  PEACE_TREATY: "Peace Treaty",
  SEND_FOREIGN_AID: "Diplomatic & Foreign Aid",
  DECLARE_WAR: "Official Declaration of War",
  CANCEL_TREATY: "Downgrade Relations & Cancel Treaty",
};

export const DIPLOMATIC_STANCE_LABELS_FA: Record<DiplomaticStance, string> = {
  WAR: "وضعیت نبرد",
  STRATEGIC_PARTNERSHIP: "شراکت استراتژیک",
  NON_AGGRESSION_PACT: "عدم تخاصم",
  NORMAL_DIPLOMACY: "دیپلماسی عادی",
};

export const DIPLOMATIC_STANCE_LABELS_EN: Record<DiplomaticStance, string> = {
  WAR: "State of War",
  STRATEGIC_PARTNERSHIP: "Strategic Partnership",
  NON_AGGRESSION_PACT: "Non-Aggression Pact",
  NORMAL_DIPLOMACY: "Normal Diplomacy",
};

export const DIPLOMATIC_POSTURE_LABELS_FA: Record<DiplomaticPosture, string> = {
  NATURAL_ALLY: "متحد طبیعی و همسو",
  OPPORTUNISTIC_PREDATOR: "گرگ در کمین (آماده حمله و تصرف خاک)",
  WARY_BUFFER: "سپر محتاط (نگران از قدرت شما)",
  NEUTRAL_COEXISTENCE: "بی‌طرف و صلح‌جو",
};

export const DIPLOMATIC_POSTURE_LABELS_EN: Record<DiplomaticPosture, string> = {
  NATURAL_ALLY: "Natural Strategic Ally",
  OPPORTUNISTIC_PREDATOR: "Opportunistic Predator",
  WARY_BUFFER: "Wary Buffer State",
  NEUTRAL_COEXISTENCE: "Neutral Coexistence",
};
