import './style.css';
import './WhiteRabbit.css';
import { flatland } from '@bernhardfritz/flatland';
import wasm from '../main.go';

document.querySelector('#app').innerHTML = `
  <canvas id="canvas"></canvas>
`

flatland(document.querySelector('#canvas'), wasm)
