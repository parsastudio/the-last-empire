import React, { useState, useMemo } from "react";
import { X, Swords, Shield, Plane, Radio } from "lucide-react";
import { AttackTheaterHeader } from "./attack/attack-theater-header";
import { AttackCoordinatesBox } from "./attack/attack-coordinates-box";
import { AttackLogisticsTable } from "./attack/attack-logistics-table";
import { AttackWarningsContainer } from "./attack/attack-warnings-container";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { AttackForceEstimator } from "./attack/attack-force-estimator";

interface AttackPlanningModalProps {
  isOpen: boolean;
  attackerName: string;
  attackerCode: string;
  targetName: string;
  targetCode: string;
  coordinate: { x: number; y: number };
  stance: string;
  userOilStock?: number;
  userTreasury?: number;
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
  onClose,
  onConfirmAttack,
}: AttackPlanningModalProps) {
  const [infantry, setInfantry] = useState<number>(50);
  const [airForce, setAirForce] = useState<number>(10);
  const [droneMissile, setDroneMissile] = useState<number>(5);

  const { dispatchAction } = useGameActions();
  const estimator = useMemo(() => new AttackForceEstimator(), []);

  if (!isOpen) return null;

  const logistics = estimator.calculateLogisticsCost({
    infantry,
    airForce,
    droneMissile,
  });

  const isAtWar = stance === "WAR";
  const isOilDeficit = userOilStock < logistics.requiredOil;
  const isBudgetDeficit = userTreasury < logistics.estimatedMoneyCost;
  const emergencyDebt = isBudgetDeficit
    ? logistics.estimatedMoneyCost - Math.max(0, userTreasury)
    : 0;

  const handleConfirm = async () => {
    const success = await dispatchAction(
      {
        id: `attack-${Date.now()}`,
        nationId: attackerCode.startsWith("NATION_")
          ? attackerCode
          : `NATION_${attackerCode}`,
        type: "ATTACK",
        targetNationId: targetCode.startsWith("NATION_")
          ? targetCode
          : `NATION_${targetCode}`,
        infantry,
        airForce,
        droneMissile,
      },
      `فرمان حمله به نیروهای ${targetName} صادر گردید.`,
    );

    if (success) {
      onConfirmAttack();
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none flex items-center justify-center p-4 z-50 animate-fade-smooth">
      <div className="bg-card/95 backdrop-blur-xl border border-border/90 w-full max-w-lg rounded-3xl p-6 shadow-2xl relative space-y-4 dir-rtl text-right overflow-hidden pointer-events-auto">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-bold text-military font-mono uppercase tracking-wider">
            <Swords size={13} />
            <span>اتاق عملیات | برنامه‌ریزی تهاجم</span>
          </div>
          <h2 className="text-lg font-extrabold text-foreground">
            طرح حمله استراتژیک به {targetName}
          </h2>
        </div>

        <AttackTheaterHeader
          attackerName={attackerName}
          attackerCode={attackerCode}
          targetName={targetName}
          targetCode={targetCode}
        />

        <AttackCoordinatesBox coordinate={coordinate} />

        <div className="space-y-2.5 bg-background/50 border border-border/80 p-3.5 rounded-2xl font-mono text-xs">
          <span className="text-[10px] font-bold text-muted-foreground uppercase font-sans block">
            تخصیص یگان‌های رزمی تهاجم:
          </span>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-muted-foreground flex items-center gap-1 font-sans">
                <Shield size={12} className="text-primary" /> پیاده‌نظام:
              </span>
              <span className="font-bold text-foreground">{infantry} یگان</span>
            </div>
            <input
              type="range"
              min="5"
              max="500"
              value={infantry}
              onChange={(e) => setInfantry(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer h-1.5 bg-secondary rounded-lg"
            />
          </div>

          <div className="space-y-1.5 pt-1 border-t border-border/40">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-muted-foreground flex items-center gap-1 font-sans">
                <Plane size={12} className="text-gdp" /> جنگنده و پوشش هوایی:
              </span>
              <span className="font-bold text-foreground">
                {airForce} فروند
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={airForce}
              onChange={(e) => setAirForce(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-secondary rounded-lg"
            />
          </div>

          <div className="space-y-1.5 pt-1 border-t border-border/40">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-muted-foreground flex items-center gap-1 font-sans">
                <Radio size={12} className="text-treasury" /> پهپاد و موشک:
              </span>
              <span className="font-bold text-foreground">
                {droneMissile} یگان
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={droneMissile}
              onChange={(e) => setDroneMissile(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer h-1.5 bg-secondary rounded-lg"
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
          estimatedCost={logistics.estimatedMoneyCost}
          requiredOil={logistics.requiredOil}
          requiredSteel={logistics.requiredSteel}
        />

        <div className="pt-2 border-t border-border">
          <button
            onClick={handleConfirm}
            className="w-full py-3.5 bg-military hover:bg-military/90 text-primary-foreground rounded-2xl font-bold transition-all text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-military/10"
          >
            <Swords size={16} />
            <span>تایید و صدور دستور حمله به {targetName}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
