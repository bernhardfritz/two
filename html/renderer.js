var vertexShaderSource = `#version 300 es

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec4 a_position;
in mat4 a_model_matrix;
in mat4 a_texture_matrix;
// in float a_texture_index;
in vec4 a_color;
uniform mat4 u_projection;

// out float v_texture_index;
out vec4 v_color;
out vec2 v_uv;

// all shaders have a main function
void main() {

  // gl_Position is a special variable a vertex shader
  // is responsible for setting
  gl_Position = u_projection * a_model_matrix * a_position;
  
  // v_texture_index = a_texture_index;
  v_color = a_color;
  v_uv = vec2(a_texture_matrix * a_position);
}
`;

var fragmentShaderSource = `#version 300 es

// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
precision highp float;
precision lowp sampler2DArray;

// in float v_texture_index;
in vec4 v_color;
in vec2 v_uv;

uniform sampler2DArray u_texture;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
  // Just set the output to a constant redish-purple
  // outColor = vec4(1, 0, 0.5, 1);
  // outColor = v_color;
  // outColor = vec4(v_uv, 0, 1);
  outColor = texture(u_texture, vec3(v_uv, 0)); // TODO don't hardcode texture index
}
`;

function createShader(gl, type, source) {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }

  console.log(gl.getShaderInfoLog(shader));  // eslint-disable-line
  gl.deleteShader(shader);
  return undefined;
}

function createProgram(gl, vertexShader, fragmentShader) {
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }

  console.log(gl.getProgramInfoLog(program));  // eslint-disable-line
  gl.deleteProgram(program);
  return undefined;
}

const sizes = {
  vec4: Float32Array.BYTES_PER_ELEMENT * 4,
  mat4: Float32Array.BYTES_PER_ELEMENT * 16,
};

function sizeof(attributes) {
  let size = 0;
  for (const [_key, value] of attributes) {
    size += sizes[value];     
  }

  return size;  
}

function offsetof(attributes, member) {
  let offset = 0;
  for (const [key, value] of attributes) {
    if (key === member) {
      break;
    }
    offset += sizes[value];
  }
  
  return offset;
}

function renderer(gl) {
  // create GLSL shaders, upload the GLSL source, compile the shaders
  var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  // Link the two shaders into a program
  var program = createProgram(gl, vertexShader, fragmentShader);

  // look up where the vertex data needs to go.
  var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  var modelMatrixAttributeLocation = gl.getAttribLocation(program, "a_model_matrix");
  var textureMatrixAttributeLocation = gl.getAttribLocation(program, "a_texture_matrix");
  var colorAttributeLocation = gl.getAttribLocation(program, "a_color");
  var projectionUniformLocation = gl.getUniformLocation(program, "u_projection");
  var textureUniformLocation = gl.getUniformLocation(program, "u_texture");
  // var textureIndexAttributeLocation = gl.getAttribLocation(program, "a_texture_index");
  
  // Create a vertex array object (attribute state)
  var vao = gl.createVertexArray();

  // and make it the one we're currently working with
  gl.bindVertexArray(vao);

  // Create a buffer and put three 2d clip space points in it
  var positionBuffer = gl.createBuffer();

  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  var positions = [
    0, 0,
    1, 0,
    0, 1,
    1, 1,
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  // Turn on the attribute
  gl.enableVertexAttribArray(positionAttributeLocation);

  // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  var size = 2;          // 2 components per iteration
  var type = gl.FLOAT;   // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(
      positionAttributeLocation, size, type, normalize, stride, offset);
  

  var instanceBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, 0, gl.DYNAMIC_DRAW);

  const attributes = new Map([
    ['a_model_matrix', 'mat4'],
    ['a_texture_matrix', 'mat4'],
    ['a_color', 'vec4'],
  ]);
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
  gl.enableVertexAttribArray(colorAttributeLocation);
  gl.vertexAttribPointer(colorAttributeLocation, 4, gl.FLOAT, false, sizeof(attributes), offsetof(attributes, 'a_color'));
  gl.vertexAttribDivisor(colorAttributeLocation, 1);
  
  // gl.enableVertexAttribArray(textureIndexAttributeLocation);
  // gl.vertexAttribPointer(textureIndexAttributeLocation, 1, gl.FLOAT, false, perInstanceDataSize, 4 * 16);
  // gl.vertexAttribDivisor(textureIndexAttributeLocation, 1);
  
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    
  return (instances) => {
    // let byteOffset = instances.byteOffset;
    // const modelMatrix1 = new Float32Array(instances.buffer, byteOffset, 4 * 4);
    // const textureIndex1 = new Float32Array(instances.buffer, byteOffset += 4 * 4 * Float32Array.BYTES_PER_ELEMENT, 1);
    // const modelMatrix2 = new Float32Array(instances.buffer, byteOffset += 1 * Float32Array.BYTES_PER_ELEMENT, 4 * 4);
    // const textureIndex2 = new Float32Array(instances.buffer, byteOffset += 4 * 4 * Float32Array.BYTES_PER_ELEMENT, 1);
    // console.log('modelMatrix1', modelMatrix1);
    // console.log('textureIndex1', textureIndex1);
    // console.log('modelMatrix2', modelMatrix2);
    // console.log('textureIndex2', textureIndex2);

    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas
    gl.clearColor(1, 1, 1, 1); // TODO make background color configurable
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program); // TODO probably enough to call once instead of once per frame
    
    // const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const projectionMatrix = m4.orthographic(0, gl.canvas.clientWidth, gl.canvas.clientHeight, 0, -1, 1);
    gl.uniformMatrix4fv(projectionUniformLocation, false,
        projectionMatrix);
    gl.uniform1i(textureUniformLocation, 0); // TODO shouldn't be hardcoded

    // Bind the attribute/buffer set we want.
    gl.bindVertexArray(vao); // TODO probably enough to call once instead of once per frame 
    
    gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer); // TODO probably enough to call once instead of once per frame
    const tmp = new Float32Array(instances.buffer, instances.byteOffset, (sizeof(attributes) / 4) * 2); // TODO number 2 shouldn't be hardcoded, it represents the number of instances
    // console.log(tmp);
    gl.bufferData(gl.ARRAY_BUFFER, tmp, gl.DYNAMIC_DRAW); // Float32Array conversion should happen outside
    // gl.bufferSubData(gl.ARRAY_BUFFER, 0, instances); // TODO

    // draw
    var primitiveType = gl.TRIANGLE_STRIP;
    var offset = 0;
    var count = 4;
    var inst = 2;
    gl.drawArraysInstanced(primitiveType, offset, count, inst); // todo use mat3x3 instead (apparently same performance but lower memory)
  };
}
