import { mapVertexShaderSource } from "./shaders/map-vertex.shader";
import { mapFragmentShaderSource } from "./shaders/map-fragment.shader";
import { pickingFragmentShaderSource } from "./shaders/picking-fragment.shader";

export class WebGLMapRenderer {
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram | null = null;
  private pickingProgram: WebGLProgram | null = null;

  private vao: WebGLVertexArrayObject | null = null;
  private terrainTexture: WebGLTexture | null = null;
  private liveStateTexture: WebGLTexture | null = null;
  private paletteTexture: WebGLTexture | null = null;
  private gdpPaletteTexture: WebGLTexture | null = null;

  private pickingFbo: WebGLFramebuffer | null = null;
  private pickingTexture: WebGLTexture | null = null;
  private fboWidth = 0;
  private fboHeight = 0;

  private uResolutionLoc: WebGLUniformLocation | null = null;
  private uPositionLoc: WebGLUniformLocation | null = null;
  private uScaleLoc: WebGLUniformLocation | null = null;
  private uTimeLoc: WebGLUniformLocation | null = null;
  private uOverlayOpacityLoc: WebGLUniformLocation | null = null;
  private uTexelSizeLoc: WebGLUniformLocation | null = null;
  private uActiveLayerLoc: WebGLUniformLocation | null = null;

  private uPickResolutionLoc: WebGLUniformLocation | null = null;
  private uPickPositionLoc: WebGLUniformLocation | null = null;
  private uPickScaleLoc: WebGLUniformLocation | null = null;

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
    const pickFragShader = this.compileShader(
      gl.FRAGMENT_SHADER,
      pickingFragmentShaderSource,
    );

    if (!vertShader || !fragShader || !pickFragShader) return;

    const prog = gl.createProgram();
    if (prog) {
      gl.attachShader(prog, vertShader);
      gl.attachShader(prog, fragShader);
      gl.linkProgram(prog);
      if (gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        this.program = prog;
        this.uResolutionLoc = gl.getUniformLocation(prog, "u_resolution");
        this.uPositionLoc = gl.getUniformLocation(prog, "u_position");
        this.uScaleLoc = gl.getUniformLocation(prog, "u_scale");
        this.uTimeLoc = gl.getUniformLocation(prog, "u_time");
        this.uOverlayOpacityLoc = gl.getUniformLocation(
          prog,
          "u_overlayOpacity",
        );
        this.uTexelSizeLoc = gl.getUniformLocation(prog, "u_texelSize");
        this.uActiveLayerLoc = gl.getUniformLocation(prog, "u_activeLayer");

        const uTerrainLoc = gl.getUniformLocation(prog, "u_terrainTexture");
        const uLiveStateLoc = gl.getUniformLocation(prog, "u_liveStateTexture");
        const uPaletteLoc = gl.getUniformLocation(prog, "u_paletteTexture");
        const uGdpPaletteLoc = gl.getUniformLocation(
          prog,
          "u_gdpPaletteTexture",
        );

        gl.useProgram(prog);
        if (uTerrainLoc) gl.uniform1i(uTerrainLoc, 0);
        if (uLiveStateLoc) gl.uniform1i(uLiveStateLoc, 1);
        if (uPaletteLoc) gl.uniform1i(uPaletteLoc, 2);
        if (uGdpPaletteLoc) gl.uniform1i(uGdpPaletteLoc, 3);
      }
    }

    const pickProg = gl.createProgram();
    if (pickProg) {
      gl.attachShader(pickProg, vertShader);
      gl.attachShader(pickProg, pickFragShader);
      gl.linkProgram(pickProg);
      if (gl.getProgramParameter(pickProg, gl.LINK_STATUS)) {
        this.pickingProgram = pickProg;
        this.uPickResolutionLoc = gl.getUniformLocation(
          pickProg,
          "u_resolution",
        );
        this.uPickPositionLoc = gl.getUniformLocation(pickProg, "u_position");
        this.uPickScaleLoc = gl.getUniformLocation(pickProg, "u_scale");

        const uPickLiveLoc = gl.getUniformLocation(
          pickProg,
          "u_liveStateTexture",
        );
        gl.useProgram(pickProg);
        if (uPickLiveLoc) gl.uniform1i(uPickLiveLoc, 0);
      }
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

  private initPickingFramebuffer(width: number, height: number): void {
    const gl = this.gl;

    if (this.pickingFbo) gl.deleteFramebuffer(this.pickingFbo);
    if (this.pickingTexture) gl.deleteTexture(this.pickingTexture);

    this.fboWidth = width;
    this.fboHeight = height;

    this.pickingTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.pickingTexture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      width,
      height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null,
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    this.pickingFbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.pickingFbo);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      this.pickingTexture,
      0,
    );

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  public setTerrainImage(image: HTMLImageElement): void {
    const gl = this.gl;
    this.terrainTexture = gl.createTexture();

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.terrainTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
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

  public pickAtScreenPos(
    screenX: number,
    screenY: number,
    clientWidth: number,
    clientHeight: number,
    posX: number,
    posY: number,
    scale: number,
  ): { nationId: number; enclaveId: number } {
    const gl = this.gl;
    if (!this.pickingProgram || !this.vao) {
      return { nationId: 0, enclaveId: 0 };
    }

    const dpr =
      typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    const renderWidth = Math.floor(clientWidth * dpr);
    const renderHeight = Math.floor(clientHeight * dpr);

    if (this.fboWidth !== renderWidth || this.fboHeight !== renderHeight) {
      this.initPickingFramebuffer(renderWidth, renderHeight);
    }

    if (!this.pickingFbo) {
      return { nationId: 0, enclaveId: 0 };
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.pickingFbo);
    gl.viewport(0, 0, renderWidth, renderHeight);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(this.pickingProgram);
    gl.bindVertexArray(this.vao);

    gl.uniform2f(this.uPickResolutionLoc, renderWidth, renderHeight);
    gl.uniform2f(this.uPickPositionLoc, posX * dpr, posY * dpr);
    gl.uniform1f(this.uPickScaleLoc, scale * dpr);

    if (this.liveStateTexture) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.liveStateTexture);
    }

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    const pixelX = Math.floor(screenX * dpr);
    const pixelY = Math.floor((clientHeight - screenY) * dpr);

    const pixelData = new Uint8Array(4);
    gl.readPixels(pixelX, pixelY, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixelData);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    return {
      nationId: Math.round((pixelData[0]! / 255) * 255),
      enclaveId: Math.round((pixelData[1]! / 255) * 255),
    };
  }

  public render(
    width: number,
    height: number,
    posX: number,
    posY: number,
    scale: number,
    time: number,
    activeLayer: "political" | "gdp" = "political",
    overlayOpacity = 0.4,
  ): void {
    const gl = this.gl;
    if (!this.program || !this.vao) return;

    gl.useProgram(this.program);
    gl.bindVertexArray(this.vao);

    gl.uniform2f(this.uResolutionLoc, width, height);
    gl.uniform2f(this.uPositionLoc, posX, posY);
    gl.uniform1f(this.uScaleLoc, scale);
    gl.uniform1f(this.uTimeLoc, time);
    gl.uniform1f(this.uOverlayOpacityLoc, overlayOpacity);
    gl.uniform2f(this.uTexelSizeLoc, 1.0 / 4096.0, 1.0 / 2048.0);
    gl.uniform1i(this.uActiveLayerLoc, activeLayer === "gdp" ? 1 : 0);

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

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}
