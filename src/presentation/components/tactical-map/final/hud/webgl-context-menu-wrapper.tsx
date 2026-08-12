import React from "react";
import {
  MapContextMenu,
  ContextActionType,
} from "@/presentation/components/tactical-map/context-menu/map-context-menu";
import { ContextMenuState } from "@/presentation/hooks/tactical-map/final/use-context-menu";

interface WebGLContextMenuWrapperProps {
  contextMenuState: ContextMenuState | null;
  onSelectAction: (
    action: ContextActionType,
    code: string,
    provinceId?: number,
  ) => void;
  onClose: () => void;
}

export function WebGLContextMenuWrapper({
  contextMenuState,
  onSelectAction,
}: WebGLContextMenuWrapperProps) {
  if (!contextMenuState) return null;

  return (
    <MapContextMenu
      position={contextMenuState.screenPos}
      countryName={contextMenuState.provinceName}
      onSelectAction={(action) =>
        onSelectAction(
          action,
          contextMenuState.countryCode,
          contextMenuState.provinceId,
        )
      }
    />
  );
}
