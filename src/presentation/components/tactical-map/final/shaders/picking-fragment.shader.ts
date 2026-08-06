export const pickingFragmentShaderSource = `#version 300 es
precision highp float;
precision highp usampler2D;

in vec2 v_texCoord;
out vec4 fragColor;

uniform usampler2D u_liveStateTexture;

void main() {
  uint rawState = texture(u_liveStateTexture, v_texCoord).r;
  uint nationId = rawState & 255u;
  uint enclaveId = (rawState >> 8u) & 31u;

  if (nationId == 0u || nationId < 11u || nationId >= 250u) {
    fragColor = vec4(0.0, 0.0, 0.0, 0.0);
    return;
  }

  fragColor = vec4(float(nationId) / 255.0, float(enclaveId) / 255.0, 0.0, 1.0);
}
`;
