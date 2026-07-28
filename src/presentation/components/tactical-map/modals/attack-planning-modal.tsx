import React from "react";
import { X, Swords } from "lucide-react";
import { AttackTheaterHeader } from "./attack/attack-theater-header";
import { AttackCoordinatesBox } from "./attack/attack-coordinates-box";
import { AttackLogisticsTable } from "./attack/attack-logistics-table";
import { AttackWarningsContainer } from "./attack/attack-warnings-container";

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
  estimatedCost?: number;
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
  userOilStock = 20,
  userTreasury = 10000,
  estimatedCost = 19000,
  onClose,
  onConfirmAttack,
}: AttackPlanningModalProps) {
  if (!isOpen) return null;

  const isAtWar = stance === "WAR";
  const isOilDeficit = userOilStock < 20;
  const isBudgetDeficit = userTreasury < estimatedCost;
  const emergencyDebt = isBudgetDeficit
    ? estimatedCost - Math.max(0, userTreasury)
    : 0;

  return (
    <div className="fixed inset-0 pointer-events-none flex items-center justify-center p-4 z-50 animate-fade-smooth">
      <div className="bg-card/95 backdrop-blur-xl border border-border/90 w-full max-w-lg rounded-3xl p-6 shadow-2xl relative space-y-5 dir-rtl overflow-hidden pointer-events-auto">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-bold text-military font-mono uppercase tracking-wider">
            <Swords size={13} />
            <span>اتاق عملیات | برنامه‌ریزی تهاجم ایزوله</span>
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

        <AttackWarningsContainer
          isAtWar={isAtWar}
          isBudgetDeficit={isBudgetDeficit}
          isOilDeficit={isOilDeficit}
          emergencyDebt={emergencyDebt}
        />

        <AttackLogisticsTable estimatedCost={estimatedCost} />

        <div className="pt-2 border-t border-border">
          <button
            onClick={onConfirmAttack}
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
