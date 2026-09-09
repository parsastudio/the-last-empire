export class HoverHudPositionUtility {
  private static readonly HUD_HEIGHT = 160;
  private static readonly OFFSET = 18;

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
