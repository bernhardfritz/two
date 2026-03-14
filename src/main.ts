import './style.css'
import { two } from './two.ts'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <canvas id="canvas"></canvas>
`

two(document.querySelector<HTMLCanvasElement>('#canvas')!)
