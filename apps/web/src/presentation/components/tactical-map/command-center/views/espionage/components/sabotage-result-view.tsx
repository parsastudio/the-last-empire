import React from "react";
import { useTranslations } from "next-intl";
import { EspionageSabotageData } from "@/domain/espionage/espionage.schema";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

export function SabotageResultView({ data }: { data: EspionageSabotageData }) {
  const t = useTranslations("espionage.results.sabotage");

  return (
    <div className="bg-background/60 border border-border/40 p-3.5 rounded-2xl space-y-2 font-mono text-xs">
      <span className="text-[10px] text-muted-foreground font-sans font-bold block">
        {t("title")}
      </span>
      <div className="grid grid-cols-3 gap-2 text-[10px]">
        {data.airDefenseDestroyed > 0 && (
          <div className="bg-secondary/40 p-2 rounded-xl border border-border/40">
            <span className="text-muted-foreground block font-sans text-[9px]">
              {t("airDefense")}
            </span>
            <span className="font-bold text-military block mt-0.5">
              -
              {PersianNumberFormatter.toPersianDigits(data.airDefenseDestroyed)}{" "}
              {t("unit")}
            </span>
          </div>
        )}
        {data.armorDestroyed > 0 && (
          <div className="bg-secondary/40 p-2 rounded-xl border border-border/40">
            <span className="text-muted-foreground block font-sans text-[9px]">
              {t("armor")}
            </span>
            <span className="font-bold text-military block mt-0.5">
              -{PersianNumberFormatter.toPersianDigits(data.armorDestroyed)}{" "}
              {t("unit")}
            </span>
          </div>
        )}
        {data.airForceDestroyed > 0 && (
          <div className="bg-secondary/40 p-2 rounded-xl border border-border/40">
            <span className="text-muted-foreground block font-sans text-[9px]">
              {t("airForce")}
            </span>
            <span className="font-bold text-military block mt-0.5">
              -{PersianNumberFormatter.toPersianDigits(data.airForceDestroyed)}{" "}
              {t("jet")}
            </span>
          </div>
        )}
        {data.droneMissileDestroyed > 0 && (
          <div className="bg-secondary/40 p-2 rounded-xl border border-border/40">
            <span className="text-muted-foreground block font-sans text-[9px]">
              {t("droneMissile")}
            </span>
            <span className="font-bold text-military block mt-0.5">
              -
              {PersianNumberFormatter.toPersianDigits(
                data.droneMissileDestroyed,
              )}{" "}
              {t("brigade")}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
