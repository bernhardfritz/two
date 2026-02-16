var vertexShaderSource = `#version 300 es

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec4 a_position;
in mat4 a_model_matrix;
// in float a_texture_index;

// out float v_texture_index;

// all shaders have a main function
void main() {

  // gl_Position is a special variable a vertex shader
  // is responsible for setting
  gl_Position = a_model_matrix * a_position;
  
  // v_texture_index = a_texture_index;
}
`;

var fragmentShaderSource = `#version 300 es

// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
precision highp float;

// in float v_texture_index;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
  // Just set the output to a constant redish-purple
  outColor = vec4(1, 0, 0.5, 1);
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

export default function(gl) {
  // create GLSL shaders, upload the GLSL source, compile the shaders
  var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  // Link the two shaders into a program
  var program = createProgram(gl, vertexShader, fragmentShader);

  // look up where the vertex data needs to go.
  var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  var modelMatrixAttributeLocation = gl.getAttribLocation(program, "a_model_matrix");
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
    0, 1,
    1, 0,
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

  const perInstanceDataSize = 4 * 16;
  // const perInstanceDataSize = 4 * 16 + 4;
  for (let i = 0; i < 4; i++) {
    const loc = modelMatrixAttributeLocation + i;
    gl.enableVertexAttribArray(loc);
    const offset = i * 16;
    gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, perInstanceDataSize, offset);
    gl.vertexAttribDivisor(loc, 1);
  }
  
  // gl.enableVertexAttribArray(textureIndexAttributeLocation);
  // gl.vertexAttribPointer(textureIndexAttributeLocation, 1, gl.FLOAT, false, perInstanceDataSize, 4 * 16);
  // gl.vertexAttribDivisor(textureIndexAttributeLocation, 1);
    
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

    // webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // Bind the attribute/buffer set we want.
    gl.bindVertexArray(vao);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(instances.buffer, instances.byteOffset, 4 * 4 * 2), gl.DYNAMIC_DRAW); // Float32Array conversion should happen outside
    // gl.bufferSubData(gl.ARRAY_BUFFER, 0, instances); // TODO

    // draw
    var primitiveType = gl.TRIANGLE_STRIP;
    var offset = 0;
    var count = 4;
    var inst = 2;
    gl.drawArraysInstanced(primitiveType, offset, count, inst); // todo use mat3x3 instead (apparently same performance but lower memory)
  };
}
