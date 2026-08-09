# flatland

<a href="https://pkg.go.dev/github.com/bernhardfritz/flatland"><img src="./gamer.svg" alt="Gopher holding a gamepad" width="128" align="right"></a>

[![Go Reference](https://pkg.go.dev/badge/github.com/bernhardfritz/flatland.svg)](https://pkg.go.dev/github.com/bernhardfritz/flatland)
[![NPM Version](https://img.shields.io/npm/v/%40bernhardfritz%2Fflatland)](https://www.npmjs.com/package/@bernhardfritz/flatland)

2D graphics library for Go. Targets the web using WASM and WebGL. Offers containerized development setup.\
The API is minimalistic by design. Familiarity with web technologies is not required to use this library.

[Examples](https://pkg.go.dev/github.com/bernhardfritz/flatland/examples) | [Docs](https://pkg.go.dev/github.com/bernhardfritz/flatland) | [Start from template](https://github.com/bernhardfritz/flatland-template/generate)

## Usage

This code produces a bouncing DVD logo. The main function loads an embedded texture and initializes some variables. An animation function is passed to `fl.SetAnimationLoop()` which blocks the main thread and calls the function in an endless loop once per frame. The animation loop is where we render and update the scene. In this case we clear the background with a black color and set a tint color that is applied when drawing textures or rectangles. The remaining code ensures the bouncing logo stays within the bounds of the frame producing the iconic 2000s DVD player screensaver.

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/bernhardfritz/flatland-template?quickstart=1)

```go
package main

import (
	"embed"
	"image/color"
	"math/rand/v2"

	fl "github.com/bernhardfritz/flatland"
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
	fl.AddFileSystem(ASSETS)
}

func main() {
	dvdLogo := fl.LoadTexture("resources/DVD_video_logo.png")
	position := Vec2{0, 0}
	velocity := Vec2{0.2, 0.2}
	color := randomColor()

	animate := func() {
		fl.ClearBackground(0, 0, 0, 255)
		fl.SetTintColor(color.R, color.G, color.B, color.A)
		fl.DrawTexture2f(dvdLogo, position.X, position.Y)

		position.X += velocity.X * fl.DeltaTime
		position.Y += velocity.Y * fl.DeltaTime

		if position.X+dvdLogo.Width >= fl.Width {
			velocity.X = -velocity.X
			position.X = fl.Width - dvdLogo.Width
			color = randomColor()
		} else if position.X <= 0 {
			velocity.X = -velocity.X
			position.X = 0
			color = randomColor()
		}

		if position.Y+dvdLogo.Height >= fl.Height {
			velocity.Y = -velocity.Y
			position.Y = fl.Height - dvdLogo.Height
			color = randomColor()
		} else if position.Y <= 0 {
			velocity.Y = -velocity.Y
			position.Y = 0
			color = randomColor()
		}
	}

	fl.SetAnimationLoop(animate)
}
```
