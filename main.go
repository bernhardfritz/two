package main

import (
	"embed"

	ctx "github.com/bernhardfritz/renderer/lib"
)

//go:embed resources/*
var ASSETS embed.FS
var bunny, raybunny ctx.Image

func init() {
	ctx.AddFileSystem(ASSETS)
}

func main() {
	bunny = ctx.LoadImage("resources/wabbit_alpha.png")
	println("bunny", bunny.ID, bunny.Width, bunny.Height)
	raybunny = ctx.LoadImage("resources/raybunny.png")
	println("raybunny", raybunny.ID, raybunny.Width, raybunny.Height)

	select {}
}

//export update
func update(deltaTime float64) uint64 {
	ctx.DrawImage(bunny, 0, 0, float32(bunny.Width), float32(bunny.Height), 0, 0, float32(bunny.Width)*2, float32(bunny.Height)*2)
	ctx.DrawImage(raybunny, 0, 0, float32(raybunny.Width), float32(raybunny.Height), 150, 100, float32(raybunny.Width)*2, float32(raybunny.Height)*2)

	return ctx.Next()
}
