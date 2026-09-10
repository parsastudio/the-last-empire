import React from "react";
import { Check, X, Globe, ShieldCheck, Skull, Coins } from "lucide-react";
import { getProposalTypeName } from "@/presentation/components/tactical-map/sidebar/tabs/diplomacy/utils/relation-appearance.utility";

export interface DiplomaticProposalFeedbackData {
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
}

interface TreatyResponseFeedbackContentProps {
  feedback: DiplomaticProposalFeedbackData;
  flagEmoji: string;
  onClose: () => void;
}

export function TreatyResponseFeedbackContent({
  feedback,
  flagEmoji,
  onClose,
}: TreatyResponseFeedbackContentProps) {
  const isAccepted = feedback.accepted;
  const proposalName = getProposalTypeName(feedback.proposalType);
  const isCancel = feedback.proposalType === "CANCEL_TREATY";
  const isSecurityCancel =
    feedback.proposalType === "CANCEL_SECURITY_GUARANTEE" ||
    feedback.proposalType === "CANCEL_EMERGENCY_PROTECTORATE";
  const isEmergency = feedback.proposalType === "EMERGENCY_PROTECTORATE";
  const isPartnership = feedback.proposalType === "STRATEGIC_PARTNERSHIP";

  return (
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
          ) : isPartnership ? (
            <Coins size={30} className="text-gdp animate-pulse" />
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
              پیمان استمداد امنیتی با امپراتوری{" "}
              <strong className="text-rose-400">{feedback.targetName}</strong>{" "}
              منعقد گردید.
            </p>
            <div className="flex flex-col gap-1.5 text-[10px] font-mono font-bold">
              <span className="px-2.5 py-1 bg-rose-500/15 text-rose-300 border border-rose-500/30 rounded-xl">
                استقرار نیروی ضربت فوق‌پیشرفته (معادل ۵۰٪ GDP شما)
              </span>
              <span className="px-2.5 py-1 bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded-xl">
                پرداخت نوبتی ۵٪ خراج • ۳۰- پرستیژ • ۱۵-٪ ثبات
              </span>
            </div>
          </div>
        ) : isSecurityCancel ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground leading-relaxed">
              پیمان دفاعی با دولت{" "}
              <strong className="text-foreground">{feedback.targetName}</strong>{" "}
              فسخ گردید.
            </p>
          </div>
        ) : isCancel ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground leading-relaxed">
              معاهده پیشین با دولت{" "}
              <strong className="text-foreground">{feedback.targetName}</strong>{" "}
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
              <strong className="text-foreground">{feedback.targetName}</strong>{" "}
              درخواست{" "}
              <span className="font-black text-emerald-400">
                {proposalName}
              </span>{" "}
              شما را <span className="font-black text-emerald-400">پذیرفت</span>
              .
            </p>
            {feedback.proposalType === "SECURITY_GUARANTEE" ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-[11px] font-mono font-bold text-cyan-300">
                <ShieldCheck size={12} />
                <span>
                  انعقاد پیمان دفاعی (ورود مستقیم ارتش حامی به جنگ در صورت تهاجم
                  دشمن)
                </span>
              </div>
            ) : isPartnership ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gdp/10 border border-gdp/30 rounded-full text-[11px] font-mono font-bold text-gdp">
                <Coins size={12} />
                <span>
                  واریز دائمی ۰.۶٪ از GDP هر دو کشور به خزانه یکدیگر در هر نوبت
                </span>
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
            <span className="font-black text-rose-400">{proposalName}</span> شما
            را <span className="font-black text-rose-400">رد کرد</span>.
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
  );
}
