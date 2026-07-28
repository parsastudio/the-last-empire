import React from "react";
import { ShieldAlert, Receipt, AlertTriangle } from "lucide-react";

interface AttackWarningsContainerProps {
  isAtWar: boolean;
  isBudgetDeficit: boolean;
  isOilDeficit: boolean;
  emergencyDebt: number;
}

export function AttackWarningsContainer({
  isAtWar,
  isBudgetDeficit,
  isOilDeficit,
  emergencyDebt,
}: AttackWarningsContainerProps) {
  return (
    <div className="space-y-2.5">
      {!isAtWar && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start gap-2.5 text-xs text-rose-500">
          <ShieldAlert size={16} className="shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold block">هشدار وضعیت دیپلماتیک</span>
            <p className="text-[11px] text-foreground/80 leading-relaxed">
              شما در وضعیت صلح هستید! حمله مستقیم بدون اعلام جنگ باعث افت شدید
              ثبات سیاسی (-۳۰٪) و صدمه به اعتبار جهانی خواهد شد.
            </p>
          </div>
        </div>
      )}

      {isBudgetDeficit && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start gap-2.5 text-xs text-rose-500">
          <Receipt size={16} className="shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold block">
              هشدار کسر بودجه و ایجاد بدهی ملی
            </span>
            <p className="text-[11px] text-foreground/80 leading-relaxed">
              موجودی خزانه کافی نیست! انجام نبرد باعث ایجاد $
              {emergencyDebt.toLocaleString("fa-IR")} بدهی اضطراری ملی و اعمال
              ضریب منفی به قدرت رزمی خواهد شد.
            </p>
          </div>
        </div>
      )}

      {isOilDeficit && (
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-2.5 text-xs text-amber-500">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold block">هشدار کمبود سوخت</span>
            <p className="text-[11px] text-foreground/80 leading-relaxed">
              ذخایر نفت کافی نیست! انجام حمله بدون سوخت کافی، ضریب منفی به قدرت
              رزمی یگان‌ها اعمال خواهد کرد.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
