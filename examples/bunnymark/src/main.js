import './style.css'
import { two } from '@bernhardfritz/two';
import wasm from '../main.go';

document.querySelector('#app').innerHTML = `
  <canvas id="canvas"></canvas>
`

two(document.querySelector('#canvas'), wasm)
