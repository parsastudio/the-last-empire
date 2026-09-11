import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { ShieldCheck, ShieldX, Skull } from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { SecurityGuaranteeValidationResult } from "@geopolitics/domain";
import { SecurityGuaranteeModal } from "../modals/security-guarantee-modal";
import { EmergencyProtectorateModal } from "../modals/emergency-protectorate-modal";

interface DiplomacySecurityUmbrellaActionsProps {
  targetName: string;
  targetFlagCode?: string;
  targetNationId: string;
  isWar: boolean;
  hasSecurityGuarantee?: boolean;
  isEmergencyProtectorate?: boolean;
  securityGuaranteeCost: number;
  emergencyProtectorateCost: number;
  guaranteeValidation?: SecurityGuaranteeValidationResult;
  emergencyValidation?: SecurityGuaranteeValidationResult;
  onSecurityGuarantee: () => void;
  onEmergencyProtectorate: () => void;
  onCancelSecurityGuarantee: () => void;
  onCancelEmergencyProtectorate: () => void;
}

export function DiplomacySecurityUmbrellaActions({
  targetName,
  targetFlagCode,
  targetNationId,
  isWar,
  hasSecurityGuarantee = false,
  isEmergencyProtectorate = false,
  securityGuaranteeCost,
  emergencyProtectorateCost,
  guaranteeValidation,
  emergencyValidation,
  onSecurityGuarantee,
  onEmergencyProtectorate,
  onCancelSecurityGuarantee,
  onCancelEmergencyProtectorate,
}: DiplomacySecurityUmbrellaActionsProps) {
  const t = useTranslations("diplomacy");
  const [isGuaranteeModalOpen, setIsGuaranteeModalOpen] = useState(false);
  const [isProtectorateModalOpen, setIsProtectorateModalOpen] = useState(false);

  if (isEmergencyProtectorate) {
    return (
      <div className="p-3.5 bg-rose-950/40 border border-rose-500/60 rounded-2xl space-y-2 font-sans">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-300 text-xs font-black">
            <Skull size={16} className="text-rose-400 animate-pulse" />
            <span>{t("umbrella.protectorateActive")}</span>
          </div>
          <span className="text-[10px] font-mono text-rose-400 font-bold">
            {t("umbrella.protectorateTribute", {
              cost: PersianNumberFormatter.formatCurrency(
                emergencyProtectorateCost,
                true,
              ),
            })}
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          {t("umbrella.protectorateDesc")}
        </p>
        <button
          onClick={onCancelEmergencyProtectorate}
          className="w-full py-2 bg-secondary/80 hover:bg-rose-500/20 text-muted-foreground hover:text-rose-400 border border-border/60 hover:border-rose-500/40 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          <ShieldX size={13} />
          <span>{t("umbrella.revokeProtectorate")}</span>
        </button>
      </div>
    );
  }

  if (hasSecurityGuarantee) {
    return (
      <div className="p-3.5 bg-cyan-950/30 border border-cyan-500/40 rounded-2xl space-y-2 font-sans">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-300 text-xs font-black">
            <ShieldCheck size={16} />
            <span>{t("umbrella.defensePactActive")}</span>
          </div>
          <span className="text-[10px] font-mono text-cyan-400 font-bold">
            {t("umbrella.defensePactIntervention")}
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          {t("umbrella.defensePactDesc", { name: targetName })}
        </p>
        <button
          onClick={onCancelSecurityGuarantee}
          className="w-full py-2 bg-secondary/80 hover:bg-rose-500/20 text-muted-foreground hover:text-rose-400 border border-border/60 hover:border-rose-500/40 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          <ShieldX size={13} />
          <span>{t("umbrella.revokeDefensePact")}</span>
        </button>
      </div>
    );
  }

  if (isWar) {
    return null;
  }

  const defaultValidation: SecurityGuaranteeValidationResult = {
    isValid: false,
    gdpRatio: 1,
    techDiff: 0,
    tension: 0,
    isGdpValid: false,
    isTechValid: true,
    isTensionValid: true,
    isNotWar: true,
    hasSlotAvailable: false,
    canAffordCost: false,
  };

  const safeGuaranteeVal = guaranteeValidation || defaultValidation;
  const safeEmergencyVal = emergencyValidation || defaultValidation;

  return (
    <div className="space-y-2 font-sans">
      <button
        onClick={() => setIsGuaranteeModalOpen(true)}
        className="w-full p-3.5 rounded-2xl bg-cyan-950/25 hover:bg-cyan-950/45 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 text-right transition-all cursor-pointer space-y-1 shadow-sm font-sans"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-black flex items-center gap-2">
            <ShieldCheck size={16} className="text-cyan-400" />
            <span>{t("umbrella.openDefenseModal")}</span>
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg border bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
            {t("umbrella.openDefenseModalBadge")}
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          {t("umbrella.openDefenseModalDesc")}
        </p>
      </button>

      <button
        onClick={() => setIsProtectorateModalOpen(true)}
        className="w-full p-3.5 rounded-2xl bg-rose-950/25 hover:bg-rose-950/45 border border-rose-500/40 hover:border-rose-400 text-rose-300 text-right transition-all cursor-pointer space-y-1 shadow-sm font-sans"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-black flex items-center gap-2">
            <Skull size={16} className="text-rose-400" />
            <span>{t("umbrella.openProtectorateModal")}</span>
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg border bg-rose-500/20 text-rose-300 border-rose-500/30">
            {t("umbrella.openProtectorateModalBadge")}
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          {t("umbrella.openProtectorateModalDesc")}
        </p>
      </button>

      <SecurityGuaranteeModal
        isOpen={isGuaranteeModalOpen}
        targetName={targetName}
        targetFlagCode={targetFlagCode}
        targetNationId={targetNationId}
        isWar={false}
        signingCost={securityGuaranteeCost}
        validation={safeGuaranteeVal}
        onConfirmGuarantee={onSecurityGuarantee}
        onClose={() => setIsGuaranteeModalOpen(false)}
      />

      <EmergencyProtectorateModal
        isOpen={isProtectorateModalOpen}
        targetName={targetName}
        targetFlagCode={targetFlagCode}
        targetNationId={targetNationId}
        costPerTurn={emergencyProtectorateCost}
        validation={safeEmergencyVal}
        onConfirmProtectorate={onEmergencyProtectorate}
        onClose={() => setIsProtectorateModalOpen(false)}
      />
    </div>
  );
}
