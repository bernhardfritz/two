const F=`#version 300 es

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
`,S=`#version 300 es

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
`;function U(t,e,n){const r=t.createShader(e);if(r===null)throw new Error("Couldn't create shader!");if(t.shaderSource(r,n),t.compileShader(r),!t.getShaderParameter(r,t.COMPILE_STATUS)){const i=t.getShaderInfoLog(r);throw t.deleteShader(r),new Error(i??"")}return r}function L(t,e,n){const r=t.createProgram();if(t.attachShader(r,e),t.attachShader(r,n),t.linkProgram(r),!t.getProgramParameter(r,t.LINK_STATUS)){const i=t.getProgramInfoLog(r);throw t.deleteProgram(r),new Error(i??"")}return r}const p={vec4:Float32Array.BYTES_PER_ELEMENT*4,mat4:Float32Array.BYTES_PER_ELEMENT*16};function E(t){let e=0;for(const[n,r]of t)e+=p[r];return e}function y(t,e){let n=0;for(const[r,i]of t){if(r===e)break;n+=p[i]}return n}function D(t,e){e=e||1;const n=t.clientWidth*e|0,r=t.clientHeight*e|0;return t.width!==n||t.height!==r?(t.width=n,t.height=r,!0):!1}function B(t,e,n,r,i,c,a){return a=a||new Float32Array(16),a[0]=2/(e-t),a[1]=0,a[2]=0,a[3]=0,a[4]=0,a[5]=2/(r-n),a[6]=0,a[7]=0,a[8]=0,a[9]=0,a[10]=2/(i-c),a[11]=0,a[12]=(t+e)/(t-e),a[13]=(n+r)/(n-r),a[14]=(i+c)/(i-c),a[15]=1,a}const w=8192;function I(t,e){const n=U(t,t.VERTEX_SHADER,F),r=U(t,t.FRAGMENT_SHADER,S),i=L(t,n,r),c=t.getAttribLocation(i,"a_position"),a=t.getAttribLocation(i,"a_model_matrix"),T=t.getAttribLocation(i,"a_texture_matrix"),f=t.getAttribLocation(i,"a_tint_color"),R=t.getUniformLocation(i,"u_projection"),m=t.getUniformLocation(i,"u_texture"),x=t.createVertexArray();t.bindVertexArray(x);const l=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,l);const d=[0,0,1,0,0,1,1,1];t.bufferData(t.ARRAY_BUFFER,new Float32Array(d),t.STATIC_DRAW),t.enableVertexAttribArray(c);const u=2,A=t.FLOAT;t.vertexAttribPointer(c,u,A,!1,0,0);const _=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,_),t.bufferData(t.ARRAY_BUFFER,w*E(e),t.DYNAMIC_DRAW);for(let o=0;o<4;o++){const s=a+o;t.enableVertexAttribArray(s),t.vertexAttribPointer(s,4,t.FLOAT,!1,E(e),y(e,"a_model_matrix")+o*p.vec4),t.vertexAttribDivisor(s,1)}for(let o=0;o<4;o++){const s=T+o;t.enableVertexAttribArray(s),t.vertexAttribPointer(s,4,t.FLOAT,!1,E(e),y(e,"a_texture_matrix")+o*p.vec4),t.vertexAttribDivisor(s,1)}return t.enableVertexAttribArray(f),t.vertexAttribPointer(f,4,t.FLOAT,!1,E(e),y(e,"a_tint_color")),t.vertexAttribDivisor(f,1),t.bindVertexArray(null),t.deleteBuffer(l),t.enable(t.BLEND),t.blendFunc(t.SRC_ALPHA,t.ONE_MINUS_SRC_ALPHA),o=>{D(t.canvas,globalThis.devicePixelRatio),t.viewport(0,0,t.canvas.width,t.canvas.height),t.useProgram(i);const s=B(0,t.canvas.clientWidth,t.canvas.clientHeight,0,-1,1);t.uniformMatrix4fv(R,!1,s),t.uniform1i(m,0),t.bindVertexArray(x),t.bindBuffer(t.ARRAY_BUFFER,_);const b=o.byteLength/E(e);for(let h=0;h<b;h+=w){const v=Math.min(b-h,w);t.bufferSubData(t.ARRAY_BUFFER,0,o,h*E(e)/Float32Array.BYTES_PER_ELEMENT,v*E(e)/Float32Array.BYTES_PER_ELEMENT);const g=t.TRIANGLE_STRIP;t.drawArraysInstanced(g,0,4,v)}}}const P=WebAssembly.instantiateStreaming||(async(t,e)=>{const n=await(await t).arrayBuffer();return await WebAssembly.instantiate(n,e)});async function N(t){const e=t.gl;await import(new URL(`${t.baseURI}wasm_exec.js`).href);const n=new Go;let r;const i={};let c=[createImageBitmap(new ImageData(new Uint8ClampedArray([255,255,255,255]),1,1))],a=1,T=1;n.importObject.env={writeFile:function(f,R,m,x){const l=new Uint8Array(r.exports.memory.buffer),d=new TextDecoder().decode(l.subarray(f,f+R)),u=l.subarray(m,m+x);i[d]=u},loadTexture:function(f,R,m,x){const l=new Uint8Array(r.exports.memory.buffer),d=new TextDecoder().decode(l.subarray(f,f+R)),u=i[d],A=new DataView(u.buffer,u.byteOffset,u.byteLength),_=A.getUint32(16),o=A.getUint32(20),s=c.length-1,b=new Blob([u],{type:"image/png"}),h=createImageBitmap(b);c.push(h),a=Math.max(a,_),T=Math.max(T,o);const v=l.subarray(m,m+x),g=new DataView(v.buffer,v.byteOffset,v.byteLength);g.setUint32(0,s,!0),g.setUint32(4,_,!0),g.setUint32(8,o,!0)}},P(fetch(new URL(`${t.baseURI}main.wasm`)),n.importObject).then(async function(f){r=f.instance,n.run(r);const R=e.createTexture();e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D_ARRAY,R),e.texParameteri(e.TEXTURE_2D_ARRAY,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D_ARRAY,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texImage3D(e.TEXTURE_2D_ARRAY,0,e.RGBA8,a,T,c.length,0,e.RGBA,e.UNSIGNED_BYTE,null),c=c.map((u,A)=>u.then(_=>(e.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,A,_.width,_.height,1,e.RGBA,e.UNSIGNED_BYTE,_),_.close(),_))),await Promise.all(c),e.generateMipmap(e.TEXTURE_2D_ARRAY);const m=new Map([["a_model_matrix","mat4"],["a_texture_matrix","mat4"],["a_tint_color","vec4"]]),x=I(e,m);let l=0;const d=u=>{const A=r.exports.update(u-l,e.canvas.clientWidth,e.canvas.clientHeight,t.mouseX,t.mouseY,t.mouseButtons),_=Number(A>>32n),o=Number(A&0xffffffffn),s=new Uint8Array(r.exports.memory.buffer,_,o),b=new Float32Array(s.buffer,s.byteOffset,E(m)/4*o);x(b),l=u,requestAnimationFrame(d)};requestAnimationFrame(d)})}export{N as game};
