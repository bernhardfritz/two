import './style.css'
import { two } from '@bernhardfritz/two';

document.querySelector('#app').innerHTML = `
  <canvas id="canvas"></canvas>
`

two(document.querySelector('#canvas'))
