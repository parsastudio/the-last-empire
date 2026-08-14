import React from "react";
import { EspionageSabotageData } from "@/domain/espionage/espionage.schema";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

export function SabotageResultView({ data }: { data: EspionageSabotageData }) {
  return (
    <div className="bg-background/60 border border-border/40 p-3.5 rounded-2xl space-y-2 font-mono text-xs">
      <span className="text-[10px] text-muted-foreground font-sans font-bold block">
        آمار تسلیحات و پایگاه‌های منهدم‌شده دشمن:
      </span>
      <div className="grid grid-cols-3 gap-2 text-[10px]">
        {data.airDefenseDestroyed > 0 && (
          <div className="bg-secondary/40 p-2 rounded-xl border border-border/40">
            <span className="text-muted-foreground block font-sans text-[9px]">
              پدافند منهدم‌شده:
            </span>
            <span className="font-bold text-military block mt-0.5">
              -
              {PersianNumberFormatter.toPersianDigits(data.airDefenseDestroyed)}{" "}
              واحد
            </span>
          </div>
        )}
        {data.armorDestroyed > 0 && (
          <div className="bg-secondary/40 p-2 rounded-xl border border-border/40">
            <span className="text-muted-foreground block font-sans text-[9px]">
              تانک‌های منهدم‌شده:
            </span>
            <span className="font-bold text-military block mt-0.5">
              -{PersianNumberFormatter.toPersianDigits(data.armorDestroyed)}{" "}
              واحد
            </span>
          </div>
        )}
        {data.airForceDestroyed > 0 && (
          <div className="bg-secondary/40 p-2 rounded-xl border border-border/40">
            <span className="text-muted-foreground block font-sans text-[9px]">
              جنگنده منهدم‌شده:
            </span>
            <span className="font-bold text-military block mt-0.5">
              -{PersianNumberFormatter.toPersianDigits(data.airForceDestroyed)}{" "}
              فروند
            </span>
          </div>
        )}
        {data.droneMissileDestroyed > 0 && (
          <div className="bg-secondary/40 p-2 rounded-xl border border-border/40">
            <span className="text-muted-foreground block font-sans text-[9px]">
              موشک‌های سوخته:
            </span>
            <span className="font-bold text-military block mt-0.5">
              -
              {PersianNumberFormatter.toPersianDigits(
                data.droneMissileDestroyed,
              )}{" "}
              یگان
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
