(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))t(e);new MutationObserver(e=>{for(const o of e)if(o.type==="childList")for(const m of o.addedNodes)m.tagName==="LINK"&&m.rel==="modulepreload"&&t(m)}).observe(document,{childList:!0,subtree:!0});function r(e){const o={};return e.integrity&&(o.integrity=e.integrity),e.referrerPolicy&&(o.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?o.credentials="include":e.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function t(e){if(e.ep)return;e.ep=!0;const o=r(e);fetch(e.href,o)}})();const b="modulepreload",R=function(n){return"/two/"+n},h={},A=function(a,r,t){let e=Promise.resolve();if(r&&r.length>0){let f=function(i){return Promise.all(i.map(l=>Promise.resolve(l).then(d=>({status:"fulfilled",value:d}),d=>({status:"rejected",reason:d}))))};var m=f;document.getElementsByTagName("link");const u=document.querySelector("meta[property=csp-nonce]"),s=u?.nonce||u?.getAttribute("nonce");e=f(r.map(i=>{if(i=R(i),i in h)return;h[i]=!0;const l=i.endsWith(".css"),d=l?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${i}"]${d}`))return;const c=document.createElement("link");if(c.rel=l?"stylesheet":b,l||(c.as="script"),c.crossOrigin="",c.href=i,s&&c.setAttribute("nonce",s),document.head.appendChild(c),l)return new Promise((g,_)=>{c.addEventListener("load",g),c.addEventListener("error",()=>_(new Error(`Unable to preload CSS for ${i}`)))})}))}function o(u){const s=new Event("vite:preloadError",{cancelable:!0});if(s.payload=u,window.dispatchEvent(s),!s.defaultPrevented)throw u}return e.then(u=>{for(const s of u||[])s.status==="rejected"&&o(s.reason);return a().catch(o)})},v=`const I = \`#version 300 es

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
\`, F = \`#version 300 es

// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
precision highp float;
precision lowp sampler2DArray;

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
  const a = e.createShader(t);
  if (a === null)
    throw new Error("Couldn't create shader!");
  if (e.shaderSource(a, o), e.compileShader(a), !e.getShaderParameter(a, e.COMPILE_STATUS)) {
    const i = e.getShaderInfoLog(a);
    throw e.deleteShader(a), new Error(i ?? "");
  }
  return a;
}
function Y(e, t, o) {
  const a = e.createProgram();
  if (e.attachShader(a, t), e.attachShader(a, o), e.linkProgram(a), !e.getProgramParameter(a, e.LINK_STATUS)) {
    const i = e.getProgramInfoLog(a);
    throw e.deleteProgram(a), new Error(i ?? "");
  }
  return a;
}
const y = {
  vec4: Float32Array.BYTES_PER_ELEMENT * 4,
  mat4: Float32Array.BYTES_PER_ELEMENT * 16
};
function l(e) {
  let t = 0;
  for (const [o, a] of e)
    t += y[a];
  return t;
}
function U(e, t) {
  let o = 0;
  for (const [a, n] of e) {
    if (a === t)
      break;
    o += y[n];
  }
  return o;
}
function P(e, t) {
  t = t || 1;
  const o = e.clientWidth * t | 0, a = e.clientHeight * t | 0;
  return e.width !== o || e.height !== a ? (e.width = o, e.height = a, !0) : !1;
}
function N(e, t, o, a, n, i, r) {
  return r = r || new Float32Array(16), r[0] = 2 / (t - e), r[1] = 0, r[2] = 0, r[3] = 0, r[4] = 0, r[5] = 2 / (a - o), r[6] = 0, r[7] = 0, r[8] = 0, r[9] = 0, r[10] = 2 / (n - i), r[11] = 0, r[12] = (e + t) / (e - t), r[13] = (o + a) / (o - a), r[14] = (n + i) / (n - i), r[15] = 1, r;
}
function X(e, t) {
  const o = S(e, e.VERTEX_SHADER, I), a = S(e, e.FRAGMENT_SHADER, F), n = Y(e, o, a), i = e.getAttribLocation(n, "a_position"), r = e.getAttribLocation(n, "a_model_matrix"), E = e.getAttribLocation(n, "a_texture_matrix"), f = e.getAttribLocation(n, "a_tint_color"), R = e.getUniformLocation(n, "u_projection"), A = e.getUniformLocation(n, "u_texture"), b = e.createVertexArray();
  e.bindVertexArray(b);
  const d = e.createBuffer();
  e.bindBuffer(e.ARRAY_BUFFER, d);
  const x = [
    0,
    0,
    1,
    0,
    0,
    1,
    1,
    1
  ];
  e.bufferData(e.ARRAY_BUFFER, new Float32Array(x), e.STATIC_DRAW), e.enableVertexAttribArray(i);
  const c = 2, h = e.FLOAT;
  e.vertexAttribPointer(
    i,
    c,
    h,
    !1,
    0,
    0
  );
  const v = e.createBuffer();
  e.bindBuffer(e.ARRAY_BUFFER, v), e.bufferData(e.ARRAY_BUFFER, 0, e.DYNAMIC_DRAW);
  for (let s = 0; s < 4; s++) {
    const u = r + s;
    e.enableVertexAttribArray(u), e.vertexAttribPointer(u, 4, e.FLOAT, !1, l(t), U(t, "a_model_matrix") + s * y.vec4), e.vertexAttribDivisor(u, 1);
  }
  for (let s = 0; s < 4; s++) {
    const u = E + s;
    e.enableVertexAttribArray(u), e.vertexAttribPointer(u, 4, e.FLOAT, !1, l(t), U(t, "a_texture_matrix") + s * y.vec4), e.vertexAttribDivisor(u, 1);
  }
  return e.enableVertexAttribArray(f), e.vertexAttribPointer(f, 4, e.FLOAT, !1, l(t), U(t, "a_tint_color")), e.vertexAttribDivisor(f, 1), e.enable(e.BLEND), e.blendFunc(e.SRC_ALPHA, e.ONE_MINUS_SRC_ALPHA), (s) => {
    P(e.canvas, globalThis.devicePixelRatio), e.viewport(0, 0, e.canvas.width, e.canvas.height), e.useProgram(n);
    const u = N(0, e.canvas.clientWidth, e.canvas.clientHeight, 0, -1, 1);
    e.uniformMatrix4fv(
      R,
      !1,
      u
    ), e.uniform1i(A, 0), e.bindVertexArray(b), e.bindBuffer(e.ARRAY_BUFFER, v), e.bufferData(e.ARRAY_BUFFER, s, e.DYNAMIC_DRAW);
    const w = e.TRIANGLE_STRIP, L = 0, D = 4, B = s.length;
    e.drawArraysInstanced(w, L, D, B);
  };
}
const M = WebAssembly.instantiateStreaming || (async (e, t) => {
  const o = await (await e).arrayBuffer();
  return await WebAssembly.instantiate(o, t);
});
async function C(e) {
  const t = e.gl;
  await import(new URL(\`\${e.baseURI}wasm_exec.js\`).href);
  const o = new Go();
  let a;
  const n = {};
  let i = [createImageBitmap(new ImageData(new Uint8ClampedArray([255, 255, 255, 255]), 1, 1))], r = 1, E = 1;
  o.importObject.env = {
    writeFile: function(f, R, A, b) {
      const d = new Uint8Array(a.exports.memory.buffer), x = new TextDecoder().decode(d.subarray(f, f + R)), c = d.subarray(A, A + b);
      n[x] = c;
    },
    loadTexture: function(f, R, A, b) {
      const d = new Uint8Array(a.exports.memory.buffer), x = new TextDecoder().decode(d.subarray(f, f + R)), c = n[x], h = new DataView(c.buffer, c.byteOffset, c.byteLength), _ = h.getUint32(16), p = h.getUint32(20), T = i.length - 1, v = new Blob([c], { type: "image/png" }), s = createImageBitmap(v);
      i.push(s), r = Math.max(r, _), E = Math.max(E, p);
      const u = d.subarray(A, A + b), w = new DataView(u.buffer, u.byteOffset, u.byteLength);
      w.setUint32(0, T, !0), w.setUint32(4, _, !0), w.setUint32(8, p, !0);
    }
    // ... other functions
  }, M(fetch(new URL(\`\${e.baseURI}main.wasm\`)), o.importObject).then(async function(f) {
    a = f.instance, o.run(a);
    const R = t.createTexture();
    t.activeTexture(t.TEXTURE0), t.bindTexture(t.TEXTURE_2D_ARRAY, R), t.texParameteri(t.TEXTURE_2D_ARRAY, t.TEXTURE_MIN_FILTER, t.NEAREST), t.texParameteri(t.TEXTURE_2D_ARRAY, t.TEXTURE_MAG_FILTER, t.NEAREST), t.texImage3D(t.TEXTURE_2D_ARRAY, 0, t.RGBA8, r, E, i.length, 0, t.RGBA, t.UNSIGNED_BYTE, null), i = i.map((c, h) => c.then((_) => (t.texSubImage3D(t.TEXTURE_2D_ARRAY, 0, 0, 0, h, _.width, _.height, 1, t.RGBA, t.UNSIGNED_BYTE, _), _.close(), _))), await Promise.all(i), t.generateMipmap(t.TEXTURE_2D_ARRAY);
    const A = /* @__PURE__ */ new Map([
      ["a_model_matrix", "mat4"],
      ["a_texture_matrix", "mat4"],
      ["a_tint_color", "vec4"]
    ]), b = X(t, A);
    let d = 0;
    const x = (c) => {
      const h = a.exports.update(c - d, t.canvas.clientWidth, t.canvas.clientHeight, e.mouseX, e.mouseY, e.mouseButtons), _ = Number(h >> 32n), p = Number(h & 0xffffffffn), T = new Uint8Array(a.exports.memory.buffer, _, p), v = new Float32Array(T.buffer, T.byteOffset, l(A) / 4 * p);
      b(v), d = c, requestAnimationFrame(x);
    };
    requestAnimationFrame(x);
  });
}
const m = {};
onmessage = (e) => {
  switch (e.data.type) {
    case "baseURI":
      m.baseURI = e.data.baseURI;
      break;
    case "canvas":
      Object.assign(m, {
        gl: e.data.canvas.getContext("webgl2", {
          alpha: !1,
          depth: !1,
          ...e.data.options
        }),
        mouseX: 0,
        mouseY: 0,
        mouseButtons: 0
      }), C(m);
      break;
    case "resize":
      m.gl.canvas.clientWidth = e.data.clientWidth, m.gl.canvas.clientHeight = e.data.clientHeight, globalThis.devicePixelRatio = e.data.devicePixelRatio;
      break;
    case "mousedown":
      m.mouseX = e.data.clientX, m.mouseY = e.data.clientY, m.mouseButtons = e.data.buttons;
      break;
    case "mousemove":
      m.mouseX = e.data.clientX, m.mouseY = e.data.clientY;
      break;
    case "mouseup":
      m.mouseX = e.data.clientX, m.mouseY = e.data.clientY, m.mouseButtons = e.data.buttons;
      break;
  }
};
`,p=typeof self<"u"&&self.Blob&&new Blob(["URL.revokeObjectURL(import.meta.url);",v],{type:"text/javascript;charset=utf-8"});function E(n){let a;try{if(a=p&&(self.URL||self.webkitURL).createObjectURL(p),!a)throw"";const r=new Worker(a,{type:"module",name:n?.name});return r.addEventListener("error",()=>{(self.URL||self.webkitURL).revokeObjectURL(a)}),r}catch{return new Worker("data:text/javascript;charset=utf-8,"+encodeURIComponent(v),{type:"module",name:n?.name})}}function w(n,a){if(n.style.width="100%",n.style.height="100%",n.style.display="block","OffscreenCanvas"in window&&"Worker"in window&&"ResizeObserver"in window){n.addEventListener("mousedown",e=>{e.preventDefault();const o=n.getBoundingClientRect();t.postMessage({type:"mousedown",clientX:e.clientX-o.left,clientY:e.clientY-o.top,buttons:e.buttons})}),n.addEventListener("mousemove",e=>{e.preventDefault();const o=n.getBoundingClientRect();t.postMessage({type:"mousemove",clientX:e.clientX-o.left,clientY:e.clientY-o.top})}),n.addEventListener("mouseup",e=>{e.preventDefault();const o=n.getBoundingClientRect();t.postMessage({type:"mouseup",clientX:e.clientX-o.left,clientY:e.clientY-o.top,buttons:e.buttons})}),n.addEventListener("touchstart",e=>{e.preventDefault();const o=n.getBoundingClientRect();t.postMessage({type:"mousedown",clientX:e.changedTouches[0].clientX-o.left,clientY:e.changedTouches[0].clientY-o.top,buttons:1})}),n.addEventListener("touchmove",e=>{e.preventDefault();const o=n.getBoundingClientRect();t.postMessage({type:"mousemove",clientX:e.changedTouches[0].clientX-o.left,clientY:e.changedTouches[0].clientY-o.top})}),n.addEventListener("touchend",e=>{e.preventDefault();const o=n.getBoundingClientRect();t.postMessage({type:"mouseup",clientX:e.changedTouches[0].clientX-o.left,clientY:e.changedTouches[0].clientY-o.top,buttons:0})});const r=n.transferControlToOffscreen(),t=new E;t.postMessage({type:"baseURI",baseURI:document.baseURI}),t.postMessage({type:"canvas",canvas:r,options:a},[r]),new ResizeObserver(()=>{t.postMessage({type:"resize",clientWidth:n.clientWidth,clientHeight:n.clientHeight,devicePixelRatio:window.devicePixelRatio})}).observe(n)}else{const r={gl:n.getContext("webgl2",{alpha:!1,depth:!1,...a}),baseURI:document.baseURI,mouseX:0,mouseY:0,mouseButtons:0};n.addEventListener("mousedown",t=>{t.preventDefault();const e=n.getBoundingClientRect();r.mouseX=t.clientX-e.left,r.mouseY=t.clientY-e.top,r.mouseButtons=t.buttons}),n.addEventListener("mousemove",t=>{t.preventDefault();const e=n.getBoundingClientRect();r.mouseX=t.clientX-e.left,r.mouseY=t.clientY-e.top}),n.addEventListener("mouseup",t=>{t.preventDefault();const e=n.getBoundingClientRect();r.mouseX=t.clientX-e.left,r.mouseY=t.clientY-e.top,r.mouseButtons=t.buttons}),n.addEventListener("touchstart",t=>{t.preventDefault();const e=n.getBoundingClientRect();r.mouseX=t.changedTouches[0].clientX-e.left,r.mouseY=t.changedTouches[0].clientY-e.top,r.mouseButtons=1}),n.addEventListener("touchmove",t=>{t.preventDefault();const e=n.getBoundingClientRect();r.mouseX=t.changedTouches[0].clientX-e.left,r.mouseY=t.changedTouches[0].clientY-e.top}),n.addEventListener("touchend",t=>{t.preventDefault();const e=n.getBoundingClientRect();r.mouseX=t.changedTouches[0].clientX-e.left,r.mouseY=t.changedTouches[0].clientY-e.top,r.mouseButtons=0}),A(async()=>{const{game:t}=await import("./game-C1xw-_Hs-CggCQfwq.js");return{game:t}},[]).then(({game:t})=>{t(r)})}}document.querySelector("#app").innerHTML=`
  <canvas id="canvas"></canvas>
`;w(document.querySelector("#canvas"));
