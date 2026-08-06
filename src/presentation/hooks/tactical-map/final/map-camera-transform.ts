import { RefObject } from "react";

export interface CameraPosition {
  x: number;
  y: number;
}

export interface CameraTransformRef {
  positionRef: RefObject<CameraPosition>;
  scaleRef: RefObject<number>;
  isDraggingRef: RefObject<boolean>;
  hasDraggedRef: RefObject<boolean>;
}
