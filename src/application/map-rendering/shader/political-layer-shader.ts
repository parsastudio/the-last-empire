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
    srcData: Uint8ClampedArray,
  ): { r: number; g: number; b: number } {
    return this.bevelShader.calculateBevel(
      255,
      255,
      255,
      pair,
      x,
      y,
      width,
      height,
      id,
      srcData,
    );
  }
}
