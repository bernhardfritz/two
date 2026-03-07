package lib

import (
	"io"
	"io/fs"
	"unsafe"
)

type perInstanceData struct {
	modelMatrix   mat4x4
	textureMatrix mat4x4
	color         vec4
}

type context struct {
	instances      []perInstanceData
	maxImageWidth  int
	maxImageHeight int
}

var ctx context

type Image struct {
	ID     int
	Width  int
	Height int
}

func DrawImage(image Image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight float32) {
	instance := perInstanceData{}
	{
		var t1 mat4x4
		mat4x4_translate(&t1, -0.5, -0.5, 0) // -0.5 to compensate because quad is offset for the purpose of dual usage as uv coordinates
		var s mat4x4
		mat4x4_scale_aniso(&s, t1, dWidth, dHeight, 1)
		var t2 mat4x4
		mat4x4_translate(&t2, dx, dy, 0)
		mat4x4_mul(&instance.modelMatrix, t2, s)
	}
	{
		var identity mat4x4
		mat4x4_identity(&identity)
		var s mat4x4
		mat4x4_scale_aniso(&s, identity, sWidth/float32(ctx.maxImageWidth), sHeight/float32(ctx.maxImageHeight), 1)
		var t mat4x4
		mat4x4_translate(&t, sx/float32(ctx.maxImageWidth), sy/float32(ctx.maxImageHeight), 0)
		mat4x4_mul(&instance.textureMatrix, t, s)
		instance.textureMatrix[3][3] = float32(image.ID)
	}
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

	return Image{
		ID:     id,
		Width:  width,
		Height: height,
	}
}
