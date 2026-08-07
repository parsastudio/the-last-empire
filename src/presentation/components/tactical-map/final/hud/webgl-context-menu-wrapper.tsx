import React from "react";
import {
  MapContextMenu,
  ContextActionType,
} from "@/presentation/components/tactical-map/context-menu/map-context-menu";
import { ContextMenuState } from "@/presentation/hooks/tactical-map/final/use-context-menu";

interface WebGLContextMenuWrapperProps {
  contextMenuState: ContextMenuState | null;
  positionRef: React.RefObject<{ x: number; y: number }>;
  scaleRef: React.RefObject<number>;
  onSelectAction: (action: ContextActionType, code: string) => void;
  onClose: () => void;
}

export function WebGLContextMenuWrapper({
  contextMenuState,
  positionRef,
  scaleRef,
  onSelectAction,
  onClose,
}: WebGLContextMenuWrapperProps) {
  if (!contextMenuState) return null;

  const currentScale = scaleRef.current || 1;
  const currentPos = positionRef.current || { x: 0, y: 0 };

  const currentScreenPos = {
    x: contextMenuState.mapPos.x * currentScale + currentPos.x,
    y: contextMenuState.mapPos.y * currentScale + currentPos.y,
  };

  return (
    <MapContextMenu
      position={currentScreenPos}
      countryName={contextMenuState.countryName}
      countryCode={contextMenuState.countryCode}
      onSelectAction={(action) =>
        onSelectAction(action, contextMenuState.countryCode)
      }
      onClose={onClose}
    />
  );
}
