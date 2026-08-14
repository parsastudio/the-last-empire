import React from "react";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { EspionageExecutionResult } from "@/domain/espionage/espionage.schema";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

export function EspionageResultBanner({
  result,
}: {
  result: EspionageExecutionResult;
}) {
  const isSuccess = result.outcome !== "CRITICAL_FAILURE";
  const isClean = result.outcome === "CLEAN_SUCCESS";

  return (
    <div
      className={`p-4 rounded-3xl border space-y-3.5 animate-in fade-in duration-200 dir-rtl text-right ${
        isClean
          ? "bg-emerald-500/10 border-emerald-500/40 text-foreground"
          : isSuccess
            ? "bg-amber-500/10 border-amber-500/40 text-foreground"
            : "bg-rose-500/10 border-rose-500/40 text-foreground"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isClean ? (
            <CheckCircle2 size={18} className="text-emerald-500" />
          ) : isSuccess ? (
            <AlertTriangle size={18} className="text-amber-500" />
          ) : (
            <XCircle size={18} className="text-rose-500" />
          )}
          <span className="text-xs font-black">
            {isClean
              ? "موفقیت کامل و بدون ردپا (Clean Hit)"
              : isSuccess
                ? "موفقیت عملیات همراه با ردیابی منشأ"
                : "شکست عملیات و مداخله ضدجاسوسی"}
          </span>
        </div>

        <span className="text-[9px] font-mono bg-background/80 px-2 py-0.5 rounded-lg border border-border/40 text-muted-foreground">
          {result.targetName}
        </span>
      </div>

      <p className="text-xs leading-relaxed font-sans">{result.message}</p>

      {result.reconData && (
        <div className="bg-background/60 border border-border/40 p-3.5 rounded-2xl space-y-2.5 font-mono text-xs">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground font-sans font-bold border-b border-border/40 pb-1.5">
            <span>اطلاعات استراتژیک کشف‌شده:</span>
            <span className="text-gdp">
              خزانه:{" "}
              {PersianNumberFormatter.formatCurrency(result.reconData.treasury)}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-[10px]">
            <div className="bg-secondary/40 p-2 rounded-xl border border-border/40">
              <span className="text-muted-foreground block font-sans text-[9px]">
                پیاده‌نظام:
              </span>
              <span className="font-bold text-foreground block mt-0.5">
                {PersianNumberFormatter.toPersianDigits(
                  result.reconData.infantry.toLocaleString("en-US"),
                )}
              </span>
            </div>
            <div className="bg-secondary/40 p-2 rounded-xl border border-border/40">
              <span className="text-muted-foreground block font-sans text-[9px]">
                زرهی و تانک:
              </span>
              <span className="font-bold text-foreground block mt-0.5">
                {PersianNumberFormatter.toPersianDigits(
                  result.reconData.armor.toLocaleString("en-US"),
                )}
              </span>
            </div>
            <div className="bg-secondary/40 p-2 rounded-xl border border-border/40">
              <span className="text-muted-foreground block font-sans text-[9px]">
                پدافند موشکی:
              </span>
              <span className="font-bold text-foreground block mt-0.5">
                {PersianNumberFormatter.toPersianDigits(
                  result.reconData.airDefense.toLocaleString("en-US"),
                )}
              </span>
            </div>
            <div className="bg-secondary/40 p-2 rounded-xl border border-border/40">
              <span className="text-muted-foreground block font-sans text-[9px]">
                جنگنده‌ها:
              </span>
              <span className="font-bold text-foreground block mt-0.5">
                {PersianNumberFormatter.toPersianDigits(
                  result.reconData.airForce.toLocaleString("en-US"),
                )}
              </span>
            </div>
            <div className="bg-secondary/40 p-2 rounded-xl border border-border/40">
              <span className="text-muted-foreground block font-sans text-[9px]">
                پهپاد و موشک:
              </span>
              <span className="font-bold text-foreground block mt-0.5">
                {PersianNumberFormatter.toPersianDigits(
                  result.reconData.droneMissile.toLocaleString("en-US"),
                )}
              </span>
            </div>
            <div className="bg-secondary/40 p-2 rounded-xl border border-border/40">
              <span className="text-muted-foreground block font-sans text-[9px]">
                سطح فناوری:
              </span>
              <span className="font-bold text-amber-500 block mt-0.5">
                سطح{" "}
                {PersianNumberFormatter.toPersianDigits(
                  result.reconData.techLevel,
                )}
              </span>
            </div>
          </div>
        </div>
      )}

      {result.sabotageData && (
        <div className="bg-background/60 border border-border/40 p-3.5 rounded-2xl space-y-2 font-mono text-xs">
          <span className="text-[10px] text-muted-foreground font-sans font-bold block">
            آمار تسلیحات و پایگاه‌های منهدم‌شده دشمن:
          </span>
          <div className="grid grid-cols-3 gap-2 text-[10px]">
            {result.sabotageData.airDefenseDestroyed > 0 && (
              <div className="bg-secondary/40 p-2 rounded-xl border border-border/40">
                <span className="text-muted-foreground block font-sans text-[9px]">
                  پدافند منهدم‌شده:
                </span>
                <span className="font-bold text-military block mt-0.5">
                  -
                  {PersianNumberFormatter.toPersianDigits(
                    result.sabotageData.airDefenseDestroyed,
                  )}{" "}
                  واحد
                </span>
              </div>
            )}
            {result.sabotageData.armorDestroyed > 0 && (
              <div className="bg-secondary/40 p-2 rounded-xl border border-border/40">
                <span className="text-muted-foreground block font-sans text-[9px]">
                  تانک‌های منهدم‌شده:
                </span>
                <span className="font-bold text-military block mt-0.5">
                  -
                  {PersianNumberFormatter.toPersianDigits(
                    result.sabotageData.armorDestroyed,
                  )}{" "}
                  واحد
                </span>
              </div>
            )}
            {result.sabotageData.airForceDestroyed > 0 && (
              <div className="bg-secondary/40 p-2 rounded-xl border border-border/40">
                <span className="text-muted-foreground block font-sans text-[9px]">
                  جنگنده منهدم‌شده:
                </span>
                <span className="font-bold text-military block mt-0.5">
                  -
                  {PersianNumberFormatter.toPersianDigits(
                    result.sabotageData.airForceDestroyed,
                  )}{" "}
                  فروند
                </span>
              </div>
            )}
            {result.sabotageData.droneMissileDestroyed > 0 && (
              <div className="bg-secondary/40 p-2 rounded-xl border border-border/40">
                <span className="text-muted-foreground block font-sans text-[9px]">
                  موشک‌های سوخته:
                </span>
                <span className="font-bold text-military block mt-0.5">
                  -
                  {PersianNumberFormatter.toPersianDigits(
                    result.sabotageData.droneMissileDestroyed,
                  )}{" "}
                  یگان
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {result.techTheftData && (
        <div className="bg-background/60 border border-border/40 p-3.5 rounded-2xl space-y-2 font-mono text-xs">
          <span className="text-[10px] text-muted-foreground font-sans font-bold block">
            امتیازات استخراج‌شده و اعمال‌شده بر ارکان کشور شما:
          </span>
          <div className="grid grid-cols-3 gap-2 text-[10px]">
            {result.techTheftData.militaryTechGained > 0 && (
              <div className="bg-secondary/40 p-2 rounded-xl border border-border/40">
                <span className="text-muted-foreground block font-sans text-[9px]">
                  رشد فناوری دفاعی:
                </span>
                <span className="font-bold text-amber-500 block mt-0.5">
                  +
                  {PersianNumberFormatter.toPersianDigits(
                    result.techTheftData.militaryTechGained,
                  )}{" "}
                  سطح
                </span>
              </div>
            )}
            {result.techTheftData.industrialLevelGained > 0 && (
              <div className="bg-secondary/40 p-2 rounded-xl border border-border/40">
                <span className="text-muted-foreground block font-sans text-[9px]">
                  رشد سطح صنعت:
                </span>
                <span className="font-bold text-gdp block mt-0.5">
                  +
                  {PersianNumberFormatter.toPersianDigits(
                    result.techTheftData.industrialLevelGained,
                  )}{" "}
                  سطح
                </span>
              </div>
            )}
            {result.techTheftData.infrastructureLevelGained > 0 && (
              <div className="bg-secondary/40 p-2 rounded-xl border border-border/40">
                <span className="text-muted-foreground block font-sans text-[9px]">
                  رشد زیرساخت و مسکن:
                </span>
                <span className="font-bold text-primary block mt-0.5">
                  +
                  {PersianNumberFormatter.toPersianDigits(
                    result.techTheftData.infrastructureLevelGained,
                  )}{" "}
                  سطح
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
