"use client";

import React, { useMemo, useRef, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Nation,
  ProvinceDynamicState,
  CountryRegistry,
} from "@geopolitics/domain";
import { CameraPosition } from "@/presentation/hooks/tactical-map/final/map-camera-transform";
import { DiplomaticStampBuilderUtility } from "@/presentation/components/tactical-map/overlays/diplomatic-stamps/utils/diplomatic-stamp-builder.utility";
import { DiplomaticStampVariant } from "@/presentation/components/tactical-map/overlays/diplomatic-stamps/types/diplomatic-stamp.types";

interface DiplomaticStampsOverlayProps {
  dimensions: { width: number; height: number };
  positionRef?: React.RefObject<CameraPosition>;
  scaleRef?: React.RefObject<number>;
  nationsMap?: Record<string, Nation>;
  provincesMap?: Record<string, ProvinceDynamicState>;
  humanNationId?: string;
}

interface BadgeStyleConfig {
  label: string;
  icon: string;
  bg: string;
  border: string;
  text: string;
  approxWidth: number;
}

export function DiplomaticStampsOverlay({
  dimensions,
  positionRef,
  scaleRef,
  nationsMap,
  provincesMap,
  humanNationId,
}: DiplomaticStampsOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const t = useTranslations("map.stamps");
  const locale = useLocale();
  const isRtl = locale === "fa";

  const badgeConfigs: Record<
    Exclude<DiplomaticStampVariant, "NEUTRAL">,
    BadgeStyleConfig
  > = useMemo(
    () => ({
      PLAYER: {
        label: t("player"),
        icon: "👑",
        bg: "rgba(6, 78, 59, 0.92)",
        border: "rgba(52, 211, 153, 0.8)",
        text: "#a7f3d0",
        approxWidth: isRtl ? 104 : 110,
      },
      WAR: {
        label: t("war"),
        icon: "⚔️",
        bg: "rgba(136, 19, 55, 0.92)",
        border: "rgba(244, 63, 94, 0.85)",
        text: "#fecdd3",
        approxWidth: isRtl ? 88 : 95,
      },
      STRATEGIC_PARTNERSHIP: {
        label: t("partnership"),
        icon: "🛡️",
        bg: "rgba(8, 51, 68, 0.92)",
        border: "rgba(34, 211, 238, 0.8)",
        text: "#cffafe",
        approxWidth: isRtl ? 122 : 130,
      },
      NON_AGGRESSION_PACT: {
        label: t("nonAggression"),
        icon: "📜",
        bg: "rgba(69, 26, 3, 0.92)",
        border: "rgba(245, 158, 11, 0.8)",
        text: "#fef3c7",
        approxWidth: isRtl ? 92 : 115,
      },
      SECURITY_GUARANTEE: {
        label: t("guarantee"),
        icon: "🌐",
        bg: "rgba(30, 27, 75, 0.92)",
        border: "rgba(129, 140, 248, 0.8)",
        text: "#e0e7ff",
        approxWidth: isRtl ? 90 : 125,
      },
    }),
    [t, isRtl],
  );

  const stamps = useMemo(() => {
    const raw = DiplomaticStampBuilderUtility.buildStamps(
      humanNationId,
      nationsMap,
      provincesMap,
    );

    return raw.sort((a, b) => {
      const aPri =
        a.variant !== "NEUTRAL"
          ? 1000
          : a.territoryPixels >= 45000
            ? 600
            : a.rank <= 8
              ? 400
              : 10;
      const bPri =
        b.variant !== "NEUTRAL"
          ? 1000
          : b.territoryPixels >= 45000
            ? 600
            : b.rank <= 8
              ? 400
              : 10;
      if (aPri !== bPri) return bPri - aPri;
      return b.territoryPixels - a.territoryPixels;
    });
  }, [humanNationId, nationsMap, provincesMap]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(dimensions.width * dpr);
    canvas.height = Math.round(dimensions.height * dpr);
  }, [dimensions]);

  useEffect(() => {
    let animId: number;
    let lastX = Number.NaN;
    let lastY = Number.NaN;
    let lastScale = Number.NaN;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas || !positionRef?.current || !scaleRef?.current) {
        animId = requestAnimationFrame(render);
        return;
      }

      const posX = positionRef.current.x;
      const posY = positionRef.current.y;
      const scale = scaleRef.current;

      const posDelta = Math.hypot(posX - (lastX || 0), posY - (lastY || 0));
      const scaleDelta = Math.abs(scale - (lastScale || 0));

      if (posDelta === 0 && scaleDelta === 0) {
        animId = requestAnimationFrame(render);
        return;
      }

      lastX = posX;
      lastY = posY;
      lastScale = scale;

      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = dimensions.width;
      const height = dimensions.height;

      const ctx = canvas.getContext("2d", { alpha: true });
      if (!ctx) {
        animId = requestAnimationFrame(render);
        return;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = "rgba(0, 0, 0, 0.95)";

      const placedBoxes: {
        minX: number;
        maxX: number;
        minY: number;
        maxY: number;
      }[] = [];

      for (let i = 0; i < stamps.length; i++) {
        const item = stamps[i]!;

        if (scale < item.minZoomScale && item.variant === "NEUTRAL") {
          continue;
        }

        const screenX = item.worldX * scale + posX;
        const screenY = item.worldY * scale + posY;

        if (
          screenX < -150 ||
          screenX > width + 150 ||
          screenY < -80 ||
          screenY > height + 80
        ) {
          continue;
        }

        const profile = CountryRegistry.getCountry(
          item.flagCode || item.nationId,
        );
        const displayName =
          locale === "en"
            ? profile?.nameEn || item.nationName
            : item.nationName;

        const baseSize =
          item.territoryPixels >= 50000
            ? 16
            : item.territoryPixels >= 18000
              ? 13
              : item.territoryPixels >= 4000
                ? 11
                : 10;

        const dynamicFactor = Math.min(
          2.2,
          Math.max(0.48, Math.pow(Math.max(0.18, scale), 0.5) * 1.15),
        );

        const fontSize = Math.round(baseSize * dynamicFactor);
        const badgeConfig =
          item.variant !== "NEUTRAL" ? badgeConfigs[item.variant] : null;

        const charWidth = fontSize * 0.58;
        const textWidth = displayName.length * charWidth;
        const totalHeight = badgeConfig ? fontSize * 2 + 14 : fontSize + 4;

        const box = {
          minX: screenX - textWidth / 2 - 8,
          maxX: screenX + textWidth / 2 + 8,
          minY: screenY - totalHeight / 2 - 4,
          maxY: screenY + totalHeight / 2 + 4,
        };

        let collides = false;
        for (let j = 0; j < placedBoxes.length; j++) {
          const p = placedBoxes[j]!;
          if (
            box.minX < p.maxX &&
            box.maxX > p.minX &&
            box.minY < p.maxY &&
            box.maxY > p.minY
          ) {
            collides = true;
            break;
          }
        }

        if (collides && item.variant === "NEUTRAL") {
          continue;
        }

        placedBoxes.push(box);

        const fontFamily = isRtl ? "Vazirmatn" : "system-ui, sans-serif";
        ctx.font = `bold ${fontSize}px ${fontFamily}`;

        const textY = badgeConfig
          ? screenY - Math.round(fontSize * 0.45)
          : screenY;

        ctx.lineWidth = 2.5;
        ctx.strokeStyle = "rgba(0, 0, 0, 0.95)";
        ctx.strokeText(displayName, screenX, textY);

        ctx.fillStyle =
          item.variant !== "NEUTRAL"
            ? "#ffffff"
            : item.territoryPixels >= 45000
              ? "#ffffff"
              : "#f8fafc";

        ctx.fillText(displayName, screenX, textY);

        if (badgeConfig) {
          const badgeFontSize = Math.max(9, Math.round(fontSize * 0.65));
          const pillScale = badgeFontSize / 11;
          const pillWidth = Math.round(badgeConfig.approxWidth * pillScale);
          const pillHeight = Math.max(16, Math.round(badgeFontSize * 1.65));
          const pillRadius = pillHeight / 2;

          const pillX = screenX - pillWidth / 2;
          const pillY = screenY + Math.round(fontSize * 0.4);

          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(pillX, pillY, pillWidth, pillHeight, pillRadius);
          } else {
            ctx.rect(pillX, pillY, pillWidth, pillHeight);
          }

          ctx.fillStyle = badgeConfig.bg;
          ctx.fill();
          ctx.lineWidth = 1;
          ctx.strokeStyle = badgeConfig.border;
          ctx.stroke();

          ctx.font = `bold ${badgeFontSize}px ${fontFamily}`;
          const centerY = pillY + pillHeight / 2;

          const iconMultiplier = isRtl ? 1 : -1;
          const iconOffset = pillWidth * 0.35 * iconMultiplier;
          ctx.fillText(badgeConfig.icon, screenX + iconOffset, centerY);

          ctx.fillStyle = badgeConfig.text;
          const labelOffset = pillWidth * 0.12 * iconMultiplier;
          ctx.fillText(badgeConfig.label, screenX - labelOffset, centerY);
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [stamps, positionRef, scaleRef, dimensions, badgeConfigs, locale, isRtl]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none select-none z-10 block"
    />
  );
}
