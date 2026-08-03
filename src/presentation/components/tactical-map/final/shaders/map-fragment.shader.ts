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

  uint nationId = rawState & 255u;
  uint frontierBit = (rawState >> 13u) & 1u;

  uint nLeft = texture(u_liveStateTexture, v_texCoord + vec2(-u_texelSize.x, 0.0)).r & 255u;
  uint nRight = texture(u_liveStateTexture, v_texCoord + vec2(u_texelSize.x, 0.0)).r & 255u;
  uint nUp = texture(u_liveStateTexture, v_texCoord + vec2(0.0, -u_texelSize.y)).r & 255u;
  uint nDown = texture(u_liveStateTexture, v_texCoord + vec2(0.0, u_texelSize.y)).r & 255u;

  bool isBorder = (nationId != nLeft) || (nationId != nRight) || (nationId != nUp) || (nationId != nDown);

  if (nationId == 0u) {
    if (isBorder && (nLeft >= 11u || nRight >= 11u || nUp >= 11u || nDown >= 11u)) {
      fragColor = vec4(0.10, 0.12, 0.16, 1.0);
      return;
    }
    fragColor = terrainColor;
    return;
  }

  float uCoord = (float(nationId) + 0.5) / 256.0;
  vec4 nationColor;

  if (u_activeLayer == 1) {
    nationColor = texture(u_gdpPaletteTexture, vec2(uCoord, 0.5));
  } else {
    nationColor = texture(u_paletteTexture, vec2(uCoord, 0.5));
  }

  vec3 blendedColor = mix(terrainColor.rgb, nationColor.rgb, 0.70);

  if (isBorder) {
    blendedColor = mix(blendedColor, vec3(0.08, 0.10, 0.14), 0.85);
  }

  if (frontierBit == 1u) {
    float pulse = 0.5 + 0.5 * sin(u_time * 6.0);
    vec3 fireColor = vec3(0.95, 0.2, 0.1);
    blendedColor = mix(blendedColor, fireColor, 0.6 * pulse);
  }

  fragColor = vec4(blendedColor, 1.0);
}
`;
