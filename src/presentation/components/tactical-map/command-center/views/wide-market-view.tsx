"use client";

import React from "react";
import { ShoppingBag, Landmark, ShieldCheck } from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { Nation } from "@/domain/nation/nation.schema";

interface WideMarketViewProps {
  userTreasury?: number;
  nation?: Nation | null;
}

export function WideMarketView({
  userTreasury = 100000000,
  nation,
}: WideMarketViewProps) {
  const activeTreasury = nation ? nation.treasury : userTreasury;

  return (
    <div className="space-y-5 animate-in fade-in duration-200 dir-rtl text-right">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
            <ShoppingBag size={18} className="text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-foreground tracking-tight">
              دیوان تجارت و مبادلات بین‌المللی
            </h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed font-sans">
              پایش درآمد گمرک، تعرفه‌های تجاری و ذخایر مالی کشور
            </p>
          </div>
        </div>
      </div>

      <div className="bg-secondary/50 border border-border/70 p-4 rounded-2xl flex items-center justify-between font-mono text-xs">
        <span className="text-muted-foreground font-sans font-bold flex items-center gap-2">
          <Landmark size={16} className="text-gdp" />
          موجودی خزانه ملی جهت سرمایه‌گذاری:
        </span>
        <span className="font-extrabold text-gdp text-sm">
          {PersianNumberFormatter.formatCurrency(activeTreasury, true)}
        </span>
      </div>

      <div className="bg-background/40 border border-border/60 rounded-2xl p-6 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto">
          <ShieldCheck size={24} />
        </div>
        <h4 className="text-xs font-bold text-foreground">
          سیستم جدید تجارت خودمختار و دموگرافیک فعال است
        </h4>
        <p className="text-[11px] text-muted-foreground max-w-md mx-auto leading-relaxed font-sans">
          مبادلات کالایی و مصارف انرژی اکنون به صورت ارگانیک و خودکار در سطح
          دموگرافی و صنعت کشور مدیریت می‌شوند.
        </p>
      </div>
    </div>
  );
}
