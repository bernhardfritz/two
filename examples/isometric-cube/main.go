package main

import (
	"embed"

	fl "github.com/bernhardfritz/flatland"
)

//go:embed resources/*
var ASSETS embed.FS

func init() {
	fl.AddFileSystem(ASSETS)
}

func main() {
	topTexture := fl.LoadTexture("resources/top.png")
	sideTexture := fl.LoadTexture("resources/side.png")

	animate := func() {
		fl.ClearBackground(255, 255, 255, 255)
		cubeHeight := fl.Height / 2
		// left side
		fl.SetTransform(1, 0.5, 0, 1, fl.Width/2-cubeHeight, cubeHeight/2)
		fl.SetTintColor(204, 204, 204, 255)
		fl.DrawTexture4f(sideTexture, 0, 0, cubeHeight, cubeHeight)
		// right side
		fl.SetTransform(-1, 0.5, 0, 1, fl.Width/2+cubeHeight, cubeHeight/2)
		fl.SetTintColor(153, 153, 153, 255)
		fl.DrawTexture8f(sideTexture, 0, 0, cubeHeight, cubeHeight, sideTexture.Width, 0, -sideTexture.Width, sideTexture.Height)
		// top
		fl.SetTransform(1, 0.5, -1, 0.5, fl.Width/2, 0)
		fl.SetTintColor(255, 255, 255, 255)
		fl.DrawTexture4f(topTexture, 0, 0, cubeHeight, cubeHeight)
	}

	fl.SetAnimationLoop(animate)
}
