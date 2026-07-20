package main

import (
	"embed"

	"github.com/bernhardfritz/two"
)

//go:embed resources/*
var ASSETS embed.FS

func init() {
	two.AddFileSystem(ASSETS)
}

func main() {
	topTexture := two.LoadTexture("resources/top.png")
	sideTexture := two.LoadTexture("resources/side.png")

	gameLoop := func() {
		two.ClearBackground(255, 255, 255, 255)
		cubeHeight := two.Height / 2
		// left side
		two.SetTransform(1, 0.5, 0, 1, two.Width/2-cubeHeight, cubeHeight/2)
		two.SetTintColor(204, 204, 204, 255)
		two.DrawTexture4f(sideTexture, 0, 0, cubeHeight, cubeHeight)
		// right side
		two.SetTransform(-1, 0.5, 0, 1, two.Width/2+cubeHeight, cubeHeight/2)
		two.SetTintColor(153, 153, 153, 255)
		two.DrawTexture8f(sideTexture, 0, 0, cubeHeight, cubeHeight, sideTexture.Width, 0, -sideTexture.Width, sideTexture.Height)
		// top
		two.SetTransform(1, 0.5, -1, 0.5, two.Width/2, 0)
		two.SetTintColor(255, 255, 255, 255)
		two.DrawTexture4f(topTexture, 0, 0, cubeHeight, cubeHeight)
	}

	two.SetGameLoop(gameLoop)
}
