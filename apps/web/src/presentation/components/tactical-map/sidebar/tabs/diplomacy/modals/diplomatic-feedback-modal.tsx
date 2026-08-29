import React from "react";
import {
  Check,
  X,
  Swords,
  ShoppingCart,
  AlertTriangle,
  Radio,
  Globe,
  ShieldCheck,
  Skull,
} from "lucide-react";
import { UnifiedModalShell } from "@/presentation/components/common/unified-modal-shell";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { ReactiveDefenseEvent } from "@geopolitics/game-engine";

export interface DiplomaticProposalFeedback {
  proposalType:
    | "PEACE_TREATY"
    | "NON_AGGRESSION_PACT"
    | "STRATEGIC_PARTNERSHIP"
    | "SECURITY_GUARANTEE"
    | "EMERGENCY_PROTECTORATE"
    | "CANCEL_SECURITY_GUARANTEE"
    | "CANCEL_EMERGENCY_PROTECTORATE"
    | "SEND_FOREIGN_AID"
    | "DECLARE_WAR"
    | "CANCEL_TREATY";
  accepted: boolean;
  targetNationId: string;
  targetName: string;
  targetFlagCode?: string;
  message?: string;
  reputationChange?: number;
  defenseEvent?: ReactiveDefenseEvent;
}

interface DiplomaticFeedbackModalProps {
  isOpen: boolean;
  feedback: DiplomaticProposalFeedback | null;
  onClose: () => void;
}

function getProposalName(
  type: DiplomaticProposalFeedback["proposalType"],
): string {
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

export function DiplomaticFeedbackModal({
  isOpen,
  feedback,
  onClose,
}: DiplomaticFeedbackModalProps) {
  if (!isOpen || !feedback) return null;

  const flagEmoji = getFlagEmoji(
    feedback.targetFlagCode || feedback.targetNationId,
  );
  const isAccepted = feedback.accepted;
  const proposalName = getProposalName(feedback.proposalType);
  const isCancel = feedback.proposalType === "CANCEL_TREATY";
  const isSecurityCancel =
    feedback.proposalType === "CANCEL_SECURITY_GUARANTEE" ||
    feedback.proposalType === "CANCEL_EMERGENCY_PROTECTORATE";
  const isEmergency = feedback.proposalType === "EMERGENCY_PROTECTORATE";
  const isWar = feedback.proposalType === "DECLARE_WAR";
  const defense = feedback.defenseEvent;

  if (isWar) {
    return (
      <UnifiedModalShell
        isOpen={isOpen}
        title=""
        maxWidthClass="max-w-md"
        onClose={onClose}
      >
        <div className="py-2 flex flex-col items-center justify-center gap-4 text-right dir-rtl font-sans">
          <div className="w-16 h-16 rounded-3xl bg-rose-500/20 border-2 border-rose-500/60 text-rose-400 flex items-center justify-center shadow-xl shadow-rose-500/25 animate-pulse">
            <Swords size={32} />
          </div>

          <div className="space-y-1.5 text-center px-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/15 border border-rose-500/30 rounded-full text-[10px] font-mono text-rose-400 font-bold uppercase tracking-wider">
              <Radio size={12} className="animate-ping" />
              <span>وضعیت جنگی فعال • وضعیت قرمز</span>
            </div>
            <h3 className="text-base font-black text-foreground">
              ابلاغ بیانیه رسمی اعلان جنگ به {feedback.targetName}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
              تمامی معاهدات بین‌المللی لغو گردید، سفارتخانه‌ها تعطیل و فرمان آتش
              سراسری به ستاد کل ارتش صادر شد.
            </p>
          </div>

          {defense?.type === "PURCHASED" && (
            <div className="w-full bg-gradient-to-r from-amber-950/60 via-card to-amber-950/40 border border-amber-500/50 p-4 rounded-2xl space-y-2 shadow-lg text-right">
              <div className="flex items-center gap-2 text-xs font-black text-amber-400">
                <ShoppingCart size={16} />
                <span>گزارش اطلاعات: خرید ضربتی تسلیحات توسط حریف!</span>
              </div>
              <p className="text-[11px] text-foreground/90 leading-relaxed font-sans font-medium">
                دولت {feedback.targetName} به دلیل احساس خطر از شکاف قدرت نظامی،
                با دریافت تسهیلات اضطراری (
                {PersianNumberFormatter.formatCurrency(defense.cost || 0)})
                اقدام به واردات فوری{" "}
                <strong className="text-amber-400 font-bold font-mono">
                  {PersianNumberFormatter.toPersianDigits(
                    defense.quantity?.toLocaleString("en-US") || "۰",
                  )}{" "}
                  {defense.unitName}
                </strong>{" "}
                از کشور {defense.sellerName}{" "}
                {getFlagEmoji(defense.sellerFlagCode || "")} نمود.
              </p>
            </div>
          )}

          {defense?.type === "MAX_DEBT" && (
            <div className="w-full bg-secondary/60 border border-border/70 p-3 rounded-2xl flex items-center gap-2.5 text-[11px] text-muted-foreground text-right">
              <AlertTriangle size={15} className="text-amber-400 shrink-0" />
              <span>
                دولت {feedback.targetName} به سقف بدهی مجاز رسیده و توان دریافت
                وام اضطراری جهت تسلیح بیشتر را ندارد.
              </span>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full py-3.5 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-black text-xs transition-all cursor-pointer shadow-lg shadow-rose-600/20 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <Swords size={15} />
            <span>تایید و ورود به جبهه نبرد</span>
          </button>
        </div>
      </UnifiedModalShell>
    );
  }

  return (
    <UnifiedModalShell
      isOpen={isOpen}
      title=""
      maxWidthClass="max-w-sm"
      onClose={onClose}
    >
      <div className="py-2 flex flex-col items-center justify-center gap-4 text-center dir-rtl font-sans">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center border shadow-xl transition-all ${
            isAccepted
              ? isEmergency
                ? "bg-rose-500/20 border-rose-500/50 text-rose-400 shadow-rose-500/25"
                : isCancel || isSecurityCancel
                  ? "bg-amber-500/15 border-amber-500/40 text-amber-400 shadow-amber-500/20"
                  : "bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-emerald-500/20"
              : "bg-rose-500/15 border-rose-500/40 text-rose-400 shadow-rose-500/20"
          }`}
        >
          {isAccepted ? (
            isEmergency ? (
              <Skull size={30} className="animate-pulse" />
            ) : (
              <Check size={32} strokeWidth={3} />
            )
          ) : (
            <X size={32} strokeWidth={3} />
          )}
        </div>

        <div className="space-y-2.5 px-2">
          <div className="flex items-center justify-center gap-2 text-base font-extrabold text-foreground">
            <span className="text-xl select-none">{flagEmoji}</span>
            <span>{feedback.targetName}</span>
          </div>

          {isEmergency && isAccepted ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground leading-relaxed">
                معاهده تحت‌الحمایگی استعماری با امپراتوری{" "}
                <strong className="text-rose-400">{feedback.targetName}</strong>{" "}
                منعقد گردید.
              </p>
              <div className="flex flex-col gap-1.5 text-[10px] font-mono font-bold">
                <span className="px-2.5 py-1 bg-rose-500/15 text-rose-300 border border-rose-500/30 rounded-xl">
                  استقرار نیروی ضربت فوق‌پیشرفته (۳ برابر GDP)
                </span>
                <span className="px-2.5 py-1 bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded-xl">
                  پرداخت نوبتی ۳۰٪ خراج • ۳۰- پرستیژ • ۱۵-٪ ثبات
                </span>
              </div>
            </div>
          ) : isSecurityCancel ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                پیمان چتر امنیتی با دولت{" "}
                <strong className="text-foreground">
                  {feedback.targetName}
                </strong>{" "}
                لغو گردید.
              </p>
            </div>
          ) : isCancel ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                معاهده پیشین با دولت{" "}
                <strong className="text-foreground">
                  {feedback.targetName}
                </strong>{" "}
                لغو گردید و سطح روابط با موفقیت{" "}
                <span className="text-amber-400 font-black">تنزل یافت</span>.
              </p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-military/10 border border-military/30 rounded-full text-[11px] font-mono font-bold text-military">
                <Globe size={12} />
                <span>۲- امتیاز اعتبار جهانی (تنزل معاهده)</span>
              </div>
            </div>
          ) : isAccepted ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                دولت{" "}
                <strong className="text-foreground">
                  {feedback.targetName}
                </strong>{" "}
                درخواست{" "}
                <span className="font-black text-emerald-400">
                  {proposalName}
                </span>{" "}
                شما را{" "}
                <span className="font-black text-emerald-400">پذیرفت</span>.
              </p>
              {feedback.proposalType === "SECURITY_GUARANTEE" ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-[11px] font-mono font-bold text-cyan-300">
                  <ShieldCheck size={12} />
                  <span>فعال‌سازی ۳۰٪ نیروی ضربت پشتیبان در زمان دفاع</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gdp/10 border border-gdp/30 rounded-full text-[11px] font-mono font-bold text-gdp">
                  <Globe size={12} />
                  <span>۱+ امتیاز اعتبار جهانی</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm font-medium text-muted-foreground leading-relaxed">
              دولت{" "}
              <strong className="text-foreground">{feedback.targetName}</strong>{" "}
              درخواست{" "}
              <span className="font-black text-rose-400">{proposalName}</span>{" "}
              شما را <span className="font-black text-rose-400">رد کرد</span>.
            </p>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-2 py-3 rounded-2xl bg-secondary hover:bg-secondary/80 border border-border text-foreground font-bold text-xs transition-all cursor-pointer"
        >
          متوجه شدم
        </button>
      </div>
    </UnifiedModalShell>
  );
}
