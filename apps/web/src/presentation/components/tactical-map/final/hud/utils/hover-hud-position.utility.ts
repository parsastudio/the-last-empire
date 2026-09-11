export class HoverHudPositionUtility {
  private static readonly OFFSET = 18;
  private static lastX = -9999;
  private static lastY = -9999;

  public static applyPositionToElement(
    element: HTMLElement | null,
    clientX: number,
    clientY: number,
  ): void {
    this.lastX = clientX;
    this.lastY = clientY;

    if (!element || typeof window === "undefined") return;

    const left = clientX + this.OFFSET;
    const top = clientY + this.OFFSET;

    element.style.left = `${left}px`;
    element.style.top = `${top}px`;
  }

  public static reapplyLastPosition(element: HTMLElement | null): void {
    if (!element || this.lastX === -9999 || typeof window === "undefined")
      return;

    const left = this.lastX + this.OFFSET;
    const top = this.lastY + this.OFFSET;

    element.style.left = `${left}px`;
    element.style.top = `${top}px`;
  }

  public static getLastLeft(): string {
    if (this.lastX === -9999) return "-9999px";
    return `${this.lastX + this.OFFSET}px`;
  }

  public static getLastTop(): string {
    if (this.lastY === -9999) return "-9999px";
    return `${this.lastY + this.OFFSET}px`;
  }

  public static reset(): void {
    this.lastX = -9999;
    this.lastY = -9999;
  }
}
