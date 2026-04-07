package main

import (
	"embed"
	"fmt"
	"math"
	"math/rand"

	"github.com/bernhardfritz/two"
)

const maxBatchElements = 8192

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
	font := two.LoadFont("resources/32px monospace.png")
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

			if ((b.Position.Y + float32(texture.Height/2)) > float32(height)) || ((b.Position.Y + float32(texture.Height/2-40)) < 0) {
				b.Speed.Y *= -1
			}
		}

		two.ClearBackground(255, 255, 255, 255)
		for _, b := range bunnies {
			two.SetTintColor(b.Color.R, b.Color.G, b.Color.B, b.Color.A)
			two.DrawTexture2f(texture, b.Position.X, b.Position.Y)
		}
		two.SetTintColor(0, 0, 0, 255)
		two.DrawRectangle(0, 0, float32(width), 40)
		two.SetTintColor(0, 228, 48, 255)
		two.DrawText(font, fmt.Sprintf("bunnies: %d", len(bunnies)), 120, 10, 20)
		two.SetTintColor(190, 33, 55, 255)
		two.DrawText(font, fmt.Sprintf("batched draw calls: %d", 1+len(bunnies)/maxBatchElements), 320, 10, 20)
		DrawFPS(font, deltaTime, 10, 10, 20)
	}

	two.SetGameLoop(update)
}

func randomFloat32(inclusive, exclusive float32) float32 {
	return inclusive + (exclusive-inclusive)*rand.Float32()
}

const FPS_CAPTURE_FRAMES_COUNT = 30 // 30 captures
var index int
var history [FPS_CAPTURE_FRAMES_COUNT]float64
var sum float64

func GetFPS(deltaTime float64) int {
	if deltaTime <= 0 {
		return 0
	}

	// 1. Convert ms to seconds
	seconds := deltaTime / 1000.0

	// 2. Update the rolling sum by removing the oldest value and adding the new one
	sum -= history[index]
	history[index] = seconds
	sum += seconds

	// 3. Move the pointer
	index = (index + 1) % FPS_CAPTURE_FRAMES_COUNT

	// 4. Avoid division by zero
	if sum <= 0 {
		return 0
	}

	// 5. FPS = Frames / Total Seconds
	return int(math.Round(float64(FPS_CAPTURE_FRAMES_COUNT) / sum))
}

func DrawFPS(font two.Font, deltaTime float64, x, y float32, size int) {
	fps := GetFPS(deltaTime)
	if 15 <= fps && fps < 30 {
		two.SetTintColor(255, 161, 0, 255)
	} else if fps < 15 {
		two.SetTintColor(230, 41, 55, 255)
	} else {
		two.SetTintColor(0, 158, 47, 255)
	}
	two.DrawText(font, fmt.Sprintf("%d FPS", fps), x, y, size)
}
