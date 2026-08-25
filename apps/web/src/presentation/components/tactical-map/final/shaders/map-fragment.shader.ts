export const mapFragmentShaderSource = `#version 300 es
precision highp float;
precision highp usampler2D;

in vec2 v_texCoord;
out vec4 fragColor;

uniform sampler2D u_terrainTexture;
uniform usampler2D u_liveStateTexture;
uniform sampler2D u_paletteTexture;
uniform sampler2D u_gdpPaletteTexture;

uniform vec2 u_texelSize;
uniform float u_scale;
uniform int u_activeLayer;
uniform int u_hoveredCountryId;

vec4 sampleCountryColor(uint pid) {
  if (pid <= 1u) return vec4(0.0);
  float u = (float(pid & 255u) + 0.5) / 256.0;
  float v = (float((pid >> 8u) & 255u) + 0.5) / 256.0;
  if (u_activeLayer == 1) {
    return texture(u_gdpPaletteTexture, vec2(u, v));
  }
  return texture(u_paletteTexture, vec2(u, v));
}

void main() {
  vec4 terrainColor = texture(u_terrainTexture, v_texCoord);
  uint centerRaw = texture(u_liveStateTexture, v_texCoord).r;
  uint centerPid = centerRaw & 4095u;

  if (centerPid <= 1u) {
    fragColor = terrainColor;
    return;
  }

  vec4 centerColor = sampleCountryColor(centerPid);
  int centerCountryId = int(floor(centerColor.a * 255.0 + 0.5));
  bool isHovered = (u_hoveredCountryId > 0 && centerCountryId == u_hoveredCountryId);

  vec2 o = u_texelSize;

  uint pN = texture(u_liveStateTexture, v_texCoord + vec2(0.0, -o.y)).r & 4095u;
  uint pS = texture(u_liveStateTexture, v_texCoord + vec2(0.0, o.y)).r & 4095u;
  uint pW = texture(u_liveStateTexture, v_texCoord + vec2(-o.x, 0.0)).r & 4095u;
  uint pE = texture(u_liveStateTexture, v_texCoord + vec2(o.x, 0.0)).r & 4095u;

  vec2 texelPos = v_texCoord / u_texelSize;
  vec2 f = fract(texelPos);

  float pixelScale = max(1.0, u_scale);
  float dW = f.x * pixelScale;
  float dE = (1.0 - f.x) * pixelScale;
  float dN = f.y * pixelScale;
  float dS = (1.0 - f.y) * pixelScale;

  float halfStroke = 0.95;
  float coastStroke = 1.90;
  float provStroke = 0.70;
  float edgeSoft = 0.40;

  float intBorder = 0.0;
  float coastBorder = 0.0;
  float provBorder = 0.0;
  float hoveredPerimeter = 0.0;
  float minEdgeDist = 1e6;

  if (pW <= 1u) {
    float b = 1.0 - smoothstep(coastStroke - edgeSoft, coastStroke + edgeSoft, dW);
    coastBorder = max(coastBorder, b);
    if (isHovered) hoveredPerimeter = max(hoveredPerimeter, b);
    minEdgeDist = min(minEdgeDist, dW);
  } else if (pW != centerPid) {
    vec4 cW = sampleCountryColor(pW);
    int cW_country = int(floor(cW.a * 255.0 + 0.5));
    if (cW_country != centerCountryId) {
      float b = 1.0 - smoothstep(halfStroke - edgeSoft, halfStroke + edgeSoft, dW);
      intBorder = max(intBorder, b);
      if (isHovered) hoveredPerimeter = max(hoveredPerimeter, b);
      minEdgeDist = min(minEdgeDist, dW);
    } else {
      provBorder = max(provBorder, 1.0 - smoothstep(provStroke - edgeSoft, provStroke + edgeSoft, dW));
    }
  }

  if (pE <= 1u) {
    float b = 1.0 - smoothstep(coastStroke - edgeSoft, coastStroke + edgeSoft, dE);
    coastBorder = max(coastBorder, b);
    if (isHovered) hoveredPerimeter = max(hoveredPerimeter, b);
    minEdgeDist = min(minEdgeDist, dE);
  } else if (pE != centerPid) {
    vec4 cE = sampleCountryColor(pE);
    int cE_country = int(floor(cE.a * 255.0 + 0.5));
    if (cE_country != centerCountryId) {
      float b = 1.0 - smoothstep(halfStroke - edgeSoft, halfStroke + edgeSoft, dE);
      intBorder = max(intBorder, b);
      if (isHovered) hoveredPerimeter = max(hoveredPerimeter, b);
      minEdgeDist = min(minEdgeDist, dE);
    } else {
      provBorder = max(provBorder, 1.0 - smoothstep(provStroke - edgeSoft, provStroke + edgeSoft, dE));
    }
  }

  if (pN <= 1u) {
    float b = 1.0 - smoothstep(coastStroke - edgeSoft, coastStroke + edgeSoft, dN);
    coastBorder = max(coastBorder, b);
    if (isHovered) hoveredPerimeter = max(hoveredPerimeter, b);
    minEdgeDist = min(minEdgeDist, dN);
  } else if (pN != centerPid) {
    vec4 cN = sampleCountryColor(pN);
    int cN_country = int(floor(cN.a * 255.0 + 0.5));
    if (cN_country != centerCountryId) {
      float b = 1.0 - smoothstep(halfStroke - edgeSoft, halfStroke + edgeSoft, dN);
      intBorder = max(intBorder, b);
      if (isHovered) hoveredPerimeter = max(hoveredPerimeter, b);
      minEdgeDist = min(minEdgeDist, dN);
    } else {
      provBorder = max(provBorder, 1.0 - smoothstep(provStroke - edgeSoft, provStroke + edgeSoft, dN));
    }
  }

  if (pS <= 1u) {
    float b = 1.0 - smoothstep(coastStroke - edgeSoft, coastStroke + edgeSoft, dS);
    coastBorder = max(coastBorder, b);
    if (isHovered) hoveredPerimeter = max(hoveredPerimeter, b);
    minEdgeDist = min(minEdgeDist, dS);
  } else if (pS != centerPid) {
    vec4 cS = sampleCountryColor(pS);
    int cS_country = int(floor(cS.a * 255.0 + 0.5));
    if (cS_country != centerCountryId) {
      float b = 1.0 - smoothstep(halfStroke - edgeSoft, halfStroke + edgeSoft, dS);
      intBorder = max(intBorder, b);
      if (isHovered) hoveredPerimeter = max(hoveredPerimeter, b);
      minEdgeDist = min(minEdgeDist, dS);
    } else {
      provBorder = max(provBorder, 1.0 - smoothstep(provStroke - edgeSoft, provStroke + edgeSoft, dS));
    }
  }

  vec3 effectiveCenterColor = centerColor.rgb;
  float blendOpacity = 0.62;

  if (u_activeLayer == 1) {
    if (u_hoveredCountryId > 0) {
      if (isHovered) {
        effectiveCenterColor = effectiveCenterColor * 1.15 + vec3(0.02);
        blendOpacity = 0.76;
      } else {
        float gray = dot(effectiveCenterColor, vec3(0.299, 0.587, 0.114));
        effectiveCenterColor = mix(vec3(gray), effectiveCenterColor, 0.35) * 0.65;
        blendOpacity = 0.55;
      }
    }
  } else {
    if (isHovered) {
      effectiveCenterColor = effectiveCenterColor * 1.15 + vec3(0.025);
      blendOpacity = 0.72;
    } else if (u_hoveredCountryId > 0) {
      effectiveCenterColor = effectiveCenterColor * 0.96;
    }
  }

  vec3 baseColor = mix(terrainColor.rgb, effectiveCenterColor, blendOpacity);

  if (minEdgeDist < 8.0) {
    float glowFactor = exp(-minEdgeDist / 3.0) * (isHovered ? 0.12 : 0.06);
    vec3 glowColor = effectiveCenterColor * 1.20 + vec3(0.02);
    baseColor = mix(baseColor, glowColor, glowFactor);
  }

  float mainBorderFactor = max(intBorder, coastBorder);
  vec3 darkLineColor = vec3(0.01, 0.015, 0.03);
  baseColor = mix(baseColor, darkLineColor, mainBorderFactor * 0.92);

  if (isHovered && hoveredPerimeter > 0.0) {
    vec3 rimGlowColor = (u_activeLayer == 1)
      ? vec3(0.35, 0.80, 0.95)
      : mix(centerColor.rgb * 1.35 + vec3(0.1), vec3(0.95), 0.25);
    baseColor = mix(baseColor, rimGlowColor, hoveredPerimeter * 0.50);
  }

  vec3 internalLineColor = effectiveCenterColor * 0.30;
  baseColor = mix(baseColor, internalLineColor, provBorder * (1.0 - mainBorderFactor) * 0.60);

  fragColor = vec4(baseColor, 1.0);
}
`;
