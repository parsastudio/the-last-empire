import React from "react";
import { DoctrineBranchColumn } from "./components/doctrine-branch-column";

export function WideResearchView() {
  const industrialDoctrines = [
    {
      id: "gdp-booster",
      name: "خطوط تولید اتوماتیک",
      cost: 3,
      unlocked: true,
    },
    { id: "low-upkeep", name: "شبکه لجستیک سبز", cost: 5, unlocked: false },
  ];

  const asymmetricDoctrines = [
    {
      id: "border-fortification",
      name: "پروتکل‌های مرزی",
      cost: 3,
      unlocked: false,
    },
    {
      id: "drone-swarm",
      name: "تسلیحات شبکه‌ای پهپادی",
      cost: 5,
      unlocked: false,
    },
  ];

  const diplomaticDoctrines = [
    {
      id: "global-influence",
      name: "دیپلماسی رسانه‌ای",
      cost: 3,
      unlocked: false,
    },
    {
      id: "reputation-recovery",
      name: "هژمونی رسانه‌ای",
      cost: 5,
      unlocked: false,
    },
  ];

  const handleUnlock = (doc: { name: string }) => {
    alert(`درخواست آنلاک دکترین ${doc.name} ثبت شد.`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-in fade-in duration-200 dir-rtl">
      <DoctrineBranchColumn
        title="شاخه‌ صنعت و لجستیک"
        doctrines={industrialDoctrines}
        onUnlock={handleUnlock}
      />
      <DoctrineBranchColumn
        title="شاخه‌ دفاع ناهمگون نظامی"
        doctrines={asymmetricDoctrines}
        onUnlock={handleUnlock}
      />
      <DoctrineBranchColumn
        title="شاخه‌ هژمونی دیپلماتیک"
        doctrines={diplomaticDoctrines}
        onUnlock={handleUnlock}
      />
    </div>
  );
}
