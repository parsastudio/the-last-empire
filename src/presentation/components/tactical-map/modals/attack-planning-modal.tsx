import React from "react";
import { Swords, Shield, Plane, Radio, AlertTriangle } from "lucide-react";
import { AttackTheaterHeader } from "./attack/attack-theater-header";
import { AttackCoordinatesBox } from "./attack/attack-coordinates-box";
import { AttackLogisticsTable } from "./attack/attack-logistics-table";
import { AttackWarningsContainer } from "./attack/attack-warnings-container";
import { UnifiedModalShell } from "@/presentation/components/common/unified-modal-shell";
import { MilitaryStack } from "@/domain/military/military.schema";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { useAttackPlanning } from "./hooks/use-attack-planning";

interface AttackPlanningModalProps {
  isOpen: boolean;
  attackerName: string;
  attackerCode: string;
  targetName: string;
  targetCode: string;
  coordinate: { x: number; y: number };
  stance?: string;
  userOilStock?: number;
  userTreasury?: number;
  availableMilitary?: MilitaryStack;
  onClose: () => void;
  onConfirmAttack: () => void;
}

export function AttackPlanningModal(props: AttackPlanningModalProps) {
  const {
    isOpen,
    attackerName,
    attackerCode,
    targetName,
    targetCode,
    coordinate,
    stance = "PEACE",
    userOilStock = 100,
    userTreasury = 500000,
    availableMilitary,
    onClose,
    onConfirmAttack,
  } = props;

  const planning = useAttackPlanning({
    isOpen,
    attackerCode,
    targetName,
    targetCode,
    coordinate,
    stance,
    userOilStock,
    userTreasury,
    availableMilitary,
    onConfirmAttack,
  });

  if (!isOpen) return null;

  const isLandAttack = planning.validationResult?.isLandAttack ?? true;

  return (
    <UnifiedModalShell
      isOpen={isOpen}
      title={`طرح حمله استراتژیک به ${targetName}`}
      subtitle="اتاق عملیات | برنامه‌ریزی تهاجم"
      maxWidthClass="max-w-lg"
      onClose={onClose}
    >
      <div className="space-y-4 dir-rtl text-right">
        <AttackTheaterHeader
          attackerName={attackerName}
          attackerCode={attackerCode}
          targetName={targetName}
          targetCode={targetCode}
        />

        <AttackCoordinatesBox
          coordinate={coordinate}
          isLandAttack={isLandAttack}
        />

        {planning.isServerInvalid && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-2 text-xs text-rose-500 font-bold">
            <AlertTriangle size={15} className="shrink-0" />
            <span>
              {planning.validationResult?.errorMessage ||
                "منطقه هدف خارج از برد ترانزیت پایگاه‌های نظامی موجود است."}
            </span>
          </div>
        )}

        <div className="space-y-2.5 bg-background/50 border border-border/80 p-3.5 rounded-2xl font-mono text-xs">
          <span className="text-[10px] font-bold text-muted-foreground uppercase font-sans block">
            تخصیص یگان‌های رزمی تهاجم (از موجودی ارتش):
          </span>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-muted-foreground flex items-center gap-1 font-sans">
                <Shield size={12} className="text-primary" /> پیاده‌نظام:
              </span>
              <span className="font-bold text-foreground">
                {planning.infantry} / {planning.maxInfantry} یگان
              </span>
            </div>
            <input
              type="range"
              min="0"
              max={planning.maxInfantry}
              disabled={planning.maxInfantry === 0}
              value={planning.infantry}
              onChange={(e) => planning.setInfantry(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer h-1.5 bg-secondary rounded-lg disabled:opacity-30"
            />
            <div className="flex justify-between items-center text-[9px] text-muted-foreground font-sans pt-0.5">
              <span>مصرف سوخت این یگان:</span>
              <span className="font-mono text-treasury font-bold">
                {PersianNumberFormatter.toPersianDigits(
                  planning.logistics.infantryOil,
                )}{" "}
                بشکه
              </span>
            </div>
          </div>

          <div className="space-y-1.5 pt-1.5 border-t border-border/40">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-muted-foreground flex items-center gap-1 font-sans">
                <Plane size={12} className="text-gdp" /> جنگنده و پوشش هوایی:
              </span>
              <span className="font-bold text-foreground">
                {planning.airForce} / {planning.maxAirForce} فروند
              </span>
            </div>
            <input
              type="range"
              min="0"
              max={planning.maxAirForce}
              disabled={planning.maxAirForce === 0}
              value={planning.airForce}
              onChange={(e) => planning.setAirForce(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-secondary rounded-lg disabled:opacity-30"
            />
            <div className="flex justify-between items-center text-[9px] text-muted-foreground font-sans pt-0.5">
              <span>مصرف سوخت این یگان:</span>
              <span className="font-mono text-treasury font-bold">
                {PersianNumberFormatter.toPersianDigits(
                  planning.logistics.airForceOil,
                )}{" "}
                بشکه
              </span>
            </div>
          </div>

          <div className="space-y-1.5 pt-1.5 border-t border-border/40">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-muted-foreground flex items-center gap-1 font-sans">
                <Radio size={12} className="text-treasury" /> پهپاد و موشک:
              </span>
              <span className="font-bold text-foreground">
                {planning.droneMissile} / {planning.maxDroneMissile} یگان
              </span>
            </div>
            <input
              type="range"
              min="0"
              max={planning.maxDroneMissile}
              disabled={planning.maxDroneMissile === 0}
              value={planning.droneMissile}
              onChange={(e) => planning.setDroneMissile(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer h-1.5 bg-secondary rounded-lg disabled:opacity-30"
            />
            <div className="flex justify-between items-center text-[9px] text-muted-foreground font-sans pt-0.5">
              <span>مصرف سوخت این یگان:</span>
              <span className="font-mono text-treasury font-bold">
                {PersianNumberFormatter.toPersianDigits(
                  planning.logistics.droneOil,
                )}{" "}
                بشکه
              </span>
            </div>
          </div>
        </div>

        <AttackWarningsContainer
          isAtWar={planning.isAtWar}
          isBudgetDeficit={planning.isBudgetDeficit}
          isOilDeficit={planning.isOilDeficit}
          emergencyDebt={planning.emergencyDebt}
        />

        <AttackLogisticsTable
          estimatedCost={planning.finalCost}
          landTransitCost={planning.logistics.landTransitCost}
          heavyTransitCost={planning.logistics.heavyTransitCost}
          distanceKm={
            planning.validationResult?.distance ?? planning.logistics.distanceKm
          }
          isLandAttack={isLandAttack}
          requiredOil={planning.logistics.requiredOil}
          requiredSteel={planning.logistics.requiredSteel}
        />

        <div className="pt-2 border-t border-border">
          <button
            onClick={planning.handleConfirm}
            disabled={
              planning.isServerInvalid ||
              planning.isValidationLoading ||
              planning.totalForceSelected === 0 ||
              planning.isBudgetDeficit
            }
            className="w-full py-3.5 bg-military hover:bg-military/90 disabled:bg-secondary disabled:text-muted-foreground text-primary-foreground rounded-2xl font-bold transition-all text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-military/10"
          >
            <Swords size={16} />
            <span>
              {planning.isValidationLoading
                ? "در حال استعلام لژستیک سرور..."
                : planning.isBudgetDeficit
                  ? "موجودی خزانه برای لژستیک نبرد کافی نیست"
                  : planning.totalForceSelected === 0
                    ? "حداقل یک یگان رزمی انتخاب کنید"
                    : `تایید و صدور دستور حمله به ${targetName}`}
            </span>
          </button>
        </div>
      </div>
    </UnifiedModalShell>
  );
}
