import React, { useState, useMemo } from "react";
import {
  Swords,
  ShieldAlert,
  Coins,
  MapPin,
  Zap,
  AlertTriangle,
  Radio,
  Plane,
  Shield,
  Anchor,
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
import { LandNeighborResolver } from "@/domain/map/land-neighbor-resolver";
import { NavalNeighborResolver } from "@/domain/map/naval-neighbor-resolver";
import { UnitDeploymentSlider } from "@/presentation/components/tactical-map/modals/attack/unit-deployment-slider";
import { NationRelationResolver } from "@/domain/diplomacy/nation-relation-resolver.utility";

interface DirectAttackModalProps {
  isOpen: boolean;
  targetNationId: string | null;
  targetProvinceId?: number | null;
  humanNation: Nation | null;
  gameState: GameState | null;
  onClose: () => void;
}

export function DirectAttackModal({
  isOpen,
  targetNationId,
  targetProvinceId = null,
  humanNation,
  gameState,
  onClose,
}: DirectAttackModalProps) {
  const currentKey = `${humanNation?.id}-${isOpen}-${targetNationId}-${targetProvinceId}`;
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

  const targetProvince = useMemo(() => {
    if (!gameState || !targetProvinceId) return null;
    return gameState.provinces[targetProvinceId.toString()] || null;
  }, [gameState, targetProvinceId]);

  const isLandNeighbor = useMemo(() => {
    if (!humanNation || !targetProvinceId) return false;
    return LandNeighborResolver.hasProvinceLandBorder(
      targetProvinceId,
      humanNation.id,
      gameState?.provinces,
    );
  }, [humanNation, targetProvinceId, gameState?.provinces]);

  const navalAttackInfo = useMemo(() => {
    if (isLandNeighbor || !humanNation || !targetProvinceId) {
      return {
        isNavalValid: false,
        closestDistance: 0,
        closestProvinceName: "",
        navalCostMultiplier: 0,
        deploymentMoneyCost: 0,
      };
    }

    return NavalNeighborResolver.resolveNavalAttack(
      targetProvinceId,
      humanNation.id,
      gameState?.provinces,
      infantryToDeploy,
      airForceToDeploy,
      dronesToLaunch,
    );
  }, [
    isLandNeighbor,
    humanNation,
    targetProvinceId,
    gameState?.provinces,
    infantryToDeploy,
    airForceToDeploy,
    dronesToLaunch,
  ]);

  const isWarStance = useMemo(() => {
    if (!humanNation || !targetNation) return false;
    return NationRelationResolver.isWar(humanNation.relations, targetNation.id);
  }, [humanNation, targetNation]);

  const targetRegionName = useMemo(() => {
    if (targetProvince) return targetProvince.nameFa;
    if (!targetNation) return "";
    return `خاک اصلی ${targetNation.name}`;
  }, [targetNation, targetProvince]);

  const deploymentCosts = useMemo(() => {
    if (isLandNeighbor) {
      const totalForceCost =
        infantryToDeploy * MILITARY_UNIT_STATS.INFANTRY.moneyCost +
        airForceToDeploy * MILITARY_UNIT_STATS.AIR_FORCE.moneyCost +
        dronesToLaunch * MILITARY_UNIT_STATS.DRONE_MISSILE.moneyCost;
      return { moneyCost: Math.floor(totalForceCost * 0.05) };
    }
    if (navalAttackInfo.isNavalValid) {
      return { moneyCost: navalAttackInfo.deploymentMoneyCost };
    }
    return { moneyCost: 0 };
  }, [
    isLandNeighbor,
    navalAttackInfo,
    infantryToDeploy,
    airForceToDeploy,
    dronesToLaunch,
  ]);

  if (!isOpen || !targetNation || !humanNation) return null;

  const canAffordMoney = humanNation.treasury >= deploymentCosts.moneyCost;
  const hasSelectedInfantry = infantryToDeploy > 0;
  const canLaunchAttack =
    (isLandNeighbor || navalAttackInfo.isNavalValid) &&
    canAffordMoney &&
    hasSelectedInfantry;

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
        targetProvinceId || undefined,
        isLandNeighbor ? "LAND" : "NAVAL",
      );

      const typeLabel = isLandNeighbor ? "زمینی" : "دریایی";
      const success = await dispatchAction(
        action,
        `دستور تهاجم ${typeLabel} به ${targetRegionName} با موفقیت صادر گردید.`,
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

  const modalTitle = isLandNeighbor
    ? "اتاق فرماندهی و تهاجم مستقیم زمینی"
    : navalAttackInfo.isNavalValid
      ? "اتاق فرماندهی و عملیات هجوم دریایی"
      : "اتاق فرماندهی عملیات نظامی";

  return (
    <UnifiedModalShell
      isOpen={isOpen}
      title={modalTitle}
      subtitle={`برنامه‌ریزی و تخصیص نیرو جهت فتح استان ${targetRegionName}`}
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
            {isLandNeighbor ? <Swords size={20} /> : <Anchor size={20} />}
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
            استان مورد تهاجم:
          </span>
          <span className="font-extrabold text-foreground text-xs font-sans bg-secondary/80 px-2.5 py-1 rounded-xl border border-border/60">
            {targetRegionName}
          </span>
        </div>

        {!isLandNeighbor && navalAttackInfo.isNavalValid && (
          <div className="bg-secondary/40 border border-border/60 p-3.5 rounded-2xl space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between text-[11px] font-sans font-bold text-foreground">
              <span className="flex items-center gap-1.5 text-gdp">
                <Anchor size={14} />
                عملیات هجوم دریایی (آبی-خاکی)
              </span>
              <span className="text-muted-foreground text-[10px]">
                مبدا: {navalAttackInfo.closestProvinceName}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="bg-background/60 p-2 rounded-xl border border-border/40">
                <span className="text-muted-foreground block font-sans">
                  مسافت مستقیم دریایی:
                </span>
                <span className="font-bold text-foreground block mt-0.5">
                  {PersianNumberFormatter.formatNumberWithCommas(
                    navalAttackInfo.closestDistance,
                  )}{" "}
                  پیکسل
                </span>
              </div>
              <div className="bg-background/60 p-2 rounded-xl border border-border/40">
                <span className="text-muted-foreground block font-sans">
                  ضریب هزینه ترابری دریایی:
                </span>
                <span className="font-bold text-gdp block mt-0.5">
                  {PersianNumberFormatter.toPersianDigits(
                    Math.round(navalAttackInfo.navalCostMultiplier * 100),
                  )}
                  ٪ ارزش نیروها
                </span>
              </div>
            </div>
          </div>
        )}

        {!isLandNeighbor && !navalAttackInfo.isNavalValid && (
          <div className="p-3.5 bg-military/15 border border-military/40 rounded-2xl flex items-start gap-2.5 text-xs text-military font-sans">
            <ShieldAlert size={18} className="shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">
                عدم وجود مرز زمینی یا دسترسی به دریا
              </span>
              <p className="text-[11px] leading-relaxed text-muted-foreground mt-0.5">
                کشور شما هیچ استان ساحلی یا مرز زمینی مستقیمی با استان{" "}
                {targetRegionName} ندارد.
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

          <div className="bg-background/60 p-3 rounded-xl border border-border/40 space-y-1">
            <span className="text-muted-foreground text-[10px] font-sans flex items-center gap-1">
              <Coins size={12} className="text-gdp" />
              هزینه مالی اعزام نیرو:
            </span>
            <span
              className={`font-bold block ${
                canAffordMoney ? "text-gdp" : "text-military"
              }`}
            >
              {PersianNumberFormatter.formatCurrency(deploymentCosts.moneyCost)}
            </span>
          </div>
        </div>

        <button
          onClick={handleExecuteAttack}
          disabled={!canLaunchAttack || isSubmitting}
          className="w-full py-4 bg-military hover:bg-military/90 disabled:bg-secondary disabled:text-muted-foreground text-primary-foreground rounded-2xl font-bold text-xs transition-all cursor-pointer shadow-xl shadow-military/20 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <span>در حال آغاز عملیات و فتح استان...</span>
          ) : (
            <>
              <Zap size={16} />
              <span>
                {!isLandNeighbor && !navalAttackInfo.isNavalValid
                  ? "عدم وجود امکان دسترسی برای حمله"
                  : !hasSelectedInfantry
                    ? "حداقل ۱ یگان پیاده‌نظام انتخاب کنید"
                    : !canAffordMoney
                      ? "موجودی مالی ناکافی جهت اعزام"
                      : `صدور دستور فتح ${isLandNeighbor ? "زمینی" : "دریایی"} استان ${targetRegionName}`}
              </span>
            </>
          )}
        </button>
      </div>
    </UnifiedModalShell>
  );
}
