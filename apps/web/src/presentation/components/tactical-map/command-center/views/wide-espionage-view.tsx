import React from "react";
import { Radio, ShieldAlert, Binary, Award, Users } from "lucide-react";
import { Nation } from "@/domain/nation/nation.schema";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { EspionageTargetSelector } from "@/presentation/components/tactical-map/command-center/views/espionage/espionage-target-selector";
import { EspionageTierCard } from "@/presentation/components/tactical-map/command-center/views/espionage/espionage-tier-card";
import { EspionageResultBanner } from "@/presentation/components/tactical-map/command-center/views/espionage/espionage-result-banner";
import { useWideEspionageForm } from "@/presentation/components/tactical-map/command-center/views/hooks/use-wide-espionage-form";

interface WideEspionageViewProps {
  nation: Nation;
  nationsMap?: Record<string, Nation>;
  selectedTargetCode?: string | null;
}

export function WideEspionageView({
  nation,
  nationsMap,
  selectedTargetCode,
}: WideEspionageViewProps) {
  const form = useWideEspionageForm({
    nation,
    nationsMap,
    selectedTargetCode,
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-200 dir-rtl text-right">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 dir-rtl text-right">
        <div className="lg:col-span-4">
          <EspionageTargetSelector
            targets={form.countryOptions}
            selectedTargetId={form.selectedTargetId}
            searchQuery={form.searchQuery}
            onSearchChange={form.setSearchQuery}
            onSelectTarget={form.setSelectedTargetId}
          />
        </div>

        <div className="lg:col-span-8 space-y-4 bg-background/40 p-5 border border-border/80 rounded-3xl">
          {form.selectedTargetNation ? (
            <>
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <div className="flex items-center gap-3">
                  <span
                    className="text-3xl select-none"
                    role="img"
                    aria-label={form.selectedTargetNation.name}
                  >
                    {getFlagEmoji(form.selectedTargetNation.flagCode)}
                  </span>
                  <div>
                    <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                      <span>
                        میز عملیات سیاه علیه {form.selectedTargetNation.name}
                      </span>
                      <span className="text-[10px] font-mono font-bold bg-secondary px-2 py-0.5 rounded-lg text-muted-foreground border border-border/60">
                        رتبه جهانی #
                        {PersianNumberFormatter.toPersianDigits(
                          form.selectedTargetNation.rank,
                        )}
                      </span>
                    </h3>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      تولید ناخالص:{" "}
                      {PersianNumberFormatter.formatCurrency(
                        form.targetGdp,
                        true,
                      )}{" "}
                      | پایداری نظام:{" "}
                      {PersianNumberFormatter.toPersianDigits(
                        form.selectedTargetNation.government.stability,
                      )}
                      ٪
                    </span>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-1.5 font-mono text-[10px] bg-secondary/80 px-2.5 py-1 rounded-xl text-primary font-bold border border-primary/20">
                  <Award size={12} />
                  <span>
                    توان سایبری شما: سطح{" "}
                    {PersianNumberFormatter.toPersianDigits(
                      nation.industrialLevel,
                    )}
                  </span>
                </div>
              </div>

              {form.lastResult && (
                <EspionageResultBanner result={form.lastResult} />
              )}

              <div className="grid grid-cols-1 gap-3.5">
                <EspionageTierCard
                  tier={1}
                  title="شنود ماهواره‌ای و کشف زرادخانه (Strategic Recon)"
                  subtitle="نفوذ سیگنالی و آشکارسازی فوری ترکیب تمام یگان‌های ارتش، پدافند موشکی و موجودی واقعی خزانه کشور هدف."
                  icon={Radio}
                  iconColorClass="text-primary"
                  borderColorClass="border-primary/40"
                  cost={form.tier1Cost}
                  successRate={form.tier1SuccessRate}
                  isExecutedThisTurn={form.executedTiers.includes(1)}
                  canAfford={nation.treasury >= form.tier1Cost}
                  isExecuting={form.isSubmitting}
                  onExecute={() => form.handleExecute(1)}
                />

                <EspionageTierCard
                  tier={2}
                  title="خرابکاری در پایگاه‌های تسلیحاتی و پدافند (Defense Sabotage)"
                  subtitle="انفجار و از کار انداختن مستقیم ۲۰٪ تا ۳۰٪ از سامانه‌های پدافند هوایی، تانک‌ها و جنگنده‌های آماده رزم حریف قبل از آغاز حمله نظامی شما."
                  icon={ShieldAlert}
                  iconColorClass="text-military"
                  borderColorClass="border-military/40"
                  cost={form.tier2Cost}
                  successRate={form.tier2SuccessRate}
                  isExecutedThisTurn={form.executedTiers.includes(2)}
                  canAfford={nation.treasury >= form.tier2Cost}
                  isExecuting={form.isSubmitting}
                  onExecute={() => form.handleExecute(2)}
                />

                <EspionageTierCard
                  tier={3}
                  title="سرقت فوق‌محرمانه اسرار و جهش ۳ لِوِل فناوری (Superpower Tech Heist)"
                  subtitle={`نفوذ به سرورهای محرمانه و سرقت تا سقف ۳ امتیاز ارتقا در زمینه‌هایی که ${form.selectedTargetNation.name} از شما برتر است (+${PersianNumberFormatter.toPersianDigits(Math.min(3, form.techSuperiority.totalAvailablePoints))} سطح آماده تصاحب).`}
                  icon={Binary}
                  iconColorClass="text-amber-500"
                  borderColorClass="border-amber-500/40"
                  cost={form.tier3Cost}
                  successRate={form.tier3SuccessRate}
                  isExecutedThisTurn={form.executedTiers.includes(3)}
                  canAfford={nation.treasury >= form.tier3Cost}
                  isDisabledCondition={
                    form.techSuperiority.totalAvailablePoints <= 0
                  }
                  disabledReasonText="کشور هدف در هیچ زمینه‌ای (نظامی، صنعتی یا زیرساخت) برتری فناوری ندارد."
                  isExecuting={form.isSubmitting}
                  onExecute={() => form.handleExecute(3)}
                />
              </div>
            </>
          ) : (
            <div className="py-24 flex flex-col items-center justify-center gap-4 text-center px-4">
              <div className="w-14 h-14 rounded-2xl bg-secondary/60 border border-border flex items-center justify-center text-muted-foreground">
                <Users size={28} />
              </div>
              <div className="space-y-1.5 max-w-sm">
                <h4 className="text-sm font-bold text-foreground font-sans">
                  مرکز مانیتورینگ سرویس اطلاعات و جاسوسی
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed font-sans">
                  برای آغاز عملیات شنود، خرابکاری در پدافند یا سرقت فناوری، یک
                  کشور را از ستون کناری انتخاب فرمایید.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
