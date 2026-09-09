import { mapVertexShaderSource } from "@/presentation/components/tactical-map/final/shaders/map-vertex.shader";
import { mapFragmentShaderSource } from "@/presentation/components/tactical-map/final/shaders/map-fragment.shader";

export class WebGLMapRenderer {
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram | null = null;

  private vao: WebGLVertexArrayObject | null = null;
  private terrainTexture: WebGLTexture | null = null;
  private terrainPaletteTexture: WebGLTexture | null = null;
  private liveStateTexture: WebGLTexture | null = null;
  private paletteTexture: WebGLTexture | null = null;
  private gdpPaletteTexture: WebGLTexture | null = null;
  private diplomaticPaletteTexture: WebGLTexture | null = null;

  private uResolutionLoc: WebGLUniformLocation | null = null;
  private uPositionLoc: WebGLUniformLocation | null = null;
  private uScaleLoc: WebGLUniformLocation | null = null;
  private uTexelSizeLoc: WebGLUniformLocation | null = null;
  private uActiveLayerLoc: WebGLUniformLocation | null = null;
  private uHoveredCountryLoc: WebGLUniformLocation | null = null;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
    this.initShaders();
    this.initBuffers();
  }

  private initShaders(): void {
    const gl = this.gl;

    const vertShader = this.compileShader(
      gl.VERTEX_SHADER,
      mapVertexShaderSource,
    );
    const fragShader = this.compileShader(
      gl.FRAGMENT_SHADER,
      mapFragmentShaderSource,
    );

    if (!vertShader || !fragShader) {
      return;
    }

    const prog = gl.createProgram();
    if (prog) {
      gl.attachShader(prog, vertShader);
      gl.attachShader(prog, fragShader);
      gl.linkProgram(prog);

      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        gl.deleteProgram(prog);
        return;
      }

      this.program = prog;
      this.uResolutionLoc = gl.getUniformLocation(prog, "u_resolution");
      this.uPositionLoc = gl.getUniformLocation(prog, "u_position");
      this.uScaleLoc = gl.getUniformLocation(prog, "u_scale");
      this.uTexelSizeLoc = gl.getUniformLocation(prog, "u_texelSize");
      this.uActiveLayerLoc = gl.getUniformLocation(prog, "u_activeLayer");
      this.uHoveredCountryLoc = gl.getUniformLocation(
        prog,
        "u_hoveredCountryId",
      );

      const uTerrainLoc = gl.getUniformLocation(prog, "u_terrainTexture");
      const uTerrainPaletteLoc = gl.getUniformLocation(
        prog,
        "u_terrainPaletteTexture",
      );
      const uLiveStateLoc = gl.getUniformLocation(prog, "u_liveStateTexture");
      const uPaletteLoc = gl.getUniformLocation(prog, "u_paletteTexture");
      const uGdpPaletteLoc = gl.getUniformLocation(prog, "u_gdpPaletteTexture");
      const uDiplomaticLoc = gl.getUniformLocation(
        prog,
        "u_diplomaticPaletteTexture",
      );

      gl.useProgram(prog);
      if (uTerrainLoc) gl.uniform1i(uTerrainLoc, 0);
      if (uLiveStateLoc) gl.uniform1i(uLiveStateLoc, 1);
      if (uPaletteLoc) gl.uniform1i(uPaletteLoc, 2);
      if (uGdpPaletteLoc) gl.uniform1i(uGdpPaletteLoc, 3);
      if (uDiplomaticLoc) gl.uniform1i(uDiplomaticLoc, 4);
      if (uTerrainPaletteLoc) gl.uniform1i(uTerrainPaletteLoc, 5);
      if (this.uHoveredCountryLoc) gl.uniform1i(this.uHoveredCountryLoc, 0);
    }
  }

  private compileShader(type: number, source: string): WebGLShader | null {
    const gl = this.gl;
    const shader = gl.createShader(type);
    if (!shader) return null;

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  private initBuffers(): void {
    const gl = this.gl;
    if (!this.program) return;

    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);

    const positions = new Float32Array([
      0, 0, 0, 0, 4096, 0, 1, 0, 0, 2048, 0, 1, 0, 2048, 0, 1, 4096, 0, 1, 0,
      4096, 2048, 1, 1,
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const aPosLoc = gl.getAttribLocation(this.program, "a_position");
    const aTexLoc = gl.getAttribLocation(this.program, "a_texCoord");

    gl.enableVertexAttribArray(aPosLoc);
    gl.vertexAttribPointer(aPosLoc, 2, gl.FLOAT, false, 16, 0);

    gl.enableVertexAttribArray(aTexLoc);
    gl.vertexAttribPointer(aTexLoc, 2, gl.FLOAT, false, 16, 8);
  }

  public setTerrainData(
    indexedGrid: Uint8Array,
    paletteRgba: Uint8Array,
    width = 4096,
    height = 2048,
  ): void {
    const gl = this.gl;

    if (!this.terrainTexture) {
      this.terrainTexture = gl.createTexture();
    }
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.terrainTexture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.R8UI,
      width,
      height,
      0,
      gl.RED_INTEGER,
      gl.UNSIGNED_BYTE,
      indexedGrid,
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    if (!this.terrainPaletteTexture) {
      this.terrainPaletteTexture = gl.createTexture();
    }
    gl.activeTexture(gl.TEXTURE5);
    gl.bindTexture(gl.TEXTURE_2D, this.terrainPaletteTexture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      256,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      paletteRgba,
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  }

  public updateLiveStateTexture(
    uint16Data: Uint16Array,
    width = 4096,
    height = 2048,
  ): void {
    const gl = this.gl;
    if (!this.liveStateTexture) {
      this.liveStateTexture = gl.createTexture();
    }

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.liveStateTexture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.R16UI,
      width,
      height,
      0,
      gl.RED_INTEGER,
      gl.UNSIGNED_SHORT,
      uint16Data,
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  }

  public setPaletteTexture(paletteTexture: WebGLTexture): void {
    this.paletteTexture = paletteTexture;
  }

  public setGdpPaletteTexture(gdpPaletteTexture: WebGLTexture): void {
    this.gdpPaletteTexture = gdpPaletteTexture;
  }

  public setDiplomaticPaletteTexture(
    diplomaticPaletteTexture: WebGLTexture,
  ): void {
    this.diplomaticPaletteTexture = diplomaticPaletteTexture;
  }

  public render(
    width: number,
    height: number,
    posX: number,
    posY: number,
    scale: number,
    activeLayer: "political" | "gdp" = "political",
    hoveredCountryId = 0,
  ): void {
    const gl = this.gl;
    if (!this.program || !this.vao) return;

    gl.useProgram(this.program);
    gl.bindVertexArray(this.vao);

    gl.uniform2f(this.uResolutionLoc, width, height);
    gl.uniform2f(this.uPositionLoc, posX, posY);
    gl.uniform1f(this.uScaleLoc, scale);
    gl.uniform2f(this.uTexelSizeLoc, 1.0 / 4096.0, 1.0 / 2048.0);
    gl.uniform1i(this.uActiveLayerLoc, activeLayer === "gdp" ? 1 : 0);

    if (this.uHoveredCountryLoc) {
      gl.uniform1i(this.uHoveredCountryLoc, hoveredCountryId);
    }

    if (this.terrainTexture) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.terrainTexture);
    }

    if (this.liveStateTexture) {
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.liveStateTexture);
    }

    if (this.paletteTexture) {
      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, this.paletteTexture);
    }

    if (this.gdpPaletteTexture) {
      gl.activeTexture(gl.TEXTURE3);
      gl.bindTexture(gl.TEXTURE_2D, this.gdpPaletteTexture);
    }

    if (this.diplomaticPaletteTexture) {
      gl.activeTexture(gl.TEXTURE4);
      gl.bindTexture(gl.TEXTURE_2D, this.diplomaticPaletteTexture);
    }

    if (this.terrainPaletteTexture) {
      gl.activeTexture(gl.TEXTURE5);
      gl.bindTexture(gl.TEXTURE_2D, this.terrainPaletteTexture);
    }

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}
