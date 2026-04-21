#version 300 es

// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
#ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
#else
  precision mediump float;
#endif
precision mediump sampler2DArray;

in float v_texture_index;
in vec4 v_tint_color;
in vec2 v_uv;

uniform sampler2DArray u_texture;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
  // Just set the output to a constant redish-purple
  outColor = v_tint_color * texture(u_texture, vec3(v_uv, v_texture_index));
}