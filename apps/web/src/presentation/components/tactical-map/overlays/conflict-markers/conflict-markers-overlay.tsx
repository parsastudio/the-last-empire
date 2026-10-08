"use client";

import React, { useMemo, useRef, useEffect, useCallback } from "react";
import {
  TurnLogEntry,
  BattleFullReportData,
  MapTopologyRegistry,
} from "@geopolitics/domain";
import { CameraPosition } from "@/presentation/hooks/tactical-map/final/map-camera-transform";
import { TacticalSound } from "@/presentation/utils/tactical-sound";

interface BattleMarkerItem {
  id: string;
  worldX: number;
  worldY: number;
  provinceId: number;
  isAttackerVictory: boolean;
  isHumanInvolved: boolean;
  turn: number;
  reportData: BattleFullReportData;
}

interface ConflictMarkersOverlayProps {
  dimensions: { width: number; height: number };
  positionRef?: React.RefObject<CameraPosition>;
  scaleRef?: React.RefObject<number>;
  turnLogs?: TurnLogEntry[];
  currentTurn?: number;
  humanNationId?: string;
  onSelectBattleReport?: (reportData: BattleFullReportData) => void;
}

export function ConflictMarkersOverlay({
  dimensions,
  positionRef,
  scaleRef,
  turnLogs = [],
  currentTurn = 1,
  humanNationId,
  onSelectBattleReport,
}: ConflictMarkersOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const battleMarkers = useMemo<BattleMarkerItem[]>(() => {
    if (!turnLogs || turnLogs.length === 0) return [];

    const minTurn = Math.max(1, currentTurn - 1);
    const recentBattleLogs = turnLogs.filter(
      (log) =>
        log.turn >= minTurn &&
        (log.eventCode === "BATTLE_TACTICAL_REPORT" ||
          log.eventCode === "BATTLE_GLOBAL_NEWS"),
    );

    const markers: BattleMarkerItem[] = [];
    const seenProvinces = new Set<number>();

    for (let i = recentBattleLogs.length - 1; i >= 0; i--) {
      const log = recentBattleLogs[i]!;
      const reportJson = log.params?.["reportJson"];
      if (!reportJson || typeof reportJson !== "string") continue;

      try {
        const reportData = JSON.parse(reportJson) as BattleFullReportData;
        const targetProvinceId = reportData.targetProvinceId;
        if (!targetProvinceId || seenProvinces.has(targetProvinceId)) continue;

        seenProvinces.add(targetProvinceId);
        const center = MapTopologyRegistry.getCenterCoordinates(targetProvinceId);
        if (!center || (center.x === 0 && center.y === 0)) continue;

        const isHumanInvolved =
          Boolean(humanNationId) &&
          (reportData.attackerId === humanNationId ||
            reportData.defenderId === humanNationId);

        markers.push({
          id: `battle-marker-${targetProvinceId}-${log.id}`,
          worldX: center.x,
          worldY: center.y,
          provinceId: targetProvinceId,
          isAttackerVictory: reportData.isAttackerVictory,
          isHumanInvolved,
          turn: log.turn,
          reportData,
        });
      } catch {}
    }

    return markers;
  }, [turnLogs, currentTurn, humanNationId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2.0);
    canvas.width = Math.round(dimensions.width * dpr);
    canvas.height = Math.round(dimensions.height * dpr);
  }, [dimensions]);

  useEffect(() => {
    let animId: number | null = null;

    const render = (timestamp: number) => {
      const canvas = canvasRef.current;
      if (!canvas || !positionRef?.current || !scaleRef?.current) {
        animId = null;
        return;
      }

      if (battleMarkers.length === 0) {
        const ctx = canvas.getContext("2d");
        if (ctx) ctx.clearRect(0, 0, dimensions.width, dimensions.height);
        animId = null;
        return;
      }

      const posX = positionRef.current.x;
      const posY = positionRef.current.y;
      const scale = scaleRef.current;
      const dpr = Math.min(window.devicePixelRatio || 1, 2.0);
      const width = dimensions.width;
      const height = dimensions.height;

      const ctx = canvas.getContext("2d", { alpha: true });
      if (!ctx) return;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const pulseProgress = (timestamp % 1600) / 1600;

      for (let i = 0; i < battleMarkers.length; i++) {
        const marker = battleMarkers[i]!;
        const screenX = marker.worldX * scale + posX;
        const screenY = marker.worldY * scale + posY;

        if (
          screenX < -50 ||
          screenX > width + 50 ||
          screenY < -50 ||
          screenY > height + 50
        ) {
          continue;
        }

        const isCurrent = marker.turn === currentTurn;
        const baseColor = marker.isHumanInvolved
          ? marker.isAttackerVictory
            ? "16, 185, 129"
            : "244, 63, 94"
          : "245, 158, 11";

        if (isCurrent) {
          const shockRadius = 14 + pulseProgress * 26;
          const shockAlpha = (1 - pulseProgress) * 0.75;

          ctx.beginPath();
          ctx.arc(screenX, screenY, shockRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${baseColor}, ${shockAlpha})`;
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(screenX, screenY, shockRadius * 0.6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${baseColor}, ${shockAlpha * 0.35})`;
          ctx.fill();
        }

        const badgeRadius = isCurrent ? 14 : 11;
        ctx.beginPath();
        ctx.arc(screenX, screenY, badgeRadius, 0, Math.PI * 2);
        ctx.fillStyle = isCurrent ? `rgba(12, 19, 34, 0.95)` : `rgba(12, 19, 34, 0.8)`;
        ctx.fill();
        ctx.lineWidth = isCurrent ? 2 : 1.5;
        ctx.strokeStyle = `rgba(${baseColor}, 0.9)`;
        ctx.stroke();

        ctx.font = `${isCurrent ? 13 : 10}px system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("⚔️", screenX, screenY);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      if (animId !== null) {
        cancelAnimationFrame(animId);
      }
    };
  }, [battleMarkers, currentTurn, dimensions, positionRef, scaleRef]);

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!onSelectBattleReport || !positionRef?.current || !scaleRef?.current) {
        return;
      }

      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const posX = positionRef.current.x;
      const posY = positionRef.current.y;
      const scale = scaleRef.current;

      for (let i = 0; i < battleMarkers.length; i++) {
        const marker = battleMarkers[i]!;
        const screenX = marker.worldX * scale + posX;
        const screenY = marker.worldY * scale + posY;

        const dist = Math.hypot(clickX - screenX, clickY - screenY);
        if (dist <= 20) {
          e.stopPropagation();
          TacticalSound.playUiClick();
          onSelectBattleReport(marker.reportData);
          break;
        }
      }
    },
    [battleMarkers, onSelectBattleReport, positionRef, scaleRef],
  );

  return (
    <canvas
      ref={canvasRef}
      onClick={handleCanvasClick}
      className={`absolute inset-0 w-full h-full z-20 block ${
        battleMarkers.length > 0 ? "pointer-events-auto cursor-pointer" : "pointer-events-none"
      }`}
    />
  );
}
