package main

import (
	"embed"

	fl "github.com/bernhardfritz/flatland"
)

const keyDataScale = 2
const offsetX = 16
const offsetY = 11

type KeyData struct {
	x      float64
	y      float64
	width  float64
	height float64
}

var keyMap = map[uint8]KeyData{
	fl.Backspace: {
		x:      468,
		y:      45,
		width:  72,
		height: 36,
	},
	fl.Tab: {
		x:      0,
		y:      81,
		width:  54,
		height: 36,
	},
	fl.Enter: {
		x:      459,
		y:      117,
		width:  81,
		height: 36,
	},
	fl.ShiftLeft: {
		x:      0,
		y:      153,
		width:  81,
		height: 36,
	},
	fl.ShiftRight: {
		x:      441,
		y:      153,
		width:  99,
		height: 36,
	},
	fl.ControlLeft: {
		x:      0,
		y:      189,
		width:  54,
		height: 36,
	},
	fl.ControlRight: {
		x:      486,
		y:      189,
		width:  54,
		height: 36,
	},
	fl.AltLeft: {
		x:      99,
		y:      189,
		width:  45,
		height: 36,
	},
	fl.AltRight: {
		x:      351,
		y:      189,
		width:  45,
		height: 36,
	},
	fl.Pause: {
		x:      792,
		y:      0,
		width:  36,
		height: 36,
	},
	fl.CapsLock: {
		x:      0,
		y:      117,
		width:  63,
		height: 36,
	},
	fl.Escape: {
		x:      0,
		y:      0,
		width:  36,
		height: 36,
	},
	fl.Space: {
		x:      144,
		y:      189,
		width:  207,
		height: 36,
	},
	fl.PageUp: {
		x:      630,
		y:      45,
		width:  36,
		height: 36,
	},
	fl.PageDown: {
		x:      630,
		y:      81,
		width:  36,
		height: 36,
	},
	fl.End: {
		x:      594,
		y:      81,
		width:  36,
		height: 36,
	},
	fl.Home: {
		x:      594,
		y:      45,
		width:  36,
		height: 36,
	},
	fl.ArrowLeft: {
		x:      558,
		y:      189,
		width:  36,
		height: 36,
	},
	fl.ArrowUp: {
		x:      594,
		y:      153,
		width:  36,
		height: 36,
	},
	fl.ArrowRight: {
		x:      630,
		y:      189,
		width:  36,
		height: 36,
	},
	fl.ArrowDown: {
		x:      594,
		y:      189,
		width:  36,
		height: 36,
	},
	fl.PrintScreen: {
		x:      720,
		y:      0,
		width:  36,
		height: 36,
	},
	fl.Insert: {
		x:      558,
		y:      45,
		width:  36,
		height: 36,
	},
	fl.Delete: {
		x:      558,
		y:      81,
		width:  36,
		height: 36,
	},
	fl.Digit0: {
		x:      360,
		y:      45,
		width:  36,
		height: 36,
	},
	fl.Digit1: {
		x:      36,
		y:      45,
		width:  36,
		height: 36,
	},
	fl.Digit2: {
		x:      72,
		y:      45,
		width:  36,
		height: 36,
	},
	fl.Digit3: {
		x:      108,
		y:      45,
		width:  36,
		height: 36,
	},
	fl.Digit4: {
		x:      144,
		y:      45,
		width:  36,
		height: 36,
	},
	fl.Digit5: {
		x:      180,
		y:      45,
		width:  36,
		height: 36,
	},
	fl.Digit6: {
		x:      216,
		y:      45,
		width:  36,
		height: 36,
	},
	fl.Digit7: {
		x:      252,
		y:      45,
		width:  36,
		height: 36,
	},
	fl.Digit8: {
		x:      288,
		y:      45,
		width:  36,
		height: 36,
	},
	fl.Digit9: {
		x:      324,
		y:      45,
		width:  36,
		height: 36,
	},
	fl.KeyA: {
		x:      63,
		y:      117,
		width:  36,
		height: 36,
	},
	fl.KeyB: {
		x:      225,
		y:      153,
		width:  36,
		height: 36,
	},
	fl.KeyC: {
		x:      153,
		y:      153,
		width:  36,
		height: 36,
	},
	fl.KeyD: {
		x:      135,
		y:      117,
		width:  36,
		height: 36,
	},
	fl.KeyE: {
		x:      126,
		y:      81,
		width:  36,
		height: 36,
	},
	fl.KeyF: {
		x:      171,
		y:      117,
		width:  36,
		height: 36,
	},
	fl.KeyG: {
		x:      207,
		y:      117,
		width:  36,
		height: 36,
	},
	fl.KeyH: {
		x:      243,
		y:      117,
		width:  36,
		height: 36,
	},
	fl.KeyI: {
		x:      306,
		y:      81,
		width:  36,
		height: 36,
	},
	fl.KeyJ: {
		x:      279,
		y:      117,
		width:  36,
		height: 36,
	},
	fl.KeyK: {
		x:      315,
		y:      117,
		width:  36,
		height: 36,
	},
	fl.KeyL: {
		x:      351,
		y:      117,
		width:  36,
		height: 36,
	},
	fl.KeyM: {
		x:      297,
		y:      153,
		width:  36,
		height: 36,
	},
	fl.KeyN: {
		x:      261,
		y:      153,
		width:  36,
		height: 36,
	},
	fl.KeyO: {
		x:      342,
		y:      81,
		width:  36,
		height: 36,
	},
	fl.KeyP: {
		x:      378,
		y:      81,
		width:  36,
		height: 36,
	},
	fl.KeyQ: {
		x:      54,
		y:      81,
		width:  36,
		height: 36,
	},
	fl.KeyR: {
		x:      162,
		y:      81,
		width:  36,
		height: 36,
	},
	fl.KeyS: {
		x:      99,
		y:      117,
		width:  36,
		height: 36,
	},
	fl.KeyT: {
		x:      198,
		y:      81,
		width:  36,
		height: 36,
	},
	fl.KeyU: {
		x:      270,
		y:      81,
		width:  36,
		height: 36,
	},
	fl.KeyV: {
		x:      189,
		y:      153,
		width:  36,
		height: 36,
	},
	fl.KeyW: {
		x:      90,
		y:      81,
		width:  36,
		height: 36,
	},
	fl.KeyX: {
		x:      117,
		y:      153,
		width:  36,
		height: 36,
	},
	fl.KeyY: {
		x:      234,
		y:      81,
		width:  36,
		height: 36,
	},
	fl.KeyZ: {
		x:      81,
		y:      153,
		width:  36,
		height: 36,
	},
	fl.MetaLeft: {
		x:      54,
		y:      189,
		width:  45,
		height: 36,
	},
	fl.MetaRight: {
		x:      396,
		y:      189,
		width:  45,
		height: 36,
	},
	fl.ContextMenu: {
		x:      441,
		y:      189,
		width:  45,
		height: 36,
	},
	fl.Numpad0: {
		x:      684,
		y:      189,
		width:  72,
		height: 36,
	},
	fl.Numpad1: {
		x:      684,
		y:      153,
		width:  36,
		height: 36,
	},
	fl.Numpad2: {
		x:      720,
		y:      153,
		width:  36,
		height: 36,
	},
	fl.Numpad3: {
		x:      756,
		y:      153,
		width:  36,
		height: 36,
	},
	fl.Numpad4: {
		x:      684,
		y:      117,
		width:  36,
		height: 36,
	},
	fl.Numpad5: {
		x:      720,
		y:      117,
		width:  36,
		height: 36,
	},
	fl.Numpad6: {
		x:      756,
		y:      117,
		width:  36,
		height: 36,
	},
	fl.Numpad7: {
		x:      684,
		y:      81,
		width:  36,
		height: 36,
	},
	fl.Numpad8: {
		x:      720,
		y:      81,
		width:  36,
		height: 36,
	},
	fl.Numpad9: {
		x:      756,
		y:      81,
		width:  36,
		height: 36,
	},
	fl.NumpadMultiply: {
		x:      756,
		y:      45,
		width:  36,
		height: 36,
	},
	fl.NumpadAdd: {
		x:      792,
		y:      81,
		width:  36,
		height: 72,
	},
	fl.NumpadSubtract: {
		x:      792,
		y:      45,
		width:  36,
		height: 36,
	},
	fl.NumpadDecimal: {
		x:      756,
		y:      189,
		width:  36,
		height: 36,
	},
	fl.NumpadDivide: {
		x:      720,
		y:      45,
		width:  36,
		height: 36,
	},
	fl.F1: {
		x:      54,
		y:      0,
		width:  36,
		height: 36,
	},
	fl.F2: {
		x:      90,
		y:      0,
		width:  36,
		height: 36,
	},
	fl.F3: {
		x:      126,
		y:      0,
		width:  36,
		height: 36,
	},
	fl.F4: {
		x:      162,
		y:      0,
		width:  36,
		height: 36,
	},
	fl.F5: {
		x:      225,
		y:      0,
		width:  36,
		height: 36,
	},
	fl.F6: {
		x:      261,
		y:      0,
		width:  36,
		height: 36,
	},
	fl.F7: {
		x:      297,
		y:      0,
		width:  36,
		height: 36,
	},
	fl.F8: {
		x:      333,
		y:      0,
		width:  36,
		height: 36,
	},
	fl.F9: {
		x:      396,
		y:      0,
		width:  36,
		height: 36,
	},
	fl.F10: {
		x:      432,
		y:      0,
		width:  36,
		height: 36,
	},
	fl.F11: {
		x:      468,
		y:      0,
		width:  36,
		height: 36,
	},
	fl.F12: {
		x:      504,
		y:      0,
		width:  36,
		height: 36,
	},
	fl.NumLock: {
		x:      684,
		y:      45,
		width:  36,
		height: 36,
	},
	fl.ScrollLock: {
		x:      756,
		y:      0,
		width:  36,
		height: 36,
	},
	fl.Semicolon: {
		x:      387,
		y:      117,
		width:  36,
		height: 36,
	},
	fl.Equal: {
		x:      432,
		y:      45,
		width:  36,
		height: 36,
	},
	fl.Comma: {
		x:      333,
		y:      153,
		width:  36,
		height: 36,
	},
	fl.Minus: {
		x:      396,
		y:      45,
		width:  36,
		height: 36,
	},
	fl.Period: {
		x:      369,
		y:      153,
		width:  36,
		height: 36,
	},
	fl.Slash: {
		x:      405,
		y:      153,
		width:  36,
		height: 36,
	},
	fl.Backquote: {
		x:      0,
		y:      45,
		width:  36,
		height: 36,
	},
	fl.BracketLeft: {
		x:      414,
		y:      81,
		width:  36,
		height: 36,
	},
	fl.Backslash: {
		x:      486,
		y:      81,
		width:  54,
		height: 36,
	},
	fl.BracketRight: {
		x:      450,
		y:      81,
		width:  36,
		height: 36,
	},
	fl.Quote: {
		x:      423,
		y:      117,
		width:  36,
		height: 36,
	},
}

//go:embed resources/*
var ASSETS embed.FS

func init() {
	fl.AddFileSystem(ASSETS)
}

func main() {
	keyboard := fl.LoadTexture("resources/keyboard.png")
	keyboardPressed := fl.LoadTexture("resources/keyboard-pressed.png")
	animate := func() {
		fl.ClearBackground(255, 255, 255, 255)
		scale := fl.Width / keyboard.Width
		fl.DrawTexture4f(keyboard, 0, 0, scale*keyboard.Width, scale*keyboard.Height)
		for key, keyData := range keyMap {
			if fl.IsKeyPressed(key) {
				highlightKey(keyboardPressed, keyData)
			}
		}
	}
	fl.SetAnimationLoop(animate)
}

func highlightKey(texture fl.Texture, keyData KeyData) {
	scale := keyDataScale * (fl.Width / texture.Width)
	fl.DrawTexture8f(texture, scale*(offsetX+keyData.x), scale*(offsetY+keyData.y), scale*keyData.width, scale*keyData.height, keyDataScale*(offsetX+keyData.x), keyDataScale*(offsetY+keyData.y), keyDataScale*keyData.width, keyDataScale*keyData.height)
}
