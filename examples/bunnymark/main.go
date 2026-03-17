package main

import (
	"embed"
	"math/rand"

	"github.com/bernhardfritz/two"
)

type Vector2 struct {
	X, Y float32
}

type Color struct {
	R, G, B, A uint8
}

type Bunny struct {
	Position Vector2
	Speed    Vector2
	Color    Color
}

//go:embed resources/*
var ASSETS embed.FS

func init() {
	two.AddFileSystem(ASSETS)
}

func main() {
	texture := two.LoadTexture("resources/wabbit_alpha.png")
	bunnies := make([]*Bunny, 0)

	update := func(deltaTime float64, width, height, mouseX, mouseY, mouseButtons int) {
		if mouseButtons == 1 {
			// Create more bunnies
			for i := 0; i < 100; i++ {
				b := &Bunny{}
				b.Position.X = float32(mouseX)
				b.Position.Y = float32(mouseY)
				b.Speed.X = randomFloat32(-250, 250) / 60
				b.Speed.Y = randomFloat32(-250, 250) / 60
				b.Color.R = uint8(randomFloat32(50, 240))
				b.Color.G = uint8(randomFloat32(80, 240))
				b.Color.B = uint8(randomFloat32(100, 240))
				b.Color.A = 255

				bunnies = append(bunnies, b)
			}
		}

		// Update bunnies
		for _, b := range bunnies {
			b.Position.X += b.Speed.X
			b.Position.Y += b.Speed.Y

			if ((b.Position.X + float32(texture.Width/2)) > float32(width)) || ((b.Position.X + float32(texture.Width/2)) < 0) {
				b.Speed.X *= -1
			}

			if ((b.Position.Y + float32(texture.Height/2)) > float32(height)) || ((b.Position.Y + float32(texture.Height/2)) < 0) {
				b.Speed.Y *= -1
			}
		}

		two.ClearBackground(255, 255, 255, 255)
		for _, b := range bunnies {
			two.SetTintColor(b.Color.R, b.Color.G, b.Color.B, b.Color.A)
			two.DrawTexture2f(texture, b.Position.X, b.Position.Y)
		}
	}

	two.SetMainLoop(update)
}

func randomFloat32(inclusive, exclusive float32) float32 {
	return inclusive + (exclusive-inclusive)*rand.Float32()
}
