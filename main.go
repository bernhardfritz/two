package main

import "unsafe"

type perInstanceData struct {
	modelMatrix mat4x4
	// textureIndex float32
}

func main() {
	println("adding two numbers:", add(2, 3)) // expecting 5
	// mat4x4_identity(&modelMatrices[0])
	// mat4x4_identity(&modelMatrices[1])
	// mat4x4_translate_in_place(&modelMatrices[1], 1, 2, 3)
	select {}
}

var instances []perInstanceData

//export update
func update(deltaTime float64) uint64 {
	instances = instances[:0]
	instance1 := perInstanceData{}
	mat4x4_identity(&instance1.modelMatrix)
	mat4x4_translate_in_place(&instance1.modelMatrix, -0.5, -0.5, 0)
	// instance1.textureIndex = 42
	instances = append(instances, instance1)
	instance2 := perInstanceData{}
	mat4x4_identity(&instance2.modelMatrix)
	// instance2.textureIndex = 43
	instances = append(instances, instance2)

	if instances == nil {
		return 0
	}

	return uint64(uintptr(unsafe.Pointer(&instances[0])))<<32 | uint64(len(instances))
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
