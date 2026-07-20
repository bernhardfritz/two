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
