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
  float edgeSoft = 0.45;

  float intBorder = 0.0;
  float coastBorder = 0.0;
  float provBorder = 0.0;
  float minEdgeDist = 1e6;

  if (pW <= 1u) {
    coastBorder = max(coastBorder, 1.0 - smoothstep(coastStroke - edgeSoft, coastStroke + edgeSoft, dW));
    minEdgeDist = min(minEdgeDist, dW);
  } else if (pW != centerPid) {
    vec4 cW = sampleCountryColor(pW);
    if (distance(centerColor.rgb, cW.rgb) > 0.02) {
      intBorder = max(intBorder, 1.0 - smoothstep(halfStroke - edgeSoft, halfStroke + edgeSoft, dW));
      minEdgeDist = min(minEdgeDist, dW);
    } else {
      provBorder = max(provBorder, 1.0 - smoothstep(provStroke - edgeSoft, provStroke + edgeSoft, dW));
    }
  }

  if (pE <= 1u) {
    coastBorder = max(coastBorder, 1.0 - smoothstep(coastStroke - edgeSoft, coastStroke + edgeSoft, dE));
    minEdgeDist = min(minEdgeDist, dE);
  } else if (pE != centerPid) {
    vec4 cE = sampleCountryColor(pE);
    if (distance(centerColor.rgb, cE.rgb) > 0.02) {
      intBorder = max(intBorder, 1.0 - smoothstep(halfStroke - edgeSoft, halfStroke + edgeSoft, dE));
      minEdgeDist = min(minEdgeDist, dE);
    } else {
      provBorder = max(provBorder, 1.0 - smoothstep(provStroke - edgeSoft, provStroke + edgeSoft, dE));
    }
  }

  if (pN <= 1u) {
    coastBorder = max(coastBorder, 1.0 - smoothstep(coastStroke - edgeSoft, coastStroke + edgeSoft, dN));
    minEdgeDist = min(minEdgeDist, dN);
  } else if (pN != centerPid) {
    vec4 cN = sampleCountryColor(pN);
    if (distance(centerColor.rgb, cN.rgb) > 0.02) {
      intBorder = max(intBorder, 1.0 - smoothstep(halfStroke - edgeSoft, halfStroke + edgeSoft, dN));
      minEdgeDist = min(minEdgeDist, dN);
    } else {
      provBorder = max(provBorder, 1.0 - smoothstep(provStroke - edgeSoft, provStroke + edgeSoft, dN));
    }
  }

  if (pS <= 1u) {
    coastBorder = max(coastBorder, 1.0 - smoothstep(coastStroke - edgeSoft, coastStroke + edgeSoft, dS));
    minEdgeDist = min(minEdgeDist, dS);
  } else if (pS != centerPid) {
    vec4 cS = sampleCountryColor(pS);
    if (distance(centerColor.rgb, cS.rgb) > 0.02) {
      intBorder = max(intBorder, 1.0 - smoothstep(halfStroke - edgeSoft, halfStroke + edgeSoft, dS));
      minEdgeDist = min(minEdgeDist, dS);
    } else {
      provBorder = max(provBorder, 1.0 - smoothstep(provStroke - edgeSoft, provStroke + edgeSoft, dS));
    }
  }

  vec3 baseColor = mix(terrainColor.rgb, centerColor.rgb, 0.70);

  if (minEdgeDist < 12.0) {
    float glowFactor = exp(-minEdgeDist / 4.5) * 0.20;
    vec3 glowColor = centerColor.rgb * 1.30 + vec3(0.03);
    baseColor = mix(baseColor, glowColor, glowFactor);
  }

  float mainBorderFactor = max(intBorder, coastBorder);
  vec3 darkLineColor = vec3(0.01, 0.02, 0.04);
  baseColor = mix(baseColor, darkLineColor, mainBorderFactor * 0.90);

  vec3 internalLineColor = centerColor.rgb * 0.45;
  baseColor = mix(baseColor, internalLineColor, provBorder * (1.0 - mainBorderFactor) * 0.45);

  fragColor = vec4(baseColor, 1.0);
}
`;
