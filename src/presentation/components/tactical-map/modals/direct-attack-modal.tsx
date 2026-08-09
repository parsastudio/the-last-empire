import React, { useState, useMemo } from "react";
import {
  Swords,
  ShieldAlert,
  Fuel,
  Coins,
  MapPin,
  Zap,
  AlertTriangle,
  Radio,
  Plane,
  Shield,
} from "lucide-react";
import { UnifiedModalShell } from "@/presentation/components/common/unified-modal-shell";
import { Nation } from "@/domain/nation/nation.schema";
import { GameState } from "@/domain/game/game-state.schema";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { ActionFactory } from "@/domain/game/action-factory";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { CountryRegistry } from "@/domain/data/countries";
import { MILITARY_UNIT_STATS } from "@/domain/military/military-unit-stats.config";
import { MARKET_CONFIG } from "@/domain/economy/market.config";
import { LandNeighborResolver } from "@/domain/map/land-neighbor-resolver";
import { UnitDeploymentSlider } from "@/presentation/components/tactical-map/modals/attack/unit-deployment-slider";

interface DirectAttackModalProps {
  isOpen: boolean;
  targetNationId: string | null;
  targetEnclaveId?: number;
  humanNation: Nation | null;
  gameState: GameState | null;
  onClose: () => void;
}

export function DirectAttackModal({
  isOpen,
  targetNationId,
  targetEnclaveId = 0,
  humanNation,
  gameState,
  onClose,
}: DirectAttackModalProps) {
  const currentKey = `${humanNation?.id}-${isOpen}-${targetNationId}-${targetEnclaveId}`;
  const [prevKey, setPrevKey] = useState<string | null>(null);

  const [infantryToDeploy, setInfantryToDeploy] = useState<number>(0);
  const [airForceToDeploy, setAirForceToDeploy] = useState<number>(0);
  const [dronesToLaunch, setDronesToLaunch] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { dispatchAction } = useGameActions();

  if (currentKey !== prevKey) {
    setPrevKey(currentKey);
    setInfantryToDeploy(humanNation ? humanNation.military.infantry : 0);
    setAirForceToDeploy(humanNation ? humanNation.military.airForce : 0);
    setDronesToLaunch(0);
  }

  const targetNation = useMemo(() => {
    if (!gameState || !targetNationId) return null;
    const canonical = CountryRegistry.resolveCanonicalId(targetNationId);
    return (
      gameState.nations[targetNationId] || gameState.nations[canonical] || null
    );
  }, [gameState, targetNationId]);

  const isLandNeighbor = useMemo(() => {
    if (!humanNation || !targetNation) return false;
    return LandNeighborResolver.isLandNeighbor(humanNation, targetNation);
  }, [humanNation, targetNation]);

  const isWarStance = useMemo(() => {
    if (!humanNation || !targetNation) return false;
    const targetCanonical = CountryRegistry.resolveCanonicalId(targetNation.id);
    const rel =
      humanNation.relations[targetNation.id] ||
      humanNation.relations[targetCanonical];
    return rel?.stance === "WAR";
  }, [humanNation, targetNation]);

  const targetRegionName = useMemo(() => {
    if (!targetNation) return "";
    if (targetEnclaveId === 0) {
      return `خاک اصلی ${targetNation.name}`;
    }
    const matchedRegion = targetNation.regionsDemographics?.find(
      (r) => r.regionId === targetEnclaveId,
    );
    if (matchedRegion) return matchedRegion.name;
    return `منطقه فرامرزی شماره ${targetEnclaveId.toLocaleString("fa-IR")}`;
  }, [targetNation, targetEnclaveId]);

  const deploymentCosts = useMemo(() => {
    if (!humanNation) return { moneyCost: 0, oilCost: 0 };

    const totalForceCost =
      infantryToDeploy * MILITARY_UNIT_STATS.INFANTRY.moneyCost +
      airForceToDeploy * MILITARY_UNIT_STATS.AIR_FORCE.moneyCost +
      dronesToLaunch * MILITARY_UNIT_STATS.DRONE_MISSILE.moneyCost;

    const moneyCost = Math.floor(totalForceCost * 0.05);
    const oilPrice =
      gameState?.marketPrices?.oil || MARKET_CONFIG.FIXED_BUY_PRICE;
    const oilCost = Math.max(1, Math.ceil(moneyCost / oilPrice));

    return { moneyCost, oilCost };
  }, [
    humanNation,
    infantryToDeploy,
    airForceToDeploy,
    dronesToLaunch,
    gameState,
  ]);

  if (!isOpen || !targetNation || !humanNation) return null;

  const canAffordMoney = humanNation.treasury >= deploymentCosts.moneyCost;
  const canAffordOil = humanNation.resources.oil >= deploymentCosts.oilCost;
  const hasSelectedInfantry = infantryToDeploy > 0;
  const canLaunchAttack =
    isLandNeighbor && canAffordMoney && canAffordOil && hasSelectedInfantry;

  const handleExecuteAttack = async () => {
    if (!canLaunchAttack || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const action = ActionFactory.initiateBattle(
        humanNation.id,
        targetNation.id,
        dronesToLaunch,
        infantryToDeploy,
        airForceToDeploy,
        targetEnclaveId,
      );

      const success = await dispatchAction(
        action,
        `دستور تهاجم مستقیم به ${targetRegionName} با موفقیت صادر گردید.`,
      );

      if (success) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const attackerFlag = getFlagEmoji(humanNation.flagCode || humanNation.id);
  const defenderFlag = getFlagEmoji(targetNation.flagCode || targetNation.id);

  return (
    <UnifiedModalShell
      isOpen={isOpen}
      title="اتاق فرماندهی و تهاجم مستقیم زمینی"
      subtitle={`برنامه‌ریزی و تخصیص نیرو جهت حمله به ${targetNation.name}`}
      maxWidthClass="max-w-xl"
      onClose={onClose}
    >
      <div className="space-y-4 text-right dir-rtl font-sans">
        <div className="bg-secondary/40 border border-border/80 p-4 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-right">
            <span className="text-3xl select-none">{attackerFlag}</span>
            <div>
              <span className="text-xs font-bold text-foreground block">
                {humanNation.name}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                فرماندهی مهاجم (شما)
              </span>
            </div>
          </div>

          <div className="p-2.5 bg-military/15 text-military border border-military/30 rounded-2xl animate-pulse">
            <Swords size={20} />
          </div>

          <div className="flex items-center gap-3 text-left dir-ltr">
            <span className="text-3xl select-none">{defenderFlag}</span>
            <div>
              <span className="text-xs font-bold text-foreground block">
                {targetNation.name}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                مدافع (هدف تهاجم)
              </span>
            </div>
          </div>
        </div>

        <div className="bg-secondary/30 border border-border/60 p-3.5 rounded-2xl flex items-center justify-between font-mono text-xs">
          <span className="text-muted-foreground font-sans flex items-center gap-1.5">
            <MapPin size={14} className="text-primary" />
            اقلیم مورد تهاجم:
          </span>
          <span className="font-extrabold text-foreground text-xs font-sans bg-secondary/80 px-2.5 py-1 rounded-xl border border-border/60">
            {targetRegionName}
          </span>
        </div>

        {!isLandNeighbor && (
          <div className="p-3.5 bg-military/15 border border-military/40 rounded-2xl flex items-start gap-2.5 text-xs text-military font-sans">
            <ShieldAlert size={18} className="shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">عدم امکان تهاجم زمینی</span>
              <p className="text-[11px] leading-relaxed text-muted-foreground mt-0.5">
                کشور شما هیچ مرز خاکی مستقیم با این منطقه ندارد. عملیات زمینی
                امکان‌پذیر نیست.
              </p>
            </div>
          </div>
        )}

        {isLandNeighbor && !isWarStance && (
          <div className="p-3.5 bg-amber-500/15 border border-amber-500/40 rounded-2xl flex items-start gap-2.5 text-xs text-amber-500 font-sans">
            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">
                هشدار: عدم وجود حالت جنگ رسمی
              </span>
              <p className="text-[11px] leading-relaxed text-muted-foreground mt-0.5">
                کشور شما هنوز بیانیه اعلان جنگ صادر نکرده است. حمله بدون اعلان
                جنگ قبلی باعث کسر پرستیژ و خشم جامعه جهانی خواهد شد.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider font-mono block px-1">
            تعیین ترکیب و میزان نیروهای اعزامی به میدان نبرد
          </span>

          <UnitDeploymentSlider
            label="پیاده‌نظام رزمی و کماندویی"
            unitName="یگان"
            icon={Shield}
            iconColorClass="text-primary"
            availableCount={humanNation.military.infantry}
            selectedCount={infantryToDeploy}
            onChange={setInfantryToDeploy}
          />

          <UnitDeploymentSlider
            label="جنگنده‌ها و پشتیبانی هوایی"
            unitName="فروند"
            icon={Plane}
            iconColorClass="text-gdp"
            availableCount={humanNation.military.airForce}
            selectedCount={airForceToDeploy}
            onChange={setAirForceToDeploy}
          />

          <UnitDeploymentSlider
            label="پهپادها و موشک‌های نقطه‌زن"
            unitName="یگان"
            icon={Radio}
            iconColorClass="text-treasury"
            availableCount={humanNation.military.droneMissile}
            selectedCount={dronesToLaunch}
            onChange={setDronesToLaunch}
          />
        </div>

        <div className="bg-secondary/40 border border-border/60 p-4 rounded-2xl space-y-3 font-mono text-xs">
          <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider font-sans block">
            پیش‌نمایش هزینه‌های لجیستیک و پشتیبانی
          </span>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-background/60 p-3 rounded-xl border border-border/40 space-y-1">
              <span className="text-muted-foreground text-[10px] font-sans flex items-center gap-1">
                <Coins size={12} className="text-gdp" />
                هزینه مالی اعزام:
              </span>
              <span
                className={`font-bold block ${
                  canAffordMoney ? "text-gdp" : "text-military"
                }`}
              >
                {PersianNumberFormatter.formatCurrency(
                  deploymentCosts.moneyCost,
                )}
              </span>
            </div>

            <div className="bg-background/60 p-3 rounded-xl border border-border/40 space-y-1">
              <span className="text-muted-foreground text-[10px] font-sans flex items-center gap-1">
                <Fuel size={12} className="text-treasury" />
                سوخت نفتی مورد نیاز:
              </span>
              <span
                className={`font-bold block ${
                  canAffordOil ? "text-treasury" : "text-military"
                }`}
              >
                {PersianNumberFormatter.toPersianDigits(
                  deploymentCosts.oilCost,
                )}{" "}
                بلوک
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleExecuteAttack}
          disabled={!canLaunchAttack || isSubmitting}
          className="w-full py-4 bg-military hover:bg-military/90 disabled:bg-secondary disabled:text-muted-foreground text-primary-foreground rounded-2xl font-bold text-xs transition-all cursor-pointer shadow-xl shadow-military/20 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <span>در حال آغاز عملیات و گسیل نیروها...</span>
          ) : (
            <>
              <Zap size={16} />
              <span>
                {!isLandNeighbor
                  ? "عدم مرز زمینی (غیرقابل حمله)"
                  : !hasSelectedInfantry
                    ? "حداقل ۱ یگان پیاده‌نظام انتخاب کنید"
                    : !canAffordMoney || !canAffordOil
                      ? "منابع مالی/نفتی ناکافی جهت اعزام"
                      : "صدور دستور تهاجم مستقیم و آغاز نبرد"}
              </span>
            </>
          )}
        </button>
      </div>
    </UnifiedModalShell>
  );
}
