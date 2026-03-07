package main

import (
	"embed"

	TWO "github.com/bernhardfritz/two.go"
)

//go:embed resources/*
var ASSETS embed.FS
var bunny, raybunny TWO.Image

func init() {
	TWO.AddFileSystem(ASSETS)
}

func main() {
	bunny = TWO.LoadImage("resources/wabbit_alpha.png")
	println("bunny", bunny.ID, bunny.Width, bunny.Height)
	raybunny = TWO.LoadImage("resources/raybunny.png")
	println("raybunny", raybunny.ID, raybunny.Width, raybunny.Height)

	select {}
}

//export update
func update(deltaTime float64) uint64 {
	TWO.DrawImage(bunny, 0, 0, float32(bunny.Width), float32(bunny.Height), 0, 0, float32(bunny.Width)*2, float32(bunny.Height)*2)
	TWO.DrawImage(raybunny, 0, 0, float32(raybunny.Width), float32(raybunny.Height), 150, 100, float32(raybunny.Width)*2, float32(raybunny.Height)*2)

	return TWO.Next()
}
