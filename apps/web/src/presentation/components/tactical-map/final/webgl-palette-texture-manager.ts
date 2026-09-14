import { Province, Nation } from "@geopolitics/domain";
import { PaletteBufferBuilder } from "@/presentation/components/tactical-map/final/utils/palette-buffer-builder";

export class WebGLPaletteTextureManager {
  private static readonly BUFFER_SIZE = 256 * 256 * 4;

  private static createTextureFromBuffer(
    gl: WebGL2RenderingContext,
    data: Uint8Array,
  ): WebGLTexture | null {
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

  private static updateTextureFromBuffer(
    gl: WebGL2RenderingContext,
    texture: WebGLTexture,
    data: Uint8Array,
  ): void {
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

  private static createBufferAndFill(
    fillFn: (data: Uint8Array) => void,
  ): Uint8Array {
    const data = new Uint8Array(this.BUFFER_SIZE);
    fillFn(data);
    return data;
  }

  public static createPaletteTexture(
    gl: WebGL2RenderingContext,
    provincesMap?: Record<string, Province>,
  ): WebGLTexture | null {
    const data = this.createBufferAndFill((buf) =>
      PaletteBufferBuilder.fillPoliticalBuffer(buf, provincesMap),
    );
    return this.createTextureFromBuffer(gl, data);
  }

  public static updatePaletteTexture(
    gl: WebGL2RenderingContext,
    texture: WebGLTexture,
    provincesMap?: Record<string, Province>,
  ): void {
    const data = this.createBufferAndFill((buf) =>
      PaletteBufferBuilder.fillPoliticalBuffer(buf, provincesMap),
    );
    this.updateTextureFromBuffer(gl, texture, data);
  }

  public static createDiplomaticTexture(
    gl: WebGL2RenderingContext,
    provincesMap?: Record<string, Province>,
    nationsMap?: Record<string, Nation>,
    humanNationId?: string,
  ): WebGLTexture | null {
    const data = this.createBufferAndFill((buf) =>
      PaletteBufferBuilder.fillDiplomaticBuffer(
        buf,
        provincesMap,
        nationsMap,
        humanNationId,
      ),
    );
    return this.createTextureFromBuffer(gl, data);
  }

  public static updateDiplomaticTexture(
    gl: WebGL2RenderingContext,
    texture: WebGLTexture,
    provincesMap?: Record<string, Province>,
    nationsMap?: Record<string, Nation>,
    humanNationId?: string,
  ): void {
    const data = this.createBufferAndFill((buf) =>
      PaletteBufferBuilder.fillDiplomaticBuffer(
        buf,
        provincesMap,
        nationsMap,
        humanNationId,
      ),
    );
    this.updateTextureFromBuffer(gl, texture, data);
  }

  public static createGdpPaletteTexture(
    gl: WebGL2RenderingContext,
    provincesMap?: Record<string, Province>,
  ): WebGLTexture | null {
    const data = this.createBufferAndFill((buf) =>
      PaletteBufferBuilder.fillGdpBuffer(buf, provincesMap),
    );
    return this.createTextureFromBuffer(gl, data);
  }

  public static updateGdpPaletteTexture(
    gl: WebGL2RenderingContext,
    texture: WebGLTexture,
    provincesMap?: Record<string, Province>,
  ): void {
    const data = this.createBufferAndFill((buf) =>
      PaletteBufferBuilder.fillGdpBuffer(buf, provincesMap),
    );
    this.updateTextureFromBuffer(gl, texture, data);
  }
}
