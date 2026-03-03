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
	println("adding two numbers:", add(2, 3)) // expecting 5
	// var image rl.Texture
	bunny = ctx.LoadImage("resources/wabbit_alpha.png")
	println("bunny", bunny.ID, bunny.Width, bunny.Height)
	raybunny = ctx.LoadImage("resources/raybunny.png")
	println("raybunny", raybunny.ID, raybunny.Width, raybunny.Height)

	// println(blah[0], blah[1], blah[2])
	// println(texture.Id, texture.Width, texture.Height)
	// mat4x4_identity(&modelMatrices[0])
	// mat4x4_identity(&modelMatrices[1])
	// mat4x4_translate_in_place(&modelMatrices[1], 1, 2, 3)
	select {}
}

//export update
func update(deltaTime float64) uint64 {
	// rl.DrawTexturePro(rl.Rectangle{X: 0, Y: 50, Width: 100, Height: 50}, 0, rl.Color{R: 255, G: 0, B: 128, A: 255})
	// rl.DrawTexturePro(rl.Rectangle{X: 150, Y: 100, Width: 50, Height: 100}, 0, rl.Color{R: 255, G: 128, B: 0, A: 255})
	ctx.DrawImage(bunny, 0, 0, float32(bunny.Width), float32(bunny.Height), 0, 0, float32(bunny.Width)*2, float32(bunny.Height)*2)
	ctx.DrawImage(raybunny, 0, 0, float32(raybunny.Width), float32(raybunny.Height), 150, 100, float32(raybunny.Width)*2, float32(raybunny.Height)*2)

	return ctx.Next()
}

//export add
func add(x, y int) int

//export multiply
func multiply(x, y int) int {
	return x * y
}

// func get_data_ptr() int {
// return unsafe.Slice((*byte)(unsafe.Pointer(&vertices[0])), get_data_len())
// return int(uintptr(unsafe.Pointer(&data[0])))
// return int(uintptr(unsafe.Pointer(&vertices[0])))
// 	return int(uintptr(unsafe.Pointer(&modelMatrices[0])))
// }

// func get_data_len() int {
// return len(data)
// return len(vertices) * int(unsafe.Sizeof(Vertex{}))
// 	return len(modelMatrices) * int(unsafe.Sizeof(mat4x4{}))
// }
