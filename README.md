<img src="./gamer.svg" alt="Gopher holding a gamepad" width="256" align="right">

# two

[![Go Reference](https://pkg.go.dev/badge/github.com/bernhardfritz/two.svg)](https://pkg.go.dev/github.com/bernhardfritz/two)

2D graphics library for Go. Targets the web using WASM and WebGL. Offers containerized development setup.\
The API is minimalistic by design. Familiarity with web technologies is not required to use this library.

[Examples](https://pkg.go.dev/github.com/bernhardfritz/two/examples) | [Docs](https://pkg.go.dev/github.com/bernhardfritz/two)

## Usage

This code produces a bouncing DVD logo. The main function loads an embedded texture and initializes some variables. A game loop function is passed to `two.SetGameLoop()` which blocks the main thread and calls the function in an endless loop once per frame. The game loop is where we render and update the scene. In this case we clear the background with a black color and set a tint color that is applied when drawing textures or rectangles. The remaining code ensures the bouncing logo stays within the bounds of the frame producing the iconic 2000s DVD player screensaver.

```go
package main

import (
	"embed"
	"image/color"
	"math/rand/v2"

	"github.com/bernhardfritz/two"
)

type Vec2 struct {
	X float64
	Y float64
}

func randomColor() color.RGBA {
	return color.RGBA{uint8(rand.Uint32()), uint8(rand.Uint32()), uint8(rand.Uint32()), 255}
}

//go:embed resources/*
var ASSETS embed.FS

func init() {
	two.AddFileSystem(ASSETS)
}

func main() {
	dvdLogo := two.LoadTexture("resources/DVD_video_logo.png")
	position := Vec2{0, 0}
	velocity := Vec2{0.2, 0.2}
	color := randomColor()

	gameLoop := func() {
		two.ClearBackground(0, 0, 0, 255)
		two.SetTintColor(color.R, color.G, color.B, color.A)
		two.DrawTexture2f(dvdLogo, position.X, position.Y)

		position.X += velocity.X * two.DeltaTime
		position.Y += velocity.Y * two.DeltaTime

		if position.X+dvdLogo.Width >= two.Width {
			velocity.X = -velocity.X
			position.X = two.Width - dvdLogo.Width
			color = randomColor()
		} else if position.X <= 0 {
			velocity.X = -velocity.X
			position.X = 0
			color = randomColor()
		}

		if position.Y+dvdLogo.Height >= two.Height {
			velocity.Y = -velocity.Y
			position.Y = two.Height - dvdLogo.Height
			color = randomColor()
		} else if position.Y <= 0 {
			velocity.Y = -velocity.Y
			position.Y = 0
			color = randomColor()
		}
	}

	two.SetGameLoop(gameLoop)
}
```
