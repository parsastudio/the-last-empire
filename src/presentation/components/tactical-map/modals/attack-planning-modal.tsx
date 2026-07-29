import React, { useState, useMemo } from "react";
import { Swords, Shield, Plane, Radio, AlertTriangle } from "lucide-react";
import { AttackTheaterHeader } from "./attack/attack-theater-header";
import { AttackCoordinatesBox } from "./attack/attack-coordinates-box";
import { AttackLogisticsTable } from "./attack/attack-logistics-table";
import { AttackWarningsContainer } from "./attack/attack-warnings-container";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { AttackForceEstimator } from "./attack/attack-force-estimator";
import { useBattleValidation } from "@/presentation/hooks/game/use-battle-validation";
import { UnifiedModalShell } from "@/presentation/components/common/unified-modal-shell";
import { MilitaryStack } from "@/domain/military/military.schema";

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

export function AttackPlanningModal({
  isOpen,
  attackerName,
  attackerCode,
  targetName,
  targetCode,
  coordinate,
  stance = "PEACE",
  userOilStock = 100,
  userTreasury = 500000,
  availableMilitary = {
    infantry: 50,
    airForce: 10,
    droneMissile: 5,
    experience: 10,
    techLevel: 1,
  },
  onClose,
  onConfirmAttack,
}: AttackPlanningModalProps) {
  const maxInfantry = Math.max(0, availableMilitary.infantry);
  const maxAirForce = Math.max(0, availableMilitary.airForce);
  const maxDroneMissile = Math.max(0, availableMilitary.droneMissile);

  const [infantry, setInfantry] = useState<number>(
    Math.min(50, Math.max(1, maxInfantry)),
  );
  const [airForce, setAirForce] = useState<number>(
    Math.min(10, Math.max(0, maxAirForce)),
  );
  const [droneMissile, setDroneMissile] = useState<number>(
    Math.min(5, Math.max(0, maxDroneMissile)),
  );

  const [prevCoordinate, setPrevCoordinate] = useState<{
    x: number;
    y: number;
  } | null>(null);

  if (coordinate !== prevCoordinate) {
    setPrevCoordinate(coordinate);
    setInfantry(Math.min(50, Math.max(1, maxInfantry)));
    setAirForce(Math.min(10, Math.max(0, maxAirForce)));
    setDroneMissile(Math.min(5, Math.max(0, maxDroneMissile)));
  }

  const { dispatchAction } = useGameActions();
  const estimator = useMemo(() => new AttackForceEstimator(), []);

  const fullAttackerId = attackerCode.startsWith("NATION_")
    ? attackerCode
    : `NATION_${attackerCode}`;

  const { validationResult, loading: isValidationLoading } =
    useBattleValidation(fullAttackerId, coordinate, isOpen);

  if (!isOpen) return null;

  const distMultiplier = validationResult?.distance
    ? Math.max(1, Math.floor(validationResult.distance / 10))
    : 1;

  const logistics = estimator.calculateLogisticsCost({
    infantry,
    airForce,
    droneMissile,
    distanceMultiplier: distMultiplier,
  });

  const finalCost = validationResult?.logisticsCost
    ? validationResult.logisticsCost + logistics.estimatedMoneyCost
    : logistics.estimatedMoneyCost;

  const isAtWar = stance === "WAR";
  const isOilDeficit = userOilStock < logistics.requiredOil;
  const isBudgetDeficit = userTreasury < finalCost;
  const emergencyDebt = isBudgetDeficit
    ? finalCost - Math.max(0, userTreasury)
    : 0;

  const isServerInvalid =
    validationResult !== null && validationResult.isValid === false;

  const totalForceSelected = infantry + airForce + droneMissile;

  const handleConfirm = async () => {
    if (totalForceSelected <= 0) return;

    const fullTargetId = targetCode.startsWith("NATION_")
      ? targetCode
      : `NATION_${targetCode}`;

    const success = await dispatchAction(
      {
        id: `attack-${Date.now()}`,
        nationId: fullAttackerId,
        type: "ATTACK",
        targetNationId: fullTargetId,
        infantry,
        airForce,
        droneMissile,
        targetX: coordinate.x,
        targetY: coordinate.y,
        targetCoordinate: coordinate,
      },
      `فرمان حمله به نیروهای ${targetName} صادر گردید.`,
    );

    if (success) {
      onConfirmAttack();
    }
  };

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

        <AttackCoordinatesBox coordinate={coordinate} />

        {isServerInvalid && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-2 text-xs text-rose-500 font-bold">
            <AlertTriangle size={15} className="shrink-0" />
            <span>
              {validationResult?.errorMessage ||
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
                {infantry} / {maxInfantry} یگان
              </span>
            </div>
            <input
              type="range"
              min="0"
              max={maxInfantry}
              disabled={maxInfantry === 0}
              value={infantry}
              onChange={(e) => setInfantry(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer h-1.5 bg-secondary rounded-lg disabled:opacity-30"
            />
          </div>

          <div className="space-y-1.5 pt-1 border-t border-border/40">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-muted-foreground flex items-center gap-1 font-sans">
                <Plane size={12} className="text-gdp" /> جنگنده و پوشش هوایی:
              </span>
              <span className="font-bold text-foreground">
                {airForce} / {maxAirForce} فروند
              </span>
            </div>
            <input
              type="range"
              min="0"
              max={maxAirForce}
              disabled={maxAirForce === 0}
              value={airForce}
              onChange={(e) => setAirForce(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-secondary rounded-lg disabled:opacity-30"
            />
          </div>

          <div className="space-y-1.5 pt-1 border-t border-border/40">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-muted-foreground flex items-center gap-1 font-sans">
                <Radio size={12} className="text-treasury" /> پهپاد و موشک:
              </span>
              <span className="font-bold text-foreground">
                {droneMissile} / {maxDroneMissile} یگان
              </span>
            </div>
            <input
              type="range"
              min="0"
              max={maxDroneMissile}
              disabled={maxDroneMissile === 0}
              value={droneMissile}
              onChange={(e) => setDroneMissile(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer h-1.5 bg-secondary rounded-lg disabled:opacity-30"
            />
          </div>
        </div>

        <AttackWarningsContainer
          isAtWar={isAtWar}
          isBudgetDeficit={isBudgetDeficit}
          isOilDeficit={isOilDeficit}
          emergencyDebt={emergencyDebt}
        />

        <AttackLogisticsTable
          estimatedCost={finalCost}
          requiredOil={logistics.requiredOil}
          requiredSteel={logistics.requiredSteel}
        />

        <div className="pt-2 border-t border-border">
          <button
            onClick={handleConfirm}
            disabled={
              isServerInvalid || isValidationLoading || totalForceSelected === 0
            }
            className="w-full py-3.5 bg-military hover:bg-military/90 disabled:bg-secondary disabled:text-muted-foreground text-primary-foreground rounded-2xl font-bold transition-all text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-military/10"
          >
            <Swords size={16} />
            <span>
              {isValidationLoading
                ? "در حال استعلام لژستیک سرور..."
                : totalForceSelected === 0
                  ? "حداقل یک یگان رزمی انتخاب کنید"
                  : `تایید و صدور دستور حمله به ${targetName}`}
            </span>
          </button>
        </div>
      </div>
    </UnifiedModalShell>
  );
}
