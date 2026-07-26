import { FrontlineColorPalette } from "./frontline-color-palette";

export class FrontlineGlowingEffect {
  private palette = new FrontlineColorPalette();

  public getGlowStyle(timestamp: number): {
    strokeStyle: string;
    shadowColor: string;
  } {
    return {
      strokeStyle: FrontlineColorPalette.primaryRed,
      shadowColor: this.palette.getPulseAlpha(timestamp),
    };
  }
}
