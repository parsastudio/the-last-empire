export const mapFragmentShaderSource = `#version 300 es
precision highp float;
precision highp usampler2D;

in vec2 v_texCoord;
out vec4 fragColor;

uniform usampler2D u_terrainTexture;
uniform sampler2D u_terrainPaletteTexture;
uniform usampler2D u_liveStateTexture;
uniform sampler2D u_paletteTexture;
uniform sampler2D u_gdpPaletteTexture;
uniform sampler2D u_diplomaticPaletteTexture;

uniform vec2 u_texelSize;
uniform float u_scale;
uniform int u_activeLayer;
uniform int u_hoveredCountryId;

vec4 sampleTerrainColor(vec2 uv) {
  uint colorIdx = texture(u_terrainTexture, uv).r;
  return texelFetch(u_terrainPaletteTexture, ivec2(int(colorIdx), 0), 0);
}

vec4 sampleCountryColor(uint pid) {
  if (pid <= 1u) return vec4(0.0);
  float u = (float(pid & 255u) + 0.5) / 256.0;
  float v = (float((pid >> 8u) & 255u) + 0.5) / 256.0;
  if (u_activeLayer == 1) {
    return texture(u_gdpPaletteTexture, vec2(u, v));
  }
  return texture(u_paletteTexture, vec2(u, v));
}

vec4 sampleDiplomaticColor(uint pid) {
  if (pid <= 1u) return vec4(0.0);
  float u = (float(pid & 255u) + 0.5) / 256.0;
  float v = (float((pid >> 8u) & 255u) + 0.5) / 256.0;
  return texture(u_diplomaticPaletteTexture, vec2(u, v));
}

float calculateBorderDistance3px(vec2 uv, uint centerPid, int centerCountryId) {
  float minD = 4.0;
  vec2 o = u_texelSize;

  vec2 dirs[4] = vec2[4](
    vec2(1.0, 0.0), vec2(-1.0, 0.0), vec2(0.0, 1.0), vec2(0.0, -1.0)
  );

  for (int d = 0; d < 4; d++) {
    vec2 dir = dirs[d];
    for (float step = 1.0; step <= 3.0; step += 1.0) {
      if (step >= minD) break;
      uint neighborRaw = texture(u_liveStateTexture, uv + dir * step * o).r;
      uint neighborPid = neighborRaw & 4095u;
      if (neighborPid <= 1u) {
        minD = min(minD, step);
        break;
      } else if (neighborPid != centerPid) {
        vec4 c = sampleCountryColor(neighborPid);
        int neighborCountry = int(floor(c.a * 255.0 + 0.5));
        if (neighborCountry != centerCountryId) {
          minD = min(minD, step);
          break;
        }
      }
    }
  }
  return minD;
}

void main() {
  vec4 terrainColor = sampleTerrainColor(v_texCoord);
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

  float dW = f.x * u_scale;
  float dE = (1.0 - f.x) * u_scale;
  float dN = f.y * u_scale;
  float dS = (1.0 - f.y) * u_scale;

  float halfStroke = clamp(u_scale * 0.95, 0.85, 1.90);
  float coastStroke = clamp(u_scale * 1.85, 1.40, 3.80);
  float provStroke = clamp(u_scale * 0.45, 0.40, 0.75);
  float edgeSoft = clamp(halfStroke * 0.45, 0.35, 0.70);

  float intBorder = 0.0;
  float coastBorder = 0.0;
  float provBorder = 0.0;
  float hoveredPerimeter = 0.0;

  if (pW <= 1u) {
    float b = 1.0 - smoothstep(coastStroke - edgeSoft, coastStroke + edgeSoft, dW);
    coastBorder = max(coastBorder, b);
    if (isHovered) hoveredPerimeter = max(hoveredPerimeter, b);
  } else if (pW != centerPid) {
    vec4 cW = sampleCountryColor(pW);
    int cW_country = int(floor(cW.a * 255.0 + 0.5));
    if (cW_country != centerCountryId) {
      float b = 1.0 - smoothstep(halfStroke - edgeSoft, halfStroke + edgeSoft, dW);
      intBorder = max(intBorder, b);
      if (isHovered) hoveredPerimeter = max(hoveredPerimeter, b);
    } else if (isHovered) {
      provBorder = max(provBorder, 1.0 - smoothstep(provStroke - edgeSoft, provStroke + edgeSoft, dW));
    }
  }

  if (pE <= 1u) {
    float b = 1.0 - smoothstep(coastStroke - edgeSoft, coastStroke + edgeSoft, dE);
    coastBorder = max(coastBorder, b);
    if (isHovered) hoveredPerimeter = max(hoveredPerimeter, b);
  } else if (pE != centerPid) {
    vec4 cE = sampleCountryColor(pE);
    int cE_country = int(floor(cE.a * 255.0 + 0.5));
    if (cE_country != centerCountryId) {
      float b = 1.0 - smoothstep(halfStroke - edgeSoft, halfStroke + edgeSoft, dE);
      intBorder = max(intBorder, b);
      if (isHovered) hoveredPerimeter = max(hoveredPerimeter, b);
    } else if (isHovered) {
      provBorder = max(provBorder, 1.0 - smoothstep(provStroke - edgeSoft, provStroke + edgeSoft, dE));
    }
  }

  if (pN <= 1u) {
    float b = 1.0 - smoothstep(coastStroke - edgeSoft, coastStroke + edgeSoft, dN);
    coastBorder = max(coastBorder, b);
    if (isHovered) hoveredPerimeter = max(hoveredPerimeter, b);
  } else if (pN != centerPid) {
    vec4 cN = sampleCountryColor(pN);
    int cN_country = int(floor(cN.a * 255.0 + 0.5));
    if (cN_country != centerCountryId) {
      float b = 1.0 - smoothstep(halfStroke - edgeSoft, halfStroke + edgeSoft, dN);
      intBorder = max(intBorder, b);
      if (isHovered) hoveredPerimeter = max(hoveredPerimeter, b);
    } else if (isHovered) {
      provBorder = max(provBorder, 1.0 - smoothstep(provStroke - edgeSoft, provStroke + edgeSoft, dN));
    }
  }

  if (pS <= 1u) {
    float b = 1.0 - smoothstep(coastStroke - edgeSoft, coastStroke + edgeSoft, dS);
    coastBorder = max(coastBorder, b);
    if (isHovered) hoveredPerimeter = max(hoveredPerimeter, b);
  } else if (pS != centerPid) {
    vec4 cS = sampleCountryColor(pS);
    int cS_country = int(floor(cS.a * 255.0 + 0.5));
    if (cS_country != centerCountryId) {
      float b = 1.0 - smoothstep(halfStroke - edgeSoft, halfStroke + edgeSoft, dS);
      intBorder = max(intBorder, b);
      if (isHovered) hoveredPerimeter = max(hoveredPerimeter, b);
    } else if (isHovered) {
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

  if (u_activeLayer == 0) {
    vec4 dipData = sampleDiplomaticColor(centerPid);
    float dipIntensity = dipData.a;

    if (dipIntensity > 0.05) {
      bool isNearImmediate = (pW != centerPid || pE != centerPid || pN != centerPid || pS != centerPid);
      bool shouldCalcGlow = isNearImmediate;
      if (!isNearImmediate) {
        uint pW2 = texture(u_liveStateTexture, v_texCoord + vec2(-2.0 * o.x, 0.0)).r & 4095u;
        uint pE2 = texture(u_liveStateTexture, v_texCoord + vec2(2.0 * o.x, 0.0)).r & 4095u;
        uint pN2 = texture(u_liveStateTexture, v_texCoord + vec2(0.0, -2.0 * o.y)).r & 4095u;
        uint pS2 = texture(u_liveStateTexture, v_texCoord + vec2(0.0, 2.0 * o.y)).r & 4095u;
        shouldCalcGlow = (pW2 != centerPid || pE2 != centerPid || pN2 != centerPid || pS2 != centerPid);
      }

      if (shouldCalcGlow) {
        float borderDist = calculateBorderDistance3px(v_texCoord, centerPid, centerCountryId);

        float innerRim3px = max(0.0, 1.0 - borderDist / 3.0) * dipIntensity;
        float borderEdgeHighlight = max(0.0, 1.0 - borderDist / 1.5) * dipIntensity;

        baseColor = mix(baseColor, dipData.rgb, innerRim3px * 0.75);
        baseColor = mix(baseColor, dipData.rgb * 1.45 + vec3(0.12), borderEdgeHighlight * 0.55);
      }
    }
  }

  float mainBorderFactor = max(intBorder, coastBorder);
  float borderIntensity = clamp(0.60 + u_scale * 0.35, 0.70, 0.94);
  vec3 darkLineColor = vec3(0.01, 0.015, 0.03);
  baseColor = mix(baseColor, darkLineColor, mainBorderFactor * borderIntensity);

  if (isHovered && hoveredPerimeter > 0.0) {
    vec3 rimGlowColor = (u_activeLayer == 1)
      ? vec3(0.35, 0.80, 0.95)
      : mix(centerColor.rgb * 1.35 + vec3(0.1), vec3(0.95), 0.25);
    baseColor = mix(baseColor, rimGlowColor, hoveredPerimeter * 0.50);
  }

  if (isHovered && provBorder > 0.0) {
    vec3 internalLineColor = effectiveCenterColor * 0.30;
    baseColor = mix(baseColor, internalLineColor, provBorder * (1.0 - mainBorderFactor) * 0.65);
  }

  fragColor = vec4(baseColor, 1.0);
}
`;
