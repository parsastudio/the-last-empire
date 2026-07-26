import React from "react";
import { GameState } from "@/domain/game/game-state.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { StatusIndicatorOverlay } from "./status-indicator-overlay";
import { InteractionOverlay } from "./interaction-overlay";
import { SovereignControlHud } from "./sovereign-control-hud";
import { TraitsOverlay } from "./traits-overlay";
import { CampaignLogOverlay } from "./campaign-log-overlay";
import { MapHoverCard } from "./map-hover-card";
import { Coordinate } from "@/domain/map/coordinate.schema";
import { GridCombatBridge } from "@/application/map-rendering/grid-combat-bridge";

interface CountryProps {
  id: number;
  code: string;
  name: string;
  color: [number, number, number];
  areaSqKm?: number;
}

interface MapCanvasOverlaysProps {
  gameState: GameState | null;
  playerNationId: string | null;
  humanNation: Nation | null;
  hoveredCountry: CountryProps | null;
  isAttacking: boolean;
  dimensions: { width: number; height: number };
  position: { x: number; y: number };
  scale: number;
  mapWidth: number;
  mapHeight: number;
  bridge: GridCombatBridge;
  onExecuteAttack: (targetCode: string, gridCoord: Coordinate) => void;
}

export function MapCanvasOverlays({
  gameState,
  playerNationId,
  humanNation,
  hoveredCountry,
  isAttacking,
  dimensions,
  position,
  scale,
  mapWidth,
  mapHeight,
  bridge,
  onExecuteAttack,
}: MapCanvasOverlaysProps) {
  if (!gameState) {
    return null;
  }

  const targetCell = bridge.mapHighResToGridCell({
    x: Math.floor(
      ((dimensions.width / 2 - position.x) / scale) *
        (mapWidth / dimensions.width),
    ),
    y: Math.floor(
      ((dimensions.height / 2 - position.y) / scale) *
        (mapHeight / dimensions.height),
    ),
  });

  return (
    <>
      <StatusIndicatorOverlay
        gameState={gameState}
        playerNationId={playerNationId}
      />

      {playerNationId &&
        hoveredCountry &&
        hoveredCountry.code !== playerNationId && (
          <InteractionOverlay
            targetCell={targetCell}
            targetCountryName={hoveredCountry.name}
            targetCountryId={hoveredCountry.code}
            onAttack={() => onExecuteAttack(hoveredCountry.code, targetCell)}
            isAttacking={isAttacking}
          />
        )}

      {hoveredCountry && <MapHoverCard hoveredCountry={hoveredCountry} />}

      <CampaignLogOverlay logs={gameState.turnLogs} />

      <TraitsOverlay humanNation={humanNation} />

      {humanNation && <SovereignControlHud nation={humanNation} />}
    </>
  );
}
