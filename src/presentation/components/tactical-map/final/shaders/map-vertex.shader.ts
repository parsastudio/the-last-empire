export const mapVertexShaderSource = `#version 300 es
precision highp float;

in vec2 a_position;
in vec2 a_texCoord;

out vec2 v_texCoord;

uniform vec2 u_resolution;
uniform vec2 u_position;
uniform float u_scale;

void main() {
  vec2 mapPixelPos = a_position;
  vec2 screenPixelPos = mapPixelPos * u_scale + u_position;
  
  vec2 zeroToOne = screenPixelPos / u_resolution;
  vec2 zeroToTwo = zeroToOne * 2.0;
  vec2 clipSpace = zeroToTwo - 1.0;

  gl_Position = vec4(clipSpace * vec2(1.0, -1.0), 0.0, 1.0);
  v_texCoord = a_texCoord;
}
`;
