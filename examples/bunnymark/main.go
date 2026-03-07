package main

import (
	"embed"

	TWO "github.com/bernhardfritz/two.go"
)

//go:embed resources/*
var ASSETS embed.FS

func init() {
	TWO.AddFileSystem(ASSETS)
}

func main() {
	bunny := TWO.LoadImage("resources/wabbit_alpha.png")
	println("bunny", bunny.ID, bunny.Width, bunny.Height)
	raybunny := TWO.LoadImage("resources/raybunny.png")
	println("raybunny", raybunny.ID, raybunny.Width, raybunny.Height)

	update := func(deltaTime float64) {
		TWO.DrawImage2f(bunny, 0, 0)
		TWO.DrawImage2f(raybunny, 150, 100)
	}

	TWO.SetMainLoop(update)
}
