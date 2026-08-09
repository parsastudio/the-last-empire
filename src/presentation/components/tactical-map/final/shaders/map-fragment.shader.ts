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
  uint provinceId = rawState & 65535u;

  if (provinceId == 0u) {
    fragColor = terrainColor;
    return;
  }

  uint pRight = texture(u_liveStateTexture, v_texCoord + vec2(u_texelSize.x, 0.0)).r & 65535u;
  uint pDown = texture(u_liveStateTexture, v_texCoord + vec2(0.0, u_texelSize.y)).r & 65535u;

  bool isBorder = (provinceId != pRight) || (provinceId != pDown);

  float uCoord = (float(provinceId & 255u) + 0.5) / 256.0;
  float vCoord = (float((provinceId >> 8u) & 255u) + 0.5) / 256.0;

  vec4 landColor;
  if (u_activeLayer == 1) {
    landColor = texture(u_gdpPaletteTexture, vec2(uCoord, vCoord));
  } else {
    landColor = texture(u_paletteTexture, vec2(uCoord, vCoord));
  }

  vec3 blendedColor = mix(terrainColor.rgb, landColor.rgb, 0.70);

  if (isBorder) {
    blendedColor = mix(blendedColor, vec3(0.05, 0.08, 0.18), 0.75);
  }

  fragColor = vec4(blendedColor, 1.0);
}
`;
