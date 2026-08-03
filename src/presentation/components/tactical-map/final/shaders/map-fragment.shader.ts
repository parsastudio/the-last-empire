export const mapFragmentShaderSource = `#version 300 es
precision highp float;
precision highp usampler2D;

in vec2 v_texCoord;
out vec4 fragColor;

uniform sampler2D u_terrainTexture;
uniform usampler2D u_liveStateTexture;
uniform sampler2D u_paletteTexture;

uniform float u_time;
uniform float u_overlayOpacity;

void main() {
  vec4 terrainColor = texture(u_terrainTexture, v_texCoord);
  uint rawState = texture(u_liveStateTexture, v_texCoord).r;

  uint nationId = rawState & 255u;
  uint frontierBit = (rawState >> 13u) & 1u;

  if (nationId == 0u) {
    fragColor = terrainColor;
    return;
  }

  float uCoord = (float(nationId) + 0.5) / 256.0;
  vec4 nationColor = texture(u_paletteTexture, vec2(uCoord, 0.5));

  vec3 blendedColor = mix(terrainColor.rgb, nationColor.rgb, u_overlayOpacity);

  if (frontierBit == 1u) {
    float pulse = 0.5 + 0.5 * sin(u_time * 6.0);
    vec3 fireColor = vec3(0.95, 0.2, 0.1);
    blendedColor = mix(blendedColor, fireColor, 0.6 * pulse);
  }

  fragColor = vec4(blendedColor, 1.0);
}
`;
