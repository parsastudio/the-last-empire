import React from "react";
import {
  CheckCircle2,
  XCircle,
  HeartHandshake,
  Shield,
  Sparkles,
  Swords,
  Lightbulb,
} from "lucide-react";
import { UnifiedModalShell } from "@/presentation/components/common/unified-modal-shell";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";

export interface DiplomaticProposalFeedback {
  proposalType:
    | "PEACE_TREATY"
    | "NON_AGGRESSION_PACT"
    | "FULL_ALLIANCE"
    | "SEND_FOREIGN_AID"
    | "DECLARE_WAR";
  accepted: boolean;
  targetNationId: string;
  targetName: string;
  targetFlagCode?: string;
  message: string;
}

interface DiplomaticFeedbackModalProps {
  isOpen: boolean;
  feedback: DiplomaticProposalFeedback | null;
  onClose: () => void;
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

  const getProposalTitle = () => {
    switch (feedback.proposalType) {
      case "FULL_ALLIANCE":
        return "پیشنهاد معاهده اتحاد کامل";
      case "NON_AGGRESSION_PACT":
        return "پیشنهاد پیمان عدم تخاصم";
      case "PEACE_TREATY":
        return "پیشنهاد معاهده صلح و آتش‌بس";
      case "SEND_FOREIGN_AID":
        return "بسته کمک مالی و دیپلماتیک";
      case "DECLARE_WAR":
        return "بیانیه اعلان جنگ رسمی";
      default:
        return "پاسخ دیپلماتیک";
    }
  };

  return (
    <UnifiedModalShell
      isOpen={isOpen}
      title={getProposalTitle()}
      subtitle={`پاسخ رسمی دولت ${feedback.targetName}`}
      maxWidthClass="max-w-md"
      onClose={onClose}
    >
      <div className="space-y-4 text-right dir-rtl font-sans">
        <div
          className={`p-4.5 rounded-3xl border flex items-center justify-between gap-4 transition-all shadow-lg backdrop-blur-xl ${
            isAccepted
              ? "bg-gradient-to-r from-emerald-500/15 via-card to-emerald-500/10 border-emerald-500/50"
              : "bg-gradient-to-r from-rose-500/15 via-card to-rose-500/10 border-rose-500/50"
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-secondary/80 border border-border/80 flex items-center justify-center text-4xl shadow-inner select-none shrink-0">
              {flagEmoji}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-foreground">
                  {feedback.targetName}
                </span>
                <span className="text-[10px] font-mono font-bold bg-secondary px-2 py-0.5 rounded text-muted-foreground">
                  {feedback.targetNationId}
                </span>
              </div>
              <span
                className={`text-[11px] font-bold block ${
                  isAccepted ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {isAccepted ? "پذیرش رسمی درخواست" : "رد رسمی درخواست"}
              </span>
            </div>
          </div>

          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-md shrink-0 ${
              isAccepted
                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                : "bg-rose-500/20 border-rose-500/40 text-rose-400"
            }`}
          >
            {isAccepted ? <CheckCircle2 size={22} /> : <XCircle size={22} />}
          </div>
        </div>

        <div className="bg-background/60 border border-border/70 p-4 rounded-2xl space-y-2 shadow-inner">
          <span className="text-[10px] text-muted-foreground font-mono font-bold block">
            متن ابلاغیه دیپلماتیک:
          </span>
          <p className="text-xs text-foreground leading-relaxed font-sans font-medium">
            {feedback.message}
          </p>
        </div>

        {isAccepted ? (
          <div className="bg-secondary/40 border border-border/50 p-3 rounded-2xl space-y-1.5 text-[11px] font-mono">
            <span className="text-[10px] text-muted-foreground font-sans font-bold flex items-center gap-1">
              <Sparkles size={11} className="text-emerald-400" />
              پیامدهای مستقیم معاهده:
            </span>
            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <div className="bg-background/60 p-2 rounded-xl border border-border/40 text-emerald-400 font-bold">
                افزایش همسویی سیاسی
              </div>
              <div className="bg-background/60 p-2 rounded-xl border border-border/40 text-primary font-bold">
                تثبیت موازنه قدرت
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-2.5 text-[11px] text-muted-foreground font-sans">
            <Lightbulb size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              راهکار دیپلماتیک: ارسال بسته‌های کمک مالی، ارتقای اعتبار جهانی و
              کاهش اصطکاک‌های مرزی به جلب موافقت این کشور در نوبت‌های آتی کمک
              خواهد کرد.
            </p>
          </div>
        )}

        <button
          onClick={onClose}
          className={`w-full py-3.5 rounded-2xl font-bold text-xs transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2 ${
            isAccepted
              ? "bg-gdp hover:bg-gdp/90 text-primary-foreground shadow-gdp/20"
              : "bg-secondary hover:bg-secondary/80 border border-border text-foreground"
          }`}
        >
          <span>تایید و بازگشت</span>
        </button>
      </div>
    </UnifiedModalShell>
  );
}
