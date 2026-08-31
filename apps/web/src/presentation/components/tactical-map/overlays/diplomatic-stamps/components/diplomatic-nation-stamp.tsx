import React, { useMemo } from "react";
import { Swords, ShieldCheck, Handshake, Globe2, Crown } from "lucide-react";
import {
  DiplomaticStampItem,
  DiplomaticStampVariant,
} from "@/presentation/components/tactical-map/overlays/diplomatic-stamps/types/diplomatic-stamp.types";

interface StatusBadgeConfig {
  label: string;
  icon: React.ElementType;
  className: string;
  iconClassName: string;
}

function resolveStatusConfig(
  variant: DiplomaticStampVariant,
): StatusBadgeConfig | null {
  switch (variant) {
    case "PLAYER":
      return {
        label: "امپراتوری شما",
        icon: Crown,
        className:
          "bg-emerald-950/90 border-emerald-400/40 text-emerald-300 shadow-sm",
        iconClassName: "text-emerald-400",
      };
    case "WAR":
      return {
        label: "جبهه متخاصم",
        icon: Swords,
        className:
          "bg-rose-950/90 border-rose-500/50 text-rose-300 shadow-sm animate-pulse",
        iconClassName: "text-rose-400",
      };
    case "STRATEGIC_PARTNERSHIP":
      return {
        label: "شراکت استراتژیک",
        icon: ShieldCheck,
        className: "bg-cyan-950/90 border-cyan-400/40 text-cyan-300 shadow-sm",
        iconClassName: "text-cyan-300",
      };
    case "NON_AGGRESSION_PACT":
      return {
        label: "عدم تخاصم",
        icon: Handshake,
        className:
          "bg-amber-950/90 border-amber-400/40 text-amber-300 shadow-sm",
        iconClassName: "text-amber-300",
      };
    case "SECURITY_GUARANTEE":
      return {
        label: "چتر امنیتی",
        icon: Globe2,
        className:
          "bg-indigo-950/90 border-indigo-400/40 text-indigo-300 shadow-sm",
        iconClassName: "text-indigo-300",
      };
    case "NEUTRAL":
    default:
      return null;
  }
}

interface DiplomaticNationStampProps {
  stamp: DiplomaticStampItem;
  posX: number;
  posY: number;
  currentScale: number;
  isOccluded?: boolean;
}

export function DiplomaticNationStamp({
  stamp,
  posX,
  posY,
  currentScale,
  isOccluded = false,
}: DiplomaticNationStampProps) {
  const badgeConfig = useMemo(
    () => resolveStatusConfig(stamp.variant),
    [stamp.variant],
  );

  const isHighPriority = stamp.variant !== "NEUTRAL";

  const typography = useMemo(() => {
    const pixels = stamp.territoryPixels;
    if (pixels >= 50000) {
      return {
        fontSizeClass: "text-sm md:text-base lg:text-lg",
        letterSpacing: currentScale > 0.6 ? "0.08em" : "0.02em",
        opacityBase: 0.95,
      };
    }
    if (pixels >= 18000) {
      return {
        fontSizeClass: "text-xs md:text-sm lg:text-base",
        letterSpacing: currentScale > 0.6 ? "0.04em" : "0.01em",
        opacityBase: 0.9,
      };
    }
    if (pixels >= 5000) {
      return {
        fontSizeClass: "text-xs md:text-sm",
        letterSpacing: "0.01em",
        opacityBase: 0.88,
      };
    }
    return {
      fontSizeClass: "text-xs md:text-sm",
      letterSpacing: "0em",
      opacityBase: 0.85,
    };
  }, [stamp.territoryPixels, currentScale]);

  const opacity = useMemo(() => {
    if (isOccluded) return 0;

    if (isHighPriority) {
      return 1.0;
    }

    if (currentScale < stamp.minZoomScale) {
      const delta = stamp.minZoomScale - currentScale;
      if (delta > 0.12) return 0;
      return Math.max(0, 1.0 - delta / 0.12);
    }

    return typography.opacityBase;
  }, [
    isOccluded,
    isHighPriority,
    currentScale,
    stamp.minZoomScale,
    typography.opacityBase,
  ]);

  if (opacity <= 0.05) return null;

  const dynamicScale = Math.min(
    2.4,
    Math.max(0.45, Math.sqrt(Math.max(0.18, currentScale)) * 1.15),
  );

  const BadgeIcon = badgeConfig?.icon;

  return (
    <div
      className="absolute top-0 left-0 select-none pointer-events-none will-change-transform dir-rtl flex flex-col items-center justify-center whitespace-nowrap transition-opacity duration-150"
      style={{
        transform: `translate3d(${posX}px, ${posY}px, 0) translate(-50%, -50%) scale(${dynamicScale})`,
        opacity,
      }}
    >
      <span
        className={`font-bold text-center select-none whitespace-nowrap block ${typography.fontSizeClass} ${
          isHighPriority
            ? "text-foreground font-black"
            : stamp.isSuperpower
              ? "text-foreground font-extrabold"
              : "text-foreground/95 font-bold"
        }`}
        style={{
          letterSpacing: typography.letterSpacing,
          textShadow: "0 1px 2px rgba(0,0,0,0.95), 0 0 1px rgba(0,0,0,0.9)",
        }}
      >
        {stamp.nationName}
      </span>

      {badgeConfig && BadgeIcon && (
        <div
          className={`mt-0.5 px-2 py-0.5 rounded-full border backdrop-blur-md flex items-center gap-1 text-[8.5px] font-bold font-sans whitespace-nowrap ${badgeConfig.className}`}
        >
          <BadgeIcon size={9} className={badgeConfig.iconClassName} />
          <span className="leading-none">{badgeConfig.label}</span>
        </div>
      )}
    </div>
  );
}
