import { MapBevelShader } from "./map-bevel-shader";
import { ColorPair } from "./country-palette-generator";

export class PoliticalLayerShader {
  private bevelShader = new MapBevelShader();

  public calculatePoliticalColor(
    id: number,
    pair: ColorPair,
    x: number,
    y: number,
    width: number,
    height: number,
    maskData: Uint8Array,
  ): { r: number; g: number; b: number } {
    return this.bevelShader.calculateBevel(
      pair,
      x,
      y,
      width,
      height,
      id,
      maskData,
    );
  }
}
