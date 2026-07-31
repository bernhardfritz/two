import './style.css'
import { flatland as fl } from '@bernhardfritz/flatland';
import wasm from '../main.go';

document.querySelector('#app').innerHTML = `
  <canvas id="canvas"></canvas>
`

fl(document.querySelector('#canvas'), wasm)
