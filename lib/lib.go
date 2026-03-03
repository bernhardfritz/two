package lib

import (
	"io"
	"io/fs"
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
	modelMatrix   mat4x4
	textureMatrix mat4x4
	// textureIndex float32
	color vec4
}

type context struct {
	instances      []perInstanceData
	maxImageWidth  int
	maxImageHeight int
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
	mat4x4_translate(&t, dest.X+dest.Width/2-0.5*dest.Width, dest.Y-dest.Height/2-0.5*dest.Height, 0) // -0.5 * scale because quad is offset for the purpose of dual usage as uv coordinates
	mat4x4_mul(&instance.modelMatrix, r, s)
	mat4x4_mul(&instance.modelMatrix, t, instance.modelMatrix)
	mat4x4_identity(&instance.textureMatrix)
	// TODO modify textureMatrix based on parameters
	// However, consider if it would not make more sense to use an interface that is more like ctx.drawImage from browser web api
	instance.color[0] = float32(tint.R) / 255
	instance.color[1] = float32(tint.G) / 255
	instance.color[2] = float32(tint.B) / 255
	instance.color[3] = float32(tint.A) / 255
	ctx.instances = append(ctx.instances, instance)
}

type Image struct {
	ID     int
	Width  int
	Height int
}

func DrawImage(image Image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight float32) {
	instance := perInstanceData{}
	var identity mat4x4
	mat4x4_identity(&identity)
	var s mat4x4
	mat4x4_scale_aniso(&s, identity, dWidth, dHeight, 1)
	var t mat4x4
	mat4x4_translate(&t, dx+dWidth/2-0.5*dWidth, dy-dHeight/2-0.5*dHeight, 0) // -0.5 * scale because quad is offset for the purpose of dual usage as uv coordinates
	mat4x4_mul(&instance.modelMatrix, t, s)
	var s2 mat4x4
	mat4x4_scale_aniso(&s2, identity, sWidth/float32(ctx.maxImageWidth), sHeight/float32(ctx.maxImageHeight), 1)
	var t2 mat4x4
	mat4x4_translate(&t2, sx/float32(ctx.maxImageWidth), sy/float32(ctx.maxImageHeight), 0)
	mat4x4_mul(&instance.textureMatrix, t2, s2)
	ctx.instances = append(ctx.instances, instance)
}

func Next() uint64 {
	ret := uint64(uintptr(unsafe.Pointer(unsafe.SliceData(ctx.instances))))<<32 | uint64(len(ctx.instances))
	ctx.instances = ctx.instances[:0]

	return ret
}

//export writeFile
func writeFile(targetPath string, bytes []byte)

func AddFileSystem(efs fs.FS) {
	var files []string
	err := fs.WalkDir(efs, ".", func(path string, d fs.DirEntry, walkErr error) error {
		if walkErr != nil {
			return walkErr
		}
		if !d.IsDir() {
			files = append(files, path)
		}
		return nil
	})
	if err != nil {
		panic(err)
	}
	for _, targetPath := range files {
		f, _ := efs.Open(targetPath)
		goBytes, _ := io.ReadAll(f)
		writeFile(targetPath, goBytes)
	}
}

//export loadImage
func loadImage(fileName string, bytes []byte)

func littleEndianToUint32(bytes []byte) uint32 {
	return *(*uint32)(unsafe.Pointer(&bytes[0]))
}

func LoadImage(fileName string) Image {
	var bytes [12]byte
	loadImage(fileName, bytes[:])
	id := int(littleEndianToUint32(bytes[0:4]))
	width := int(littleEndianToUint32(bytes[4:8]))
	height := int(littleEndianToUint32(bytes[8:12]))
	if width > ctx.maxImageWidth {
		ctx.maxImageWidth = width
	}
	if height > ctx.maxImageHeight {
		ctx.maxImageHeight = height
	}
	println("max", ctx.maxImageWidth, ctx.maxImageHeight)

	return Image{
		ID:     id,
		Width:  width,
		Height: height,
	}
}
