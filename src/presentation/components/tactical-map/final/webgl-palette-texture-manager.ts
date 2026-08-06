import { CountryMapping } from "@/domain/map/country-mapping.schema";
import { TacticalPaletteGenerator } from "@/infrastructure/map-preprocessing/color-palette";
import { findCountryProfileById } from "@/domain/data/countries";

export class WebGLPaletteTextureManager {
  private static createTextureFromColorFn(
    gl: WebGL2RenderingContext,
    countries: CountryMapping[],
    colorFn: (c: CountryMapping) => { r: number; g: number; b: number },
  ): WebGLTexture | null {
    const paletteData = new Uint8Array(256 * 4);

    for (let i = 0; i < countries.length; i++) {
      const c = countries[i]!;
      if (c.id >= 11 && c.id < 250) {
        const rgb = colorFn(c);
        const idx = c.id * 4;
        paletteData[idx] = rgb.r;
        paletteData[idx + 1] = rgb.g;
        paletteData[idx + 2] = rgb.b;
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

  public static createPaletteTexture(
    gl: WebGL2RenderingContext,
    countries: CountryMapping[],
  ): WebGLTexture | null {
    return this.createTextureFromColorFn(gl, countries, (c) => {
      const pair = TacticalPaletteGenerator.generateColorForCountry(c.id);
      return { r: pair.r1, g: pair.g1, b: pair.b1 };
    });
  }

  public static createGdpPaletteTexture(
    gl: WebGL2RenderingContext,
    countries: CountryMapping[],
  ): WebGLTexture | null {
    return this.createTextureFromColorFn(gl, countries, (c) => {
      const profile = findCountryProfileById(c.id);
      const gdp = profile ? profile.gdp : 50000000000;

      const logGdp = Math.log10(Math.max(1000000, gdp));
      const normalized = Math.max(0, Math.min(1.0, (logGdp - 9.0) / 4.5));

      const r = Math.floor(10 + (1.0 - normalized) * 180);
      const g = Math.floor(80 + normalized * 160);
      const b = Math.floor(50 + normalized * 50);

      return { r, g, b };
    });
  }
}
