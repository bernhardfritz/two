package two

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
	instances        []perInstanceData
	maxTextureWidth  int
	maxTextureHeight int
	update           func(deltaTime float64)
}

var ctx context

type Texture struct {
	ID     int
	Width  int
	Height int
}

func DrawTexture2f(texture Texture, dx, dy float32) {
	DrawTexture8f(texture, dx, dy, float32(texture.Width), float32(texture.Height), 0, 0, float32(texture.Width), float32(texture.Height))
}

func DrawTexture4f(texture Texture, dx, dy, dWidth, dHeight float32) {
	DrawTexture8f(texture, dx, dy, dWidth, dHeight, 0, 0, float32(texture.Width), float32(texture.Height))
}

func DrawTexture8f(texture Texture, dx, dy, dWidth, dHeight, sx, sy, sWidth, sHeight float32) {
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
		mat4x4_scale_aniso(&s, identity, sWidth/float32(ctx.maxTextureWidth), sHeight/float32(ctx.maxTextureHeight), 1)
		var t mat4x4
		mat4x4_translate(&t, sx/float32(ctx.maxTextureWidth), sy/float32(ctx.maxTextureHeight), 0)
		mat4x4_mul(&instance.textureMatrix, t, s)
		instance.textureMatrix[3][3] = float32(texture.ID)
	}
	ctx.instances = append(ctx.instances, instance)
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

//export loadTexture
func loadTexture(fileName string, bytes []byte)

func littleEndianToUint32(bytes []byte) uint32 {
	return *(*uint32)(unsafe.Pointer(&bytes[0]))
}

func LoadTexture(fileName string) Texture {
	var bytes [12]byte
	loadTexture(fileName, bytes[:])
	id := int(littleEndianToUint32(bytes[0:4]))
	width := int(littleEndianToUint32(bytes[4:8]))
	height := int(littleEndianToUint32(bytes[8:12]))
	if width > ctx.maxTextureWidth {
		ctx.maxTextureWidth = width
	}
	if height > ctx.maxTextureHeight {
		ctx.maxTextureHeight = height
	}

	return Texture{
		ID:     id,
		Width:  width,
		Height: height,
	}
}

func SetMainLoop(update func(deltaTime float64)) {
	ctx.update = update
	select {}
}

//export update
func update(deltaTime float64) uint64 {
	ctx.update(deltaTime)
	ret := uint64(uintptr(unsafe.Pointer(unsafe.SliceData(ctx.instances))))<<32 | uint64(len(ctx.instances))
	ctx.instances = ctx.instances[:0]

	return ret
}
