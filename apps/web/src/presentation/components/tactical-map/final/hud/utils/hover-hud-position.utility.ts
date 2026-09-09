import React from "react";

export class HoverHudPositionUtility {
  private static readonly HUD_HEIGHT = 160;
  private static readonly OFFSET = 18;

  public static calculatePosition(
    cursorPos: { x: number; y: number } | null,
  ): React.CSSProperties {
    if (!cursorPos || typeof window === "undefined") {
      return { left: "-9999px", top: "-9999px" };
    }

    const left = cursorPos.x + this.OFFSET;

    const isExitingBottom =
      cursorPos.y + this.OFFSET + this.HUD_HEIGHT > window.innerHeight - 12;

    const top = isExitingBottom
      ? Math.max(10, cursorPos.y - this.HUD_HEIGHT - this.OFFSET)
      : cursorPos.y + this.OFFSET;

    return {
      left: `${left}px`,
      top: `${top}px`,
    };
  }

  public static applyPositionToElement(
    element: HTMLElement | null,
    clientX: number,
    clientY: number,
  ): void {
    if (!element || typeof window === "undefined") return;

    const left = clientX + this.OFFSET;

    const isExitingBottom =
      clientY + this.OFFSET + this.HUD_HEIGHT > window.innerHeight - 12;

    const top = isExitingBottom
      ? Math.max(10, clientY - this.HUD_HEIGHT - this.OFFSET)
      : clientY + this.OFFSET;

    element.style.left = `${left}px`;
    element.style.top = `${top}px`;
  }
}
