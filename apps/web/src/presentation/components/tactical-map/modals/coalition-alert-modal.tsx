import React from "react";
import {
  ShieldAlert,
  Flame,
  Swords,
  Users,
  AlertTriangle,
  Radio,
} from "lucide-react";
import { UnifiedModalShell } from "@/presentation/components/common/unified-modal-shell";
import { Nation, PersianNumberFormatter } from "@geopolitics/domain";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";
import { CoalitionAlertData } from "@/presentation/stores/use-ui-store";

interface CoalitionAlertModalProps {
  isOpen: boolean;
  data: CoalitionAlertData | null;
  nationsMap?: Record<string, Nation>;
  onClose: () => void;
}

export function CoalitionAlertModal({
  isOpen,
  data,
  nationsMap,
  onClose,
}: CoalitionAlertModalProps) {
  if (!isOpen || !data) return null;

  const memberNations = data.memberIds
    .map((id) => {
      const nation = nationsMap?.[id];
      return {
        id,
        name: nation ? nation.name : id,
        flag: getFlagEmoji(nation?.flagCode || id),
        techLevel: nation?.military.techLevel ?? 1,
      };
    })
    .filter(Boolean);

  return (
    <UnifiedModalShell
      isOpen={isOpen}
      title=""
      maxWidthClass="max-w-xl"
      onClose={onClose}
    >
      <div className="space-y-4 text-right dir-rtl font-sans pb-1">
        <div className="relative overflow-hidden bg-gradient-to-b from-rose-950/70 via-card to-secondary/80 border border-rose-500/60 p-5 rounded-3xl shadow-2xl space-y-3">
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent animate-pulse" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center shadow-lg shadow-rose-500/20">
                <ShieldAlert size={22} className="animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-black text-rose-400 uppercase tracking-widest block">
                  DEFENSIVE PACT OF CONTAINMENT
                </span>
                <h3 className="text-base font-black text-foreground">
                  شکل‌گیری ائتلاف جهانی مهار هژمونی
                </h3>
              </div>
            </div>

            <span className="text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2.5 py-1 rounded-xl flex items-center gap-1">
              <Radio size={12} className="animate-ping" />
              نوبت {PersianNumberFormatter.toPersianDigits(data.turn)}
            </span>
          </div>

          <div className="bg-background/80 border border-rose-500/30 p-3.5 rounded-2xl space-y-1.5 shadow-inner">
            <div className="flex items-center gap-2 text-xs font-black text-rose-400">
              <Flame size={14} />
              <span>
                {data.isHumanTarget
                  ? "متحد شدن رقبا علیه امپراتوری شما"
                  : `اتحاد قدرت‌ها علیه امپراتوری ${data.targetName}`}
              </span>
            </div>
            <p className="text-xs text-foreground/90 leading-relaxed font-sans font-medium">
              {data.isHumanTarget
                ? "گسترش مرزها و برتری خیره‌کننده شما زنگ خطر بقا را در جهان به صدا درآورد. سه قدرت بزرگ با دفن اختلافات گذشته، پیمان دفاع جمعی امضا کرده و رسماً جنگ همه‌جانبه علیه خاک شما را آغاز کردند. صلح تا پایان نبرد غیرممکن است."
                : `قدرت‌های رقیب با تشکیل جبهه‌ای متحد علیه ${data.targetName}، عملیات مشترک مهار را آغاز کردند.`}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Users size={13} className="text-rose-400" />
              قدرت‌های تشکیل‌دهنده جبهه ائتلاف
            </span>
            <span className="text-[10px] font-mono text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
              وضعیت: جنگ متخاصم
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {memberNations.map((member) => (
              <div
                key={member.id}
                className="bg-card/90 border border-border/80 hover:border-rose-500/40 p-3 rounded-2xl flex flex-col justify-between space-y-2 shadow-sm transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl select-none">{member.flag}</span>
                  <div className="space-y-0.5 overflow-hidden">
                    <span className="text-xs font-black text-foreground block truncate">
                      {member.name}
                    </span>
                    <span className="text-[9px] font-mono text-muted-foreground block">
                      {member.id}
                    </span>
                  </div>
                </div>

                <div className="pt-1 border-t border-border/40 flex items-center justify-between text-[9px] font-mono text-muted-foreground">
                  <span>فناوری نظامی:</span>
                  <span className="font-bold text-amber-400">
                    سطح{" "}
                    {PersianNumberFormatter.toPersianDigits(member.techLevel)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-3 bg-secondary/40 border border-border/60 rounded-2xl flex items-center justify-between text-[11px] font-mono">
          <span className="text-muted-foreground font-sans flex items-center gap-1.5">
            <AlertTriangle size={13} className="text-amber-400 shrink-0" />
            وضعیت دیپلماتیک:
          </span>
          <span className="font-extrabold text-rose-400 font-sans">
            تحریم کامل تجاری • عدم پذیرش معاهدات صلح
          </span>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3.5 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-black text-xs transition-all cursor-pointer shadow-xl shadow-rose-600/20 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 border border-rose-500/40"
        >
          <Swords size={16} />
          <span>ابلاغ فرمان آماده‌باش رزمی به ارتش و بررسی جبهه‌ها</span>
        </button>
      </div>
    </UnifiedModalShell>
  );
}
