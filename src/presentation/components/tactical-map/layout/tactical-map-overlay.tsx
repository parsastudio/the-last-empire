import React from "react";
import {
  MapContextMenu,
  ContextActionType,
} from "../context-menu/map-context-menu";
import { AttackPlanningModal } from "../modals/attack-planning-modal";

interface TacticalMapOverlayProps {
  contextMenuState: {
    coordinate: { x: number; y: number };
    countryId: number;
    countryCode: string;
    countryName: string;
  } | null;
  activeScreenPos: { x: number; y: number };
  attackModalState: {
    isOpen: boolean;
    targetName: string;
    targetCode: string;
    coordinate: { x: number; y: number };
  } | null;
  onSelectAction: (action: ContextActionType) => void;
  onCloseContextMenu: () => void;
  onCloseAttackModal: () => void;
}

export function TacticalMapOverlay({
  contextMenuState,
  activeScreenPos,
  attackModalState,
  onSelectAction,
  onCloseContextMenu,
  onCloseAttackModal,
}: TacticalMapOverlayProps) {
  return (
    <>
      {contextMenuState && (
        <div
          className="absolute pointer-events-none z-40 w-5 h-5 rounded-full bg-rose-600/60 border-2 border-rose-500 shadow-[0_0_15px_rgba(225,29,72,0.8)] animate-ping -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${activeScreenPos.x}px`,
            top: `${activeScreenPos.y}px`,
          }}
        />
      )}

      {contextMenuState && (
        <MapContextMenu
          position={activeScreenPos}
          countryName={contextMenuState.countryName}
          countryCode={contextMenuState.countryCode}
          onSelectAction={onSelectAction}
          onClose={onCloseContextMenu}
        />
      )}

      {attackModalState && (
        <AttackPlanningModal
          isOpen={attackModalState.isOpen}
          attackerName="ایران"
          attackerCode="IRN"
          targetName={attackModalState.targetName}
          targetCode={attackModalState.targetCode}
          coordinate={attackModalState.coordinate}
          stance="PEACE"
          userOilStock={20}
          onClose={onCloseAttackModal}
          onConfirmAttack={() => {
            alert(
              `دستور حمله رسمی به کشور ${attackModalState.targetName} صادر شد!`,
            );
            onCloseAttackModal();
          }}
        />
      )}
    </>
  );
}
