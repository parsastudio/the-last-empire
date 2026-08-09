import { CountryMapping } from "@/domain/map/country-mapping.schema";
import { TacticalPaletteGenerator } from "@/infrastructure/map-preprocessing/color-palette";
import {
  findCountryProfileById,
  CountryRegistry,
} from "@/domain/data/countries";
import { Nation } from "@/domain/nation/nation.schema";

export class WebGLPaletteTextureManager {
  private static fillGdpPaletteData(
    countries: CountryMapping[],
    nationsMap: Record<string, Nation> | undefined,
    paletteData: Uint8Array,
  ): void {
    paletteData.fill(0);

    for (let i = 0; i < countries.length; i++) {
      const c = countries[i]!;
      if (c.id >= 11 && c.id < 250) {
        const canonicalId = CountryRegistry.resolveCanonicalId(c.id);
        const liveNation = nationsMap
          ? nationsMap[c.id] ||
            nationsMap[canonicalId] ||
            nationsMap[`NATION_${c.code.toUpperCase()}`]
          : null;

        let gdp = 50000000000;
        let isAlive = true;

        if (liveNation) {
          gdp = liveNation.gdp;
          isAlive = liveNation.isAlive;
        } else {
          const profile = findCountryProfileById(c.id);
          gdp = profile ? profile.gdp : 50000000000;
        }

        const idx = c.id * 4;

        if (!isAlive || gdp <= 0) {
          paletteData[idx] = 35;
          paletteData[idx + 1] = 35;
          paletteData[idx + 2] = 40;
          paletteData[idx + 3] = 255;
          continue;
        }

        const logGdp = Math.log10(Math.max(1000000, gdp));
        const normalized = Math.max(0, Math.min(1.0, (logGdp - 8.5) / 5.0));

        const r = Math.floor(10 + (1.0 - normalized) * 200);
        const g = Math.floor(60 + normalized * 195);
        const b = Math.floor(40 + normalized * 80);

        paletteData[idx] = r;
        paletteData[idx + 1] = g;
        paletteData[idx + 2] = b;
        paletteData[idx + 3] = 255;
      }
    }
  }

  public static createGdpPaletteTexture(
    gl: WebGL2RenderingContext,
    countries: CountryMapping[],
    nationsMap?: Record<string, Nation>,
  ): WebGLTexture | null {
    const paletteData = new Uint8Array(256 * 4);
    this.fillGdpPaletteData(countries, nationsMap, paletteData);

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

  public static updateGdpPaletteTexture(
    gl: WebGL2RenderingContext,
    texture: WebGLTexture,
    countries: CountryMapping[],
    nationsMap?: Record<string, Nation>,
  ): void {
    const paletteData = new Uint8Array(256 * 4);
    this.fillGdpPaletteData(countries, nationsMap, paletteData);

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texSubImage2D(
      gl.TEXTURE_2D,
      0,
      0,
      0,
      256,
      1,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      paletteData,
    );
  }

  public static createPaletteTexture(
    gl: WebGL2RenderingContext,
    countries: CountryMapping[],
  ): WebGLTexture | null {
    const paletteData = new Uint8Array(256 * 4);

    for (let i = 0; i < countries.length; i++) {
      const c = countries[i]!;
      if (c.id >= 11 && c.id < 250) {
        const pair = TacticalPaletteGenerator.generateColorForCountry(c.id);
        const idx = c.id * 4;
        paletteData[idx] = pair.r1;
        paletteData[idx + 1] = pair.g1;
        paletteData[idx + 2] = pair.b1;
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
