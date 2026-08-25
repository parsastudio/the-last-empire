import {
  TacticalPaletteGenerator,
  CountryRegistry,
  Province,
  getProvinceGdp,
} from "@geopolitics/domain";

export class WebGLPaletteTextureManager {
  private static interpolateChannel(
    a: number,
    b: number,
    factor: number,
  ): number {
    return Math.round(a + (b - a) * factor);
  }

  private static calculateGdpRankColor(normalized: number): {
    r: number;
    g: number;
    b: number;
  } {
    const t = Math.max(0, Math.min(1.0, normalized));

    if (t <= 0.33) {
      const segT = t / 0.33;
      return {
        r: this.interpolateChannel(225, 249, segT),
        g: this.interpolateChannel(29, 115, segT),
        b: this.interpolateChannel(72, 22, segT),
      };
    }

    if (t <= 0.66) {
      const segT = (t - 0.33) / 0.33;
      return {
        r: this.interpolateChannel(249, 163, segT),
        g: this.interpolateChannel(115, 230, segT),
        b: this.interpolateChannel(22, 53, segT),
      };
    }

    const segT = (t - 0.66) / 0.34;
    return {
      r: this.interpolateChannel(163, 16, segT),
      g: this.interpolateChannel(230, 185, segT),
      b: this.interpolateChannel(53, 129, segT),
    };
  }

  private static fillPaletteBuffer(
    data: Uint8Array,
    provincesMap?: Record<string, Province>,
  ): void {
    if (!provincesMap) return;

    for (const prov of Object.values(provincesMap)) {
      const pid = prov.provinceId;
      if (pid <= 0 || pid >= 65536) continue;

      const ownerId = prov.ownerNationId;
      const numId = CountryRegistry.resolveNumericId(ownerId);
      const pair = TacticalPaletteGenerator.generateColorForCountry(
        numId || 118,
      );

      const u = pid & 255;
      const v = (pid >> 8) & 255;
      const idx = (v * 256 + u) * 4;

      data[idx] = pair.r1;
      data[idx + 1] = pair.g1;
      data[idx + 2] = pair.b1;
      data[idx + 3] = 255;
    }
  }

  private static fillGdpBuffer(
    data: Uint8Array,
    provincesMap?: Record<string, Province>,
  ): void {
    if (!provincesMap) return;

    const provList = Object.values(provincesMap).filter(
      (p) => p.provinceId > 0 && p.provinceId < 65536,
    );

    if (provList.length === 0) return;

    const gdpEntries = provList.map((prov) => ({
      prov,
      gdp: getProvinceGdp(prov),
    }));

    gdpEntries.sort((a, b) => b.gdp - a.gdp);

    const totalCount = gdpEntries.length;

    for (let rankIndex = 0; rankIndex < totalCount; rankIndex++) {
      const entry = gdpEntries[rankIndex]!;
      const pid = entry.prov.provinceId;

      const normalized =
        totalCount > 1 ? 1.0 - rankIndex / (totalCount - 1) : 1.0;

      const { r, g, b } = this.calculateGdpRankColor(normalized);

      const u = pid & 255;
      const v = (pid >> 8) & 255;
      const idx = (v * 256 + u) * 4;

      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = 255;
    }
  }

  public static createPaletteTexture(
    gl: WebGL2RenderingContext,
    provincesMap?: Record<string, Province>,
  ): WebGLTexture | null {
    const data = new Uint8Array(256 * 256 * 4);
    this.fillPaletteBuffer(data, provincesMap);

    const texture = gl.createTexture();
    if (!texture) return null;

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      256,
      256,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      data,
    );

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    return texture;
  }

  public static updatePaletteTexture(
    gl: WebGL2RenderingContext,
    texture: WebGLTexture,
    provincesMap?: Record<string, Province>,
  ): void {
    const data = new Uint8Array(256 * 256 * 4);
    this.fillPaletteBuffer(data, provincesMap);

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texSubImage2D(
      gl.TEXTURE_2D,
      0,
      0,
      0,
      256,
      256,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      data,
    );
  }

  public static createGdpPaletteTexture(
    gl: WebGL2RenderingContext,
    provincesMap?: Record<string, Province>,
  ): WebGLTexture | null {
    const data = new Uint8Array(256 * 256 * 4);
    this.fillGdpBuffer(data, provincesMap);

    const texture = gl.createTexture();
    if (!texture) return null;

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      256,
      256,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      data,
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
    provincesMap?: Record<string, Province>,
  ): void {
    const data = new Uint8Array(256 * 256 * 4);
    this.fillGdpBuffer(data, provincesMap);

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texSubImage2D(
      gl.TEXTURE_2D,
      0,
      0,
      0,
      256,
      256,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      data,
    );
  }
}
