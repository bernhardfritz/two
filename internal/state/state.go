package state

import "github.com/bernhardfritz/flatland/internal/linmath"

type PerInstanceData struct {
	ModelMatrix   linmath.Mat4
	TextureMatrix linmath.Mat4
	TintColor     linmath.Vec4
}

var (
	Instances        []PerInstanceData
	MaxTextureWidth  float64
	MaxTextureHeight float64
	AnimationLoop    func()
	TintColor        linmath.Vec4
	TransformMatrix  linmath.Mat4
)
