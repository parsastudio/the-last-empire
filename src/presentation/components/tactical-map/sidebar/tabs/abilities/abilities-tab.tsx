import React from "react";
import { Zap } from "lucide-react";
import { REGIME_ABILITIES, AbilityItem } from "./abilities.config";
import { AbilityCard } from "./ability-card";

interface AbilitiesTabProps {
  currentGovernment: string;
}

export function AbilitiesTab({ currentGovernment }: AbilitiesTabProps) {
  const handleActivate = (ability: AbilityItem) => {
    if (ability.requiredGov !== currentGovernment) {
      alert(
        `خطا: این قابلیت اختصاصی رژیم '${ability.govLabel}' است. نظام سیاسی فعلی شما مطابقت ندارد.`,
      );
      return;
    }
    alert(
      `قابلیت راهبردی «${ability.name}» با موفقیت فعال شد و اثرات آن در نوبت بعدی اعمال خواهد شد.`,
    );
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="flex items-center gap-2 px-1">
        <Zap size={13} className="text-treasury" />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
          قابلیت‌ها و توانمندی‌های ویژه حکومتی
        </span>
      </div>

      <div className="space-y-3">
        {REGIME_ABILITIES.map((ab) => (
          <AbilityCard
            key={ab.id}
            ability={ab}
            currentGovernment={currentGovernment}
            onActivate={handleActivate}
          />
        ))}
      </div>
    </div>
  );
}
