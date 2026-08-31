"use client";

import React, { useMemo, useRef, useEffect } from "react";
import { Nation, Province } from "@geopolitics/domain";
import { CameraPosition } from "@/presentation/hooks/tactical-map/final/map-camera-transform";
import { DiplomaticStampBuilderUtility } from "@/presentation/components/tactical-map/overlays/diplomatic-stamps/utils/diplomatic-stamp-builder.utility";
import {
  DiplomaticStampItem,
  DiplomaticStampVariant,
} from "@/presentation/components/tactical-map/overlays/diplomatic-stamps/types/diplomatic-stamp.types";

interface DiplomaticStampsOverlayProps {
  positionRef?: React.RefObject<CameraPosition>;
  scaleRef?: React.RefObject<number>;
  nationsMap?: Record<string, Nation>;
  provincesMap?: Record<string, Province>;
  humanNationId?: string;
}

interface BadgeStyleConfig {
  label: string;
  bg: string;
  border: string;
  text: string;
}

function getBadgeConfig(
  variant: DiplomaticStampVariant,
): BadgeStyleConfig | null {
  switch (variant) {
    case "PLAYER":
      return {
        label: "امپراتوری شما",
        bg: "rgba(6, 78, 59, 0.92)",
        border: "#34d399",
        text: "#6ee7b7",
      };
    case "WAR":
      return {
        label: "جبهه متخاصم",
        bg: "rgba(136, 19, 55, 0.92)",
        border: "#f43f5e",
        text: "#fda4af",
      };
    case "STRATEGIC_PARTNERSHIP":
      return {
        label: "شراکت استراتژیک",
        bg: "rgba(8, 51, 68, 0.92)",
        border: "#22d3ee",
        text: "#67e8f9",
      };
    case "NON_AGGRESSION_PACT":
      return {
        label: "عدم تخاصم",
        bg: "rgba(69, 26, 3, 0.92)",
        border: "#f59e0b",
        text: "#fcd34d",
      };
    case "SECURITY_GUARANTEE":
      return {
        label: "چتر امنیتی",
        bg: "rgba(30, 27, 75, 0.92)",
        border: "#818cf8",
        text: "#c7d2fe",
      };
    case "NEUTRAL":
    default:
      return null;
  }
}

export function DiplomaticStampsOverlay({
  positionRef,
  scaleRef,
  nationsMap,
  provincesMap,
  humanNationId,
}: DiplomaticStampsOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const stamps = useMemo(() => {
    return DiplomaticStampBuilderUtility.buildStamps(
      humanNationId,
      nationsMap,
      provincesMap,
    );
  }, [humanNationId, nationsMap, provincesMap]);

  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas || !positionRef?.current || !scaleRef?.current) {
        animId = requestAnimationFrame(render);
        return;
      }

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (
        canvas.width !== Math.round(width * dpr) ||
        canvas.height !== Math.round(height * dpr)
      ) {
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        animId = requestAnimationFrame(render);
        return;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const posX = positionRef.current.x;
      const posY = positionRef.current.y;
      const scale = scaleRef.current;

      const sorted = [...stamps].sort((a, b) => {
        const aPri =
          a.variant !== "NEUTRAL"
            ? 1000
            : a.isSuperpower
              ? 500
              : a.rank <= 15
                ? 200
                : 10;
        const bPri =
          b.variant !== "NEUTRAL"
            ? 1000
            : b.isSuperpower
              ? 500
              : b.rank <= 15
                ? 200
                : 10;
        if (aPri !== bPri) return bPri - aPri;
        return b.territoryPixels - a.territoryPixels;
      });

      const placedBoxes: {
        minX: number;
        maxX: number;
        minY: number;
        maxY: number;
      }[] = [];

      for (let i = 0; i < sorted.length; i++) {
        const item = sorted[i]!;

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

        const baseSize =
          item.territoryPixels >= 50000
            ? 16
            : item.territoryPixels >= 18000
              ? 13
              : item.territoryPixels >= 4000
                ? 11
                : 10;

        const dynamicFactor = Math.min(
          2.0,
          Math.max(0.65, Math.pow(Math.max(0.2, scale), 0.5) * 1.15),
        );

        const fontSize = Math.round(baseSize * dynamicFactor);
        const badgeConfig = getBadgeConfig(item.variant);

        ctx.font = `bold ${fontSize}px Vazirmatn, system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const textMetrics = ctx.measureText(item.nationName);
        const textWidth = textMetrics.width;
        const totalHeight = badgeConfig ? fontSize * 2 + 12 : fontSize + 6;

        const box = {
          minX: screenX - textWidth / 2 - 6,
          maxX: screenX + textWidth / 2 + 6,
          minY: screenY - totalHeight / 2 - 3,
          maxY: screenY + totalHeight / 2 + 3,
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

        ctx.save();
        ctx.shadowColor = "rgba(0, 0, 0, 0.95)";
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 1;

        ctx.fillStyle =
          item.variant !== "NEUTRAL"
            ? "#ffffff"
            : item.isSuperpower
              ? "#f8fafc"
              : "#e2e8f0";

        const textY = badgeConfig ? screenY - 6 : screenY;
        ctx.fillText(item.nationName, screenX, textY);

        ctx.restore();

        if (badgeConfig) {
          const badgeText = badgeConfig.label;
          const badgeFont = `bold ${Math.max(9, Math.round(fontSize * 0.7))}px Vazirmatn, system-ui, sans-serif`;
          ctx.font = badgeFont;
          const badgeMetrics = ctx.measureText(badgeText);
          const badgeWidth = badgeMetrics.width + 12;
          const badgeHeight = Math.max(14, Math.round(fontSize * 0.95));
          const badgeX = screenX - badgeWidth / 2;
          const badgeY = screenY + 4;

          ctx.save();
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 6);
          } else {
            ctx.rect(badgeX, badgeY, badgeWidth, badgeHeight);
          }

          ctx.fillStyle = badgeConfig.bg;
          ctx.fill();
          ctx.lineWidth = 1;
          ctx.strokeStyle = badgeConfig.border;
          ctx.stroke();

          ctx.fillStyle = badgeConfig.text;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(badgeText, screenX, badgeY + badgeHeight / 2);
          ctx.restore();
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [stamps, positionRef, scaleRef]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none select-none z-10 block"
    />
  );
}
