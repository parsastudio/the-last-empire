import { DEFAULT_DOCTRINES } from "@/engine/politics/doctrines-list.config";

export interface PresentationDoctrineItem {
  id: string;
  name: string;
  branch: "INDUSTRIAL_TECH" | "ASYMMETRIC_MILITARY" | "DIPLOMATIC_HEGEMONY";
  cost: number;
}

export const PRESENTATION_DOCTRINES: PresentationDoctrineItem[] =
  DEFAULT_DOCTRINES.map((d) => {
    let faName = d.name;
    if (d.id === "gdp-booster") faName = "خطوط تولید اتوماتیک";
    else if (d.id === "low-upkeep") faName = "شبکه لجستیک سبز";
    else if (d.id === "border-fortification")
      faName = "پروتکل‌های استقرار مرزی";
    else if (d.id === "drone-swarm") faName = "تسلیحات شبکه‌ای پهپادی";
    else if (d.id === "global-influence") faName = "دیپلماسی رسانه‌ای";
    else if (d.id === "reputation-recovery") faName = "بازسازی هژمونی رسانه‌ای";

    return {
      id: d.id,
      name: faName,
      branch: d.branch,
      cost: d.cost,
    };
  });
