package main

import (
	"embed"
	"fmt"
	"math"
	"math/rand"

	fl "github.com/bernhardfritz/flatland"
)

const maxBatchElements = 8192

type Vector2 struct {
	X, Y float64
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
	fl.AddFileSystem(ASSETS)
}

func main() {
	texture := fl.LoadTexture("resources/wabbit_alpha.png")
	font := fl.LoadFont("20px monospace")
	bunnies := make([]*Bunny, 0)

	animate := func() {
		if fl.IsMouseButtonPressed(fl.MouseButtonLeft) {
			// Create more bunnies
			for i := 0; i < 100; i++ {
				b := &Bunny{}
				b.Position.X = fl.MouseX
				b.Position.Y = fl.MouseY
				b.Speed.X = randomFloat64(-250, 250) / 60
				b.Speed.Y = randomFloat64(-250, 250) / 60
				b.Color.R = uint8(randomFloat64(50, 240))
				b.Color.G = uint8(randomFloat64(80, 240))
				b.Color.B = uint8(randomFloat64(100, 240))
				b.Color.A = 255

				bunnies = append(bunnies, b)
			}
		}

		// Update bunnies
		for _, b := range bunnies {
			b.Position.X += b.Speed.X
			b.Position.Y += b.Speed.Y

			if ((b.Position.X + texture.Width/2) > fl.Width) || ((b.Position.X + texture.Width/2) < 0) {
				b.Speed.X *= -1
			}

			if ((b.Position.Y + texture.Height/2) > fl.Height) || ((b.Position.Y + texture.Height/2 - 40) < 0) {
				b.Speed.Y *= -1
			}
		}

		fl.ClearBackground(255, 255, 255, 255)
		for _, b := range bunnies {
			fl.SetTintColor(b.Color.R, b.Color.G, b.Color.B, b.Color.A)
			fl.DrawTexture2f(texture, b.Position.X, b.Position.Y)
		}
		fl.SetTintColor(0, 0, 0, 255)
		fl.DrawRectangle(0, 0, fl.Width, 40)
		fl.SetTintColor(0, 228, 48, 255)
		fl.DrawText(font, fmt.Sprintf("bunnies: %d", len(bunnies)), 120, 10)
		fl.SetTintColor(190, 33, 55, 255)
		fl.DrawText(font, fmt.Sprintf("batched draw calls: %d", 1+len(bunnies)/maxBatchElements), 320, 10)
		DrawFPS(font, 10, 10)
	}

	fl.SetAnimationLoop(animate)
}

func randomFloat64(inclusive, exclusive float64) float64 {
	return inclusive + (exclusive-inclusive)*rand.Float64()
}

const FPS_CAPTURE_FRAMES_COUNT = 30 // 30 captures
var index int
var history [FPS_CAPTURE_FRAMES_COUNT]float64
var sum float64

func GetFPS() int {
	if fl.DeltaTime <= 0 {
		return 0
	}

	// 1. Convert ms to seconds
	seconds := fl.DeltaTime / 1000.0

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
	return int(math.Round(FPS_CAPTURE_FRAMES_COUNT / sum))
}

func DrawFPS(font fl.Font, x, y float64) {
	fps := GetFPS()
	if 15 <= fps && fps < 30 {
		fl.SetTintColor(255, 161, 0, 255)
	} else if fps < 15 {
		fl.SetTintColor(230, 41, 55, 255)
	} else {
		fl.SetTintColor(0, 158, 47, 255)
	}
	fl.DrawText(font, fmt.Sprintf("%d FPS", fps), x, y)
}
