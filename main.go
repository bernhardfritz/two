package main

import (
	"embed"

	rl "github.com/bernhardfritz/renderer/lib"
)

//go:embed resources/wabbit_alpha.png
var ASSETS embed.FS

func init() {
	rl.AddFileSystem(ASSETS)
}

func main() {
	println("adding two numbers:", add(2, 3)) // expecting 5
	// var texture rl.Texture
	texture := rl.LoadTexture("resources/wabbit_alpha.png")
	println("texture", texture.ID, texture.Width, texture.Height)
	// println(blah[0], blah[1], blah[2])
	// println(texture.Id, texture.Width, texture.Height)
	// mat4x4_identity(&modelMatrices[0])
	// mat4x4_identity(&modelMatrices[1])
	// mat4x4_translate_in_place(&modelMatrices[1], 1, 2, 3)
	select {}
}

//export update
func update(deltaTime float64) uint64 {
	rl.DrawTexturePro(rl.Rectangle{X: 0, Y: 50, Width: 100, Height: 50}, 0, rl.Color{R: 255, G: 0, B: 128, A: 255})
	rl.DrawTexturePro(rl.Rectangle{X: 150, Y: 100, Width: 50, Height: 100}, 0, rl.Color{R: 255, G: 128, B: 0, A: 255})

	return rl.Next()
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
