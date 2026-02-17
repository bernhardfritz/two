package lib

import (
	"math"
	"unsafe"
)

type Vector2 struct {
	x, y float32
}

type Rectangle struct {
	X, Y, Width, Height float32
}

type Color struct {
	R, G, B, A uint8
}

type perInstanceData struct {
	modelMatrix mat4x4
	// textureIndex float32
	color vec4
}

type context struct {
	instances []perInstanceData
}

var ctx context

func DrawTexturePro(dest Rectangle, rotation float32, tint Color) {
	instance := perInstanceData{}
	mat4x4_identity(&instance.modelMatrix)
	var identity mat4x4
	mat4x4_identity(&identity)
	var s mat4x4
	mat4x4_scale_aniso(&s, identity, dest.Width, dest.Height, 1)
	var r mat4x4
	mat4x4_rotate_Z(&r, identity, rotation*math.Pi/180)
	var t mat4x4
	mat4x4_translate(&t, dest.X+dest.Width/2, dest.Y-dest.Height/2, 0)
	mat4x4_mul(&instance.modelMatrix, r, s)
	mat4x4_mul(&instance.modelMatrix, t, instance.modelMatrix)
	instance.color[0] = float32(tint.R) / 255
	instance.color[1] = float32(tint.G) / 255
	instance.color[2] = float32(tint.B) / 255
	instance.color[3] = float32(tint.A) / 255
	ctx.instances = append(ctx.instances, instance)
}

func Next() uint64 {
	ret := uint64(uintptr(unsafe.Pointer(unsafe.SliceData(ctx.instances))))<<32 | uint64(len(ctx.instances))
	ctx.instances = ctx.instances[:0]

	return ret
}
