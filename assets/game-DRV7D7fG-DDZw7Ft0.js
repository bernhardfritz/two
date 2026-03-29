const U=`#version 300 es

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
`,F=`#version 300 es

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
`;function y(t,e,n){const r=t.createShader(e);if(r===null)throw new Error("Couldn't create shader!");if(t.shaderSource(r,n),t.compileShader(r),!t.getShaderParameter(r,t.COMPILE_STATUS)){const i=t.getShaderInfoLog(r);throw t.deleteShader(r),new Error(i??"")}return r}function D(t,e,n){const r=t.createProgram();if(t.attachShader(r,e),t.attachShader(r,n),t.linkProgram(r),!t.getProgramParameter(r,t.LINK_STATUS)){const i=t.getProgramInfoLog(r);throw t.deleteProgram(r),new Error(i??"")}return r}const T={vec4:Float32Array.BYTES_PER_ELEMENT*4,mat4:Float32Array.BYTES_PER_ELEMENT*16};function g(t){let e=0;for(const[n,r]of t)e+=T[r];return e}function w(t,e){let n=0;for(const[r,i]of t){if(r===e)break;n+=T[i]}return n}function S(t,e){e=e||1;const n=t.clientWidth*e|0,r=t.clientHeight*e|0;return t.width!==n||t.height!==r?(t.width=n,t.height=r,!0):!1}function B(t,e,n,r,i,c,a){return a=a||new Float32Array(16),a[0]=2/(e-t),a[1]=0,a[2]=0,a[3]=0,a[4]=0,a[5]=2/(r-n),a[6]=0,a[7]=0,a[8]=0,a[9]=0,a[10]=2/(i-c),a[11]=0,a[12]=(t+e)/(t-e),a[13]=(n+r)/(n-r),a[14]=(i+c)/(i-c),a[15]=1,a}function I(t,e){const n=y(t,t.VERTEX_SHADER,U),r=y(t,t.FRAGMENT_SHADER,F),i=D(t,n,r),c=t.getAttribLocation(i,"a_position"),a=t.getAttribLocation(i,"a_model_matrix"),b=t.getAttribLocation(i,"a_texture_matrix"),f=t.getAttribLocation(i,"a_tint_color"),x=t.getUniformLocation(i,"u_projection"),A=t.getUniformLocation(i,"u_texture"),R=t.createVertexArray();t.bindVertexArray(R);const l=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,l);const d=[0,0,1,0,0,1,1,1];t.bufferData(t.ARRAY_BUFFER,new Float32Array(d),t.STATIC_DRAW),t.enableVertexAttribArray(c);const u=2,m=t.FLOAT;t.vertexAttribPointer(c,u,m,!1,0,0);const _=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,_),t.bufferData(t.ARRAY_BUFFER,0,t.DYNAMIC_DRAW);for(let o=0;o<4;o++){const s=a+o;t.enableVertexAttribArray(s),t.vertexAttribPointer(s,4,t.FLOAT,!1,g(e),w(e,"a_model_matrix")+o*T.vec4),t.vertexAttribDivisor(s,1)}for(let o=0;o<4;o++){const s=b+o;t.enableVertexAttribArray(s),t.vertexAttribPointer(s,4,t.FLOAT,!1,g(e),w(e,"a_texture_matrix")+o*T.vec4),t.vertexAttribDivisor(s,1)}return t.enableVertexAttribArray(f),t.vertexAttribPointer(f,4,t.FLOAT,!1,g(e),w(e,"a_tint_color")),t.vertexAttribDivisor(f,1),t.bindVertexArray(null),t.deleteBuffer(l),t.enable(t.BLEND),t.blendFunc(t.SRC_ALPHA,t.ONE_MINUS_SRC_ALPHA),o=>{S(t.canvas,globalThis.devicePixelRatio),t.viewport(0,0,t.canvas.width,t.canvas.height),t.useProgram(i);const s=B(0,t.canvas.clientWidth,t.canvas.clientHeight,0,-1,1);t.uniformMatrix4fv(x,!1,s),t.uniform1i(A,0),t.bindVertexArray(R),t.bindBuffer(t.ARRAY_BUFFER,_),t.getBufferParameter(t.ARRAY_BUFFER,t.BUFFER_SIZE)!=o.byteLength?t.bufferData(t.ARRAY_BUFFER,o,t.DYNAMIC_DRAW):t.bufferSubData(t.ARRAY_BUFFER,0,o);const h=t.TRIANGLE_STRIP,p=0,v=4,E=o.byteLength/g(e);t.drawArraysInstanced(h,p,v,E)}}const L=WebAssembly.instantiateStreaming||(async(t,e)=>{const n=await(await t).arrayBuffer();return await WebAssembly.instantiate(n,e)});async function P(t){const e=t.gl;await import(new URL(`${t.baseURI}wasm_exec.js`).href);const n=new Go;let r;const i={};let c=[createImageBitmap(new ImageData(new Uint8ClampedArray([255,255,255,255]),1,1))],a=1,b=1;n.importObject.env={writeFile:function(f,x,A,R){const l=new Uint8Array(r.exports.memory.buffer),d=new TextDecoder().decode(l.subarray(f,f+x)),u=l.subarray(A,A+R);i[d]=u},loadTexture:function(f,x,A,R){const l=new Uint8Array(r.exports.memory.buffer),d=new TextDecoder().decode(l.subarray(f,f+x)),u=i[d],m=new DataView(u.buffer,u.byteOffset,u.byteLength),_=m.getUint32(16),o=m.getUint32(20),s=c.length-1,h=new Blob([u],{type:"image/png"}),p=createImageBitmap(h);c.push(p),a=Math.max(a,_),b=Math.max(b,o);const v=l.subarray(A,A+R),E=new DataView(v.buffer,v.byteOffset,v.byteLength);E.setUint32(0,s,!0),E.setUint32(4,_,!0),E.setUint32(8,o,!0)}},L(fetch(new URL(`${t.baseURI}main.wasm`)),n.importObject).then(async function(f){r=f.instance,n.run(r);const x=e.createTexture();e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D_ARRAY,x),e.texParameteri(e.TEXTURE_2D_ARRAY,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D_ARRAY,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texImage3D(e.TEXTURE_2D_ARRAY,0,e.RGBA8,a,b,c.length,0,e.RGBA,e.UNSIGNED_BYTE,null),c=c.map((u,m)=>u.then(_=>(e.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,m,_.width,_.height,1,e.RGBA,e.UNSIGNED_BYTE,_),_.close(),_))),await Promise.all(c),e.generateMipmap(e.TEXTURE_2D_ARRAY);const A=new Map([["a_model_matrix","mat4"],["a_texture_matrix","mat4"],["a_tint_color","vec4"]]),R=I(e,A);let l=0;const d=u=>{const m=r.exports.update(u-l,e.canvas.clientWidth,e.canvas.clientHeight,t.mouseX,t.mouseY,t.mouseButtons),_=Number(m>>32n),o=Number(m&0xffffffffn),s=new Uint8Array(r.exports.memory.buffer,_,o),h=new Float32Array(s.buffer,s.byteOffset,g(A)/4*o);R(h),l=u,requestAnimationFrame(d)};requestAnimationFrame(d)})}export{P as game};
