const vertexShaderSource = `#version 300 es

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec4 a_position;
in mat4 a_model_matrix;
in mat4 a_texture_matrix;
in vec4 a_tint_color;
uniform mat4 u_projection;

out float v_texture_index;
out vec4 v_tint_color;
out vec2 v_uv;

// all shaders have a main function
void main() {

  // gl_Position is a special variable a vertex shader
  // is responsible for setting
  gl_Position = u_projection * a_model_matrix * a_position;
  
  v_texture_index = a_texture_matrix[3][3];
  v_tint_color = a_tint_color;
  v_uv = vec2(a_texture_matrix * a_position);
}
`;

const fragmentShaderSource = `#version 300 es

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
`;

function createShader(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (shader === null) {
    throw new Error("Couldn't create shader!");
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!success) {
    const shaderInfoLog = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(shaderInfoLog ?? '');
  }

  return shader;
}

function createProgram(gl: WebGL2RenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!success) {
    const programInfoLog = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(programInfoLog ?? '');
  }

  return program;
}

export const sizes = {
  vec4: Float32Array.BYTES_PER_ELEMENT * 4,
  mat4: Float32Array.BYTES_PER_ELEMENT * 16,
};

export function sizeof(attributes: Map<string, keyof typeof sizes>) {
  let size = 0;
  for (const [_key, value] of attributes) {
    size += sizes[value];     
  }

  return size;  
}

function offsetof(attributes: Map<string, keyof typeof sizes>, member: string) {
  let offset = 0;
  for (const [key, value] of attributes) {
    if (key === member) {
      break;
    }
    offset += sizes[value];
  }
  
  return offset;
}

function resizeCanvasToDisplaySize(canvas: WebGL2RenderingContext['canvas'] & { clientWidth: number, clientHeight: number }, multiplier?: number) {
  multiplier = multiplier || 1;
  const width  = canvas.clientWidth  * multiplier | 0;
  const height = canvas.clientHeight * multiplier | 0;
  if (canvas.width !== width ||  canvas.height !== height) {
    canvas.width  = width;
    canvas.height = height;
    return true;
  }
  return false;
}

function orthographic(left: number, right: number, bottom: number, top: number, near: number, far: number, dst?: Float32Array) {
  dst = dst || new Float32Array(16);

  dst[ 0] = 2 / (right - left);
  dst[ 1] = 0;
  dst[ 2] = 0;
  dst[ 3] = 0;
  dst[ 4] = 0;
  dst[ 5] = 2 / (top - bottom);
  dst[ 6] = 0;
  dst[ 7] = 0;
  dst[ 8] = 0;
  dst[ 9] = 0;
  dst[10] = 2 / (near - far);
  dst[11] = 0;
  dst[12] = (left + right) / (left - right);
  dst[13] = (bottom + top) / (bottom - top);
  dst[14] = (near + far) / (near - far);
  dst[15] = 1;

  return dst;
}

export type AugmentedWebGL2RenderingContext = WebGL2RenderingContext & { canvas: (HTMLCanvasElement | OffscreenCanvas) & { clientWidth: number, clientHeight: number }};

const DEFAULT_BATCH_BUFFER_ELEMENTS = 8192;

export function renderer(gl: AugmentedWebGL2RenderingContext, attributes: Map<string, keyof typeof sizes>) {
  // create GLSL shaders, upload the GLSL source, compile the shaders
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  // Link the two shaders into a program
  const program = createProgram(gl, vertexShader, fragmentShader);

  // look up where the vertex data needs to go.
  const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  const modelMatrixAttributeLocation = gl.getAttribLocation(program, "a_model_matrix");
  const textureMatrixAttributeLocation = gl.getAttribLocation(program, "a_texture_matrix");
  const tintColorAttributeLocation = gl.getAttribLocation(program, "a_tint_color");
  const projectionUniformLocation = gl.getUniformLocation(program, "u_projection");
  const textureUniformLocation = gl.getUniformLocation(program, "u_texture");
  
  // Create a vertex array object (attribute state)
  const vao = gl.createVertexArray();

  // and make it the one we're currently working with
  gl.bindVertexArray(vao);

  // Create a buffer and put three 2d clip space points in it
  const positionBuffer = gl.createBuffer();

  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  const positions = [
    0, 0,
    1, 0,
    0, 1,
    1, 1,
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  // Turn on the attribute
  gl.enableVertexAttribArray(positionAttributeLocation);

  // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  const size = 2;          // 2 components per iteration
  const type = gl.FLOAT;   // the data is 32bit floats
  const normalize = false; // don't normalize the data
  const stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  const offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(
      positionAttributeLocation, size, type, normalize, stride, offset);

  const instanceBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, DEFAULT_BATCH_BUFFER_ELEMENTS * sizeof(attributes), gl.DYNAMIC_DRAW);

  for (let i = 0; i < 4; i++) {
    const loc = modelMatrixAttributeLocation + i;
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, sizeof(attributes), offsetof(attributes, 'a_model_matrix') + i * sizes.vec4);
    gl.vertexAttribDivisor(loc, 1);
  }
  for (let i = 0; i < 4; i++) {
    const loc = textureMatrixAttributeLocation + i;
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, sizeof(attributes), offsetof(attributes, 'a_texture_matrix') + i * sizes.vec4);
    gl.vertexAttribDivisor(loc, 1);
  }
  gl.enableVertexAttribArray(tintColorAttributeLocation);
  gl.vertexAttribPointer(tintColorAttributeLocation, 4, gl.FLOAT, false, sizeof(attributes), offsetof(attributes, 'a_tint_color'));
  gl.vertexAttribDivisor(tintColorAttributeLocation, 1);
  
  gl.bindVertexArray(null);
  gl.deleteBuffer(positionBuffer);
   
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    
  return (instances: Float32Array<ArrayBuffer>) => {
    resizeCanvasToDisplaySize(gl.canvas, globalThis.devicePixelRatio);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas
    // gl.clearColor(0, 0, 0, 0);
    // gl.clear(gl.COLOR_BUFFER_BIT);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program); // TODO probably enough to call once instead of once per frame
    
    const projectionMatrix = orthographic(0, gl.canvas.clientWidth, gl.canvas.clientHeight, 0, -1, 1);
    gl.uniformMatrix4fv(projectionUniformLocation, false,
        projectionMatrix);
    gl.uniform1i(textureUniformLocation, 0); // TODO shouldn't be hardcoded

    // Bind the attribute/buffer set we want.
    gl.bindVertexArray(vao); // TODO probably enough to call once instead of once per frame 
    
    gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer); // TODO probably enough to call once instead of once per frame
    const instanceCount = instances.byteLength / sizeof(attributes);
    for (let i = 0; i < instanceCount; i += DEFAULT_BATCH_BUFFER_ELEMENTS) {
      const batchElements = Math.min(instanceCount - i, DEFAULT_BATCH_BUFFER_ELEMENTS);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, instances, i * sizeof(attributes) / Float32Array.BYTES_PER_ELEMENT, batchElements * sizeof(attributes) / Float32Array.BYTES_PER_ELEMENT);
      
      // draw
      const primitiveType = gl.TRIANGLE_STRIP;
      const offset = 0;
      const count = 4;
      gl.drawArraysInstanced(primitiveType, offset, count, batchElements); // todo use mat3x3 instead (apparently same performance but lower memory)
    }
  };
}
