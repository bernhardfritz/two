(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))t(e);new MutationObserver(e=>{for(const r of e)if(r.type==="childList")for(const m of r.addedNodes)m.tagName==="LINK"&&m.rel==="modulepreload"&&t(m)}).observe(document,{childList:!0,subtree:!0});function o(e){const r={};return e.integrity&&(r.integrity=e.integrity),e.referrerPolicy&&(r.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?r.credentials="include":e.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function t(e){if(e.ep)return;e.ep=!0;const r=o(e);fetch(e.href,r)}})();const b="modulepreload",R=function(n){return"/two/"+n},h={},A=function(a,o,t){let e=Promise.resolve();if(o&&o.length>0){let f=function(i){return Promise.all(i.map(l=>Promise.resolve(l).then(d=>({status:"fulfilled",value:d}),d=>({status:"rejected",reason:d}))))};var m=f;document.getElementsByTagName("link");const u=document.querySelector("meta[property=csp-nonce]"),s=u?.nonce||u?.getAttribute("nonce");e=f(o.map(i=>{if(i=R(i),i in h)return;h[i]=!0;const l=i.endsWith(".css"),d=l?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${i}"]${d}`))return;const c=document.createElement("link");if(c.rel=l?"stylesheet":b,l||(c.as="script"),c.crossOrigin="",c.href=i,s&&c.setAttribute("nonce",s),document.head.appendChild(c),l)return new Promise((_,g)=>{c.addEventListener("load",_),c.addEventListener("error",()=>g(new Error(`Unable to preload CSS for ${i}`)))})}))}function r(u){const s=new Event("vite:preloadError",{cancelable:!0});if(s.payload=u,window.dispatchEvent(s),!s.defaultPrevented)throw u}return e.then(u=>{for(const s of u||[])s.status==="rejected"&&r(s.reason);return a().catch(r)})},v=`const D = \`#version 300 es

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
\`, Y = \`#version 300 es

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
\`;
function S(e, t, o) {
  const r = e.createShader(t);
  if (r === null)
    throw new Error("Couldn't create shader!");
  if (e.shaderSource(r, o), e.compileShader(r), !e.getShaderParameter(r, e.COMPILE_STATUS)) {
    const i = e.getShaderInfoLog(r);
    throw e.deleteShader(r), new Error(i ?? "");
  }
  return r;
}
function P(e, t, o) {
  const r = e.createProgram();
  if (e.attachShader(r, t), e.attachShader(r, o), e.linkProgram(r), !e.getProgramParameter(r, e.LINK_STATUS)) {
    const i = e.getProgramInfoLog(r);
    throw e.deleteProgram(r), new Error(i ?? "");
  }
  return r;
}
const l = {
  vec4: Float32Array.BYTES_PER_ELEMENT * 4,
  mat4: Float32Array.BYTES_PER_ELEMENT * 16
};
function w(e) {
  let t = 0;
  for (const [o, r] of e)
    t += l[r];
  return t;
}
function U(e, t) {
  let o = 0;
  for (const [r, n] of e) {
    if (r === t)
      break;
    o += l[n];
  }
  return o;
}
function N(e, t) {
  t = t || 1;
  const o = e.clientWidth * t | 0, r = e.clientHeight * t | 0;
  return e.width !== o || e.height !== r ? (e.width = o, e.height = r, !0) : !1;
}
function M(e, t, o, r, n, i, a) {
  return a = a || new Float32Array(16), a[0] = 2 / (t - e), a[1] = 0, a[2] = 0, a[3] = 0, a[4] = 0, a[5] = 2 / (r - o), a[6] = 0, a[7] = 0, a[8] = 0, a[9] = 0, a[10] = 2 / (n - i), a[11] = 0, a[12] = (e + t) / (e - t), a[13] = (o + r) / (o - r), a[14] = (n + i) / (n - i), a[15] = 1, a;
}
function X(e, t) {
  const o = S(e, e.VERTEX_SHADER, D), r = S(e, e.FRAGMENT_SHADER, Y), n = P(e, o, r), i = e.getAttribLocation(n, "a_position"), a = e.getAttribLocation(n, "a_model_matrix"), v = e.getAttribLocation(n, "a_texture_matrix"), m = e.getAttribLocation(n, "a_tint_color"), x = e.getUniformLocation(n, "u_projection"), d = e.getUniformLocation(n, "u_texture"), b = e.createVertexArray();
  e.bindVertexArray(b);
  const _ = e.createBuffer();
  e.bindBuffer(e.ARRAY_BUFFER, _);
  const R = [
    0,
    0,
    1,
    0,
    0,
    1,
    1,
    1
  ];
  e.bufferData(e.ARRAY_BUFFER, new Float32Array(R), e.STATIC_DRAW), e.enableVertexAttribArray(i);
  const c = 2, h = e.FLOAT;
  e.vertexAttribPointer(
    i,
    c,
    h,
    !1,
    0,
    0
  );
  const p = e.createBuffer();
  e.bindBuffer(e.ARRAY_BUFFER, p), e.bufferData(e.ARRAY_BUFFER, 0, e.DYNAMIC_DRAW);
  for (let s = 0; s < 4; s++) {
    const u = a + s;
    e.enableVertexAttribArray(u), e.vertexAttribPointer(u, 4, e.FLOAT, !1, w(t), U(t, "a_model_matrix") + s * l.vec4), e.vertexAttribDivisor(u, 1);
  }
  for (let s = 0; s < 4; s++) {
    const u = v + s;
    e.enableVertexAttribArray(u), e.vertexAttribPointer(u, 4, e.FLOAT, !1, w(t), U(t, "a_texture_matrix") + s * l.vec4), e.vertexAttribDivisor(u, 1);
  }
  return e.enableVertexAttribArray(m), e.vertexAttribPointer(m, 4, e.FLOAT, !1, w(t), U(t, "a_tint_color")), e.vertexAttribDivisor(m, 1), e.bindVertexArray(null), e.deleteBuffer(_), e.enable(e.BLEND), e.blendFunc(e.SRC_ALPHA, e.ONE_MINUS_SRC_ALPHA), (s) => {
    N(e.canvas, globalThis.devicePixelRatio), e.viewport(0, 0, e.canvas.width, e.canvas.height), e.useProgram(n);
    const u = M(0, e.canvas.clientWidth, e.canvas.clientHeight, 0, -1, 1);
    e.uniformMatrix4fv(
      x,
      !1,
      u
    ), e.uniform1i(d, 0), e.bindVertexArray(b), e.bindBuffer(e.ARRAY_BUFFER, p), e.getBufferParameter(e.ARRAY_BUFFER, e.BUFFER_SIZE) != s.byteLength ? e.bufferData(e.ARRAY_BUFFER, s, e.DYNAMIC_DRAW) : e.bufferSubData(e.ARRAY_BUFFER, 0, s);
    const B = e.TRIANGLE_STRIP, L = 0, F = 4, I = s.byteLength / w(t);
    e.drawArraysInstanced(B, L, F, I);
  };
}
const C = WebAssembly.instantiateStreaming || (async (e, t) => {
  const o = await (await e).arrayBuffer();
  return await WebAssembly.instantiate(o, t);
});
async function O(e) {
  const t = e.gl;
  await import(new URL(\`\${e.baseURI}wasm_exec.js\`).href);
  const o = new Go();
  let r;
  const n = {};
  let i = [createImageBitmap(new ImageData(new Uint8ClampedArray([255, 255, 255, 255]), 1, 1))], a = 1, v = 1;
  o.importObject.env = {
    writeFile: function(m, x, d, b) {
      const _ = new Uint8Array(r.exports.memory.buffer), R = new TextDecoder().decode(_.subarray(m, m + x)), c = _.subarray(d, d + b);
      n[R] = c;
    },
    loadTexture: function(m, x, d, b) {
      const _ = new Uint8Array(r.exports.memory.buffer), R = new TextDecoder().decode(_.subarray(m, m + x)), c = n[R], h = new DataView(c.buffer, c.byteOffset, c.byteLength), A = h.getUint32(16), E = h.getUint32(20), T = i.length - 1, p = new Blob([c], { type: "image/png" }), s = createImageBitmap(p);
      i.push(s), a = Math.max(a, A), v = Math.max(v, E);
      const u = _.subarray(d, d + b), y = new DataView(u.buffer, u.byteOffset, u.byteLength);
      y.setUint32(0, T, !0), y.setUint32(4, A, !0), y.setUint32(8, E, !0);
    }
    // ... other functions
  }, C(fetch(new URL(\`\${e.baseURI}main.wasm\`)), o.importObject).then(async function(m) {
    r = m.instance, o.run(r);
    const x = t.createTexture();
    t.activeTexture(t.TEXTURE0), t.bindTexture(t.TEXTURE_2D_ARRAY, x), t.texParameteri(t.TEXTURE_2D_ARRAY, t.TEXTURE_MIN_FILTER, t.NEAREST), t.texParameteri(t.TEXTURE_2D_ARRAY, t.TEXTURE_MAG_FILTER, t.NEAREST), t.texImage3D(t.TEXTURE_2D_ARRAY, 0, t.RGBA8, a, v, i.length, 0, t.RGBA, t.UNSIGNED_BYTE, null), i = i.map((c, h) => c.then((A) => (t.texSubImage3D(t.TEXTURE_2D_ARRAY, 0, 0, 0, h, A.width, A.height, 1, t.RGBA, t.UNSIGNED_BYTE, A), A.close(), A))), await Promise.all(i), t.generateMipmap(t.TEXTURE_2D_ARRAY);
    const d = /* @__PURE__ */ new Map([
      ["a_model_matrix", "mat4"],
      ["a_texture_matrix", "mat4"],
      ["a_tint_color", "vec4"]
    ]), b = X(t, d);
    let _ = 0;
    const R = (c) => {
      const h = r.exports.update(c - _, t.canvas.clientWidth, t.canvas.clientHeight, e.mouseX, e.mouseY, e.mouseButtons), A = Number(h >> 32n), E = Number(h & 0xffffffffn), T = new Uint8Array(r.exports.memory.buffer, A, E), p = new Float32Array(T.buffer, T.byteOffset, w(d) / 4 * E);
      b(p), _ = c, requestAnimationFrame(R);
    };
    requestAnimationFrame(R);
  });
}
const f = {};
onmessage = (e) => {
  switch (e.data.type) {
    case "baseURI":
      f.baseURI = e.data.baseURI;
      break;
    case "canvas":
      Object.assign(f, {
        gl: e.data.canvas.getContext("webgl2", {
          alpha: !1,
          depth: !1,
          ...e.data.options
        }),
        mouseX: 0,
        mouseY: 0,
        mouseButtons: 0
      }), O(f);
      break;
    case "resize":
      f.gl.canvas.clientWidth = e.data.clientWidth, f.gl.canvas.clientHeight = e.data.clientHeight, globalThis.devicePixelRatio = e.data.devicePixelRatio;
      break;
    case "mousedown":
      f.mouseX = e.data.clientX, f.mouseY = e.data.clientY, f.mouseButtons = e.data.buttons;
      break;
    case "mousemove":
      f.mouseX = e.data.clientX, f.mouseY = e.data.clientY;
      break;
    case "mouseup":
      f.mouseX = e.data.clientX, f.mouseY = e.data.clientY, f.mouseButtons = e.data.buttons;
      break;
  }
};
`,p=typeof self<"u"&&self.Blob&&new Blob(["URL.revokeObjectURL(import.meta.url);",v],{type:"text/javascript;charset=utf-8"});function E(n){let a;try{if(a=p&&(self.URL||self.webkitURL).createObjectURL(p),!a)throw"";const o=new Worker(a,{type:"module",name:n?.name});return o.addEventListener("error",()=>{(self.URL||self.webkitURL).revokeObjectURL(a)}),o}catch{return new Worker("data:text/javascript;charset=utf-8,"+encodeURIComponent(v),{type:"module",name:n?.name})}}function y(n,a){if(n.style.width="100%",n.style.height="100%",n.style.display="block","OffscreenCanvas"in window&&"Worker"in window&&"ResizeObserver"in window){n.addEventListener("mousedown",e=>{e.preventDefault();const r=n.getBoundingClientRect();t.postMessage({type:"mousedown",clientX:e.clientX-r.left,clientY:e.clientY-r.top,buttons:e.buttons})}),n.addEventListener("mousemove",e=>{e.preventDefault();const r=n.getBoundingClientRect();t.postMessage({type:"mousemove",clientX:e.clientX-r.left,clientY:e.clientY-r.top})}),n.addEventListener("mouseup",e=>{e.preventDefault();const r=n.getBoundingClientRect();t.postMessage({type:"mouseup",clientX:e.clientX-r.left,clientY:e.clientY-r.top,buttons:e.buttons})}),n.addEventListener("touchstart",e=>{e.preventDefault();const r=n.getBoundingClientRect();t.postMessage({type:"mousedown",clientX:e.changedTouches[0].clientX-r.left,clientY:e.changedTouches[0].clientY-r.top,buttons:1})}),n.addEventListener("touchmove",e=>{e.preventDefault();const r=n.getBoundingClientRect();t.postMessage({type:"mousemove",clientX:e.changedTouches[0].clientX-r.left,clientY:e.changedTouches[0].clientY-r.top})}),n.addEventListener("touchend",e=>{e.preventDefault();const r=n.getBoundingClientRect();t.postMessage({type:"mouseup",clientX:e.changedTouches[0].clientX-r.left,clientY:e.changedTouches[0].clientY-r.top,buttons:0})});const o=n.transferControlToOffscreen(),t=new E;t.postMessage({type:"baseURI",baseURI:document.baseURI}),t.postMessage({type:"canvas",canvas:o,options:a},[o]),new ResizeObserver(()=>{t.postMessage({type:"resize",clientWidth:n.clientWidth,clientHeight:n.clientHeight,devicePixelRatio:window.devicePixelRatio})}).observe(n)}else{const o={gl:n.getContext("webgl2",{alpha:!1,depth:!1,...a}),baseURI:document.baseURI,mouseX:0,mouseY:0,mouseButtons:0};n.addEventListener("mousedown",t=>{t.preventDefault();const e=n.getBoundingClientRect();o.mouseX=t.clientX-e.left,o.mouseY=t.clientY-e.top,o.mouseButtons=t.buttons}),n.addEventListener("mousemove",t=>{t.preventDefault();const e=n.getBoundingClientRect();o.mouseX=t.clientX-e.left,o.mouseY=t.clientY-e.top}),n.addEventListener("mouseup",t=>{t.preventDefault();const e=n.getBoundingClientRect();o.mouseX=t.clientX-e.left,o.mouseY=t.clientY-e.top,o.mouseButtons=t.buttons}),n.addEventListener("touchstart",t=>{t.preventDefault();const e=n.getBoundingClientRect();o.mouseX=t.changedTouches[0].clientX-e.left,o.mouseY=t.changedTouches[0].clientY-e.top,o.mouseButtons=1}),n.addEventListener("touchmove",t=>{t.preventDefault();const e=n.getBoundingClientRect();o.mouseX=t.changedTouches[0].clientX-e.left,o.mouseY=t.changedTouches[0].clientY-e.top}),n.addEventListener("touchend",t=>{t.preventDefault();const e=n.getBoundingClientRect();o.mouseX=t.changedTouches[0].clientX-e.left,o.mouseY=t.changedTouches[0].clientY-e.top,o.mouseButtons=0}),A(async()=>{const{game:t}=await import("./game-DRV7D7fG-DDZw7Ft0.js");return{game:t}},[]).then(({game:t})=>{t(o)})}}document.querySelector("#app").innerHTML=`
  <canvas id="canvas"></canvas>
`;y(document.querySelector("#canvas"));
