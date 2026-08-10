export const mapFragmentShaderSource = `#version 300 es
precision highp float;
precision highp usampler2D;

in vec2 v_texCoord;
out vec4 fragColor;

uniform sampler2D u_terrainTexture;
uniform usampler2D u_liveStateTexture;
uniform sampler2D u_paletteTexture;
uniform sampler2D u_gdpPaletteTexture;

uniform float u_time;
uniform float u_overlayOpacity;
uniform vec2 u_texelSize;
uniform int u_activeLayer;

void main() {
  vec4 terrainColor = texture(u_terrainTexture, v_texCoord);
  uint rawState = texture(u_liveStateTexture, v_texCoord).r;
  uint provinceId = rawState & 4095u;

  if (provinceId == 0u) {
    fragColor = terrainColor;
    return;
  }

  uint pRight = texture(u_liveStateTexture, v_texCoord + vec2(u_texelSize.x, 0.0)).r & 4095u;
  uint pDown = texture(u_liveStateTexture, v_texCoord + vec2(0.0, u_texelSize.y)).r & 4095u;
  uint pLeft = texture(u_liveStateTexture, v_texCoord - vec2(u_texelSize.x, 0.0)).r & 4095u;
  uint pUp = texture(u_liveStateTexture, v_texCoord - vec2(0.0, u_texelSize.y)).r & 4095u;

  float uCoord = (float(provinceId & 255u) + 0.5) / 256.0;
  float vCoord = (float((provinceId >> 8u) & 255u) + 0.5) / 256.0;

  vec4 landColor;
  if (u_activeLayer == 1) {
    landColor = texture(u_gdpPaletteTexture, vec2(uCoord, vCoord));
  } else {
    landColor = texture(u_paletteTexture, vec2(uCoord, vCoord));
  }

  bool isCoast = (pRight == 0u || pDown == 0u || pLeft == 0u || pUp == 0u);
  bool isInternal = false;
  bool isInternational = false;

  uint neighborId = 0u;
  if (pRight > 0u && provinceId != pRight) {
    neighborId = pRight;
  } else if (pDown > 0u && provinceId != pDown) {
    neighborId = pDown;
  }

  if (neighborId > 0u) {
    float nU = (float(neighborId & 255u) + 0.5) / 256.0;
    float nV = (float((neighborId >> 8u) & 255u) + 0.5) / 256.0;
    vec4 neighborColor;
    if (u_activeLayer == 1) {
      neighborColor = texture(u_gdpPaletteTexture, vec2(nU, nV));
    } else {
      neighborColor = texture(u_paletteTexture, vec2(nU, nV));
    }

    float colorDiff = distance(landColor.rgb, neighborColor.rgb);
    if (colorDiff < 0.02) {
      isInternal = true;
    } else {
      isInternational = true;
    }
  }

  vec3 blendedColor = mix(terrainColor.rgb, landColor.rgb, 0.70);

  if (isInternational) {
    blendedColor = mix(blendedColor, vec3(0.02, 0.04, 0.10), 0.85);
  } else if (isInternal) {
    blendedColor = mix(blendedColor, vec3(0.05, 0.08, 0.18), 0.35);
  } else if (isCoast) {
    blendedColor = mix(blendedColor, vec3(0.08, 0.14, 0.22), 0.40);
  }

  fragColor = vec4(blendedColor, 1.0);
}
`;
