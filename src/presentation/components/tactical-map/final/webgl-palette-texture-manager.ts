import { CountryMapping } from "@/presentation/hooks/tactical-map/use-map-data";
import { TacticalPaletteGenerator } from "@/infrastructure/map-preprocessing/color-palette";

export class WebGLPaletteTextureManager {
  public static createPaletteTexture(
    gl: WebGL2RenderingContext,
    countries: CountryMapping[],
  ): WebGLTexture | null {
    const paletteData = new Uint8Array(256 * 4);

    for (let i = 0; i < countries.length; i++) {
      const c = countries[i]!;
      if (c.id >= 11 && c.id < 250) {
        const colorPair = TacticalPaletteGenerator.generateColorForCountry(
          c.id,
        );
        const idx = c.id * 4;
        paletteData[idx] = colorPair.r1;
        paletteData[idx + 1] = colorPair.g1;
        paletteData[idx + 2] = colorPair.b1;
        paletteData[idx + 3] = 255;
      }
    }

    const texture = gl.createTexture();
    if (!texture) return null;

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      256,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      paletteData,
    );

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    return texture;
  }
}
