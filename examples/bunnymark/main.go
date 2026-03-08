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
	bunny := two.LoadTexture("resources/wabbit_alpha.png")
	println("bunny", bunny.ID, bunny.Width, bunny.Height)
	raybunny := two.LoadTexture("resources/raybunny.png")
	println("raybunny", raybunny.ID, raybunny.Width, raybunny.Height)

	update := func(deltaTime float64) {
		two.DrawTexture2f(bunny, 0, 0)
		two.DrawTexture2f(raybunny, 150, 100)
	}

	two.SetMainLoop(update)
}
