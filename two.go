package two

import (
	"io"
	"io/fs"
	"unsafe"
)

type perInstanceData struct {
	modelMatrix   mat4x4
	textureMatrix mat4x4
	tintColor     vec4
}

type context struct {
	instances        []perInstanceData
	maxTextureWidth  int
	maxTextureHeight int
	update           func(deltaTime float64, width, height, mouseX, mouseY, mouseButtons int)
	width            int
	height           int
	tintColor        vec4
}

var ctx context

// Texture, tex data stored in GPU memory (VRAM)
type Texture struct {
	id     int
	Width  int
	Height int
}

// Draws a texture onto the canvas where dx and dy specify the coordinates of the top-left corner.
func DrawTexture2f(texture Texture, dx, dy float32) {
	DrawTexture8f(texture, dx, dy, float32(texture.Width), float32(texture.Height), 0, 0, float32(texture.Width), float32(texture.Height))
}

// Draws a texture of width dWidth and height dHeight onto the canvas where dx and dy specify the coordinates of the top-left corner.
func DrawTexture4f(texture Texture, dx, dy, dWidth, dHeight float32) {
	DrawTexture8f(texture, dx, dy, dWidth, dHeight, 0, 0, float32(texture.Width), float32(texture.Height))
}

// Draws a texture of width dWidth and height dHeight onto the canvas where dx and dy specify the coordinates of the top-left corner and parameters sx, sy, sWidth and sHeight define a texture subsection to read from.
func DrawTexture8f(texture Texture, dx, dy, dWidth, dHeight, sx, sy, sWidth, sHeight float32) {
	instance := perInstanceData{
		tintColor: ctx.tintColor,
	}
	{
		var t1 mat4x4
		mat4x4_translate(&t1, -0.5, -0.5, 0) // -0.5 to compensate because quad is offset for the purpose of dual usage as uv coordinates
		var s mat4x4
		mat4x4_scale_aniso(&s, t1, dWidth, dHeight, 1)
		var t2 mat4x4
		mat4x4_translate(&t2, 0.5+dx, 0.5+dy, 0)
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
		instance.textureMatrix[3][3] = float32(texture.id + 1) // add 1 because first texture is 1x1 white pixel
	}
	ctx.instances = append(ctx.instances, instance)
}

// Draws a color-filled rectangle
func DrawRectangle(x, y, width, height float32) {
	DrawTexture4f(Texture{id: -1, Width: 1, Height: 1}, x, y, width, height)
}

// Clears the background with color specified by red, green, blue and alpha channel values between 0 and 255.
func ClearBackground(r, g, b, a uint8) {
	DrawRectangle(0, 0, float32(ctx.width), float32(ctx.height))
	ctx.instances[len(ctx.instances)-1].tintColor = vec4{float32(r) / 255, float32(g) / 255, float32(b) / 255, float32(a) / 255}
}

// Sets the color to tint textures with specified by red, green, blue and alpha channel values between 0 and 255.
func SetTintColor(r, g, b, a uint8) {
	ctx.tintColor = vec4{float32(r) / 255, float32(g) / 255, float32(b) / 255, float32(a) / 255}
}

//export writeFile
func writeFile(targetPath string, bytes []byte)

// Copy embed.FS to wasm memory. This must be called before loading assets
// pass it an embed.FS
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

// LoadTexture - Load texture from file into GPU memory (VRAM)
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
		id:     id,
		Width:  width,
		Height: height,
	}
}

type Font struct {
	texture        Texture
	size           int
	monospaceWidth float32
}

// LoadFont - Load monospaced font from a font atlas file into GPU memory (VRAM)
// see https://bernhardfritz.github.io/monospace-font-atlas-generator/
func LoadFont(fileName string) Font {
	// TODO accept CSS font string instead of file path to font atlas
	texture := LoadTexture(fileName)

	return Font{
		texture:        texture,
		size:           (texture.Height - 7) / 6,
		monospaceWidth: float32(texture.Width-17) / 16,
	}
}

// Draws color-filled monospaced text
func DrawText(font Font, text string, x, y float32, size int) {
	scale := float32(size) / float32(font.size)
	for pos, char := range text {
		DrawTexture8f(font.texture, x+scale*float32(pos)*font.monospaceWidth, y, scale*font.monospaceWidth, float32(size), 1+float32((char-' ')%16)*(font.monospaceWidth+1), 1+float32((char-' ')/16)*float32(font.size+1), font.monospaceWidth, float32(font.size))
	}
}

// Sets the function to call when it's time to update your game for the next repaint
func SetGameLoop(update func(deltaTime float64, width, height, mouseX, mouseY, mouseButtons int)) {
	ctx.update = update
	select {}
}

//export update
func update(deltaTime, width, height, mouseX, mouseY, mouseButtons float64) uint64 {
	ctx.width = int(width)
	ctx.height = int(height)
	ctx.tintColor = vec4{1, 1, 1, 1}
	ctx.update(deltaTime, int(width), int(height), int(mouseX), int(mouseY), int(mouseButtons))
	ret := uint64(uintptr(unsafe.Pointer(unsafe.SliceData(ctx.instances))))<<32 | uint64(len(ctx.instances))
	ctx.instances = ctx.instances[:0]

	return ret
}
