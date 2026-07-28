export class HoverHudPositionCalculator {
  private readonly hudWidth = 288;
  private readonly hudHeight = 160;
  private readonly offset = 15;

  public calculatePosition(
    cursorPos: { x: number; y: number } | null | undefined,
  ): React.CSSProperties {
    if (!cursorPos || typeof window === "undefined") {
      return { left: "1.5rem", bottom: "1.5rem" };
    }

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let left = cursorPos.x + this.offset;
    let top = cursorPos.y + this.offset;

    if (left + this.hudWidth > windowWidth - 20) {
      left = Math.max(10, cursorPos.x - this.hudWidth - this.offset);
    }

    if (top + this.hudHeight > windowHeight - 20) {
      top = Math.max(10, cursorPos.y - this.hudHeight - this.offset);
    }

    return {
      left: `${left}px`,
      top: `${top}px`,
    };
  }
}
