import React from "react";

export class HoverHudPositionUtility {
  public static calculatePosition(
    cursorPos: { x: number; y: number } | null,
  ): React.CSSProperties {
    if (!cursorPos || typeof window === "undefined") {
      return { left: "1.5rem", bottom: "1.5rem" };
    }

    const hudWidth = 320;
    const hudHeight = 145;
    const offset = 16;

    let left = cursorPos.x + offset;
    let top = cursorPos.y + offset;

    if (left + hudWidth > window.innerWidth - 20) {
      left = Math.max(10, cursorPos.x - hudWidth - offset);
    }

    if (top + hudHeight > window.innerHeight - 20) {
      top = Math.max(10, cursorPos.y - hudHeight - offset);
    }

    return {
      left: `${left}px`,
      top: `${top}px`,
    };
  }
}
