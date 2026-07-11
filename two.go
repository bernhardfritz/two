package two

import (
	"io"
	"io/fs"
	"unsafe"

	linmath "github.com/bernhardfritz/two/internal/linmath"
)

type perInstanceData struct {
	modelMatrix   linmath.Mat4
	textureMatrix linmath.Mat4
	tintColor     linmath.Vec4
}

type context struct {
	instances        []perInstanceData
	maxTextureWidth  float64
	maxTextureHeight float64
	update           func(deltaTime, width, height, mouseX, mouseY float64, mouseButtons int)
	width            float64
	height           float64
	tintColor        linmath.Vec4
	transformMatrix  linmath.Mat4
}

var ctx context

// Texture, tex data stored in GPU memory (VRAM)
type Texture struct {
	id     int
	Width  float64
	Height float64
}

func textureFromBytes(bytes []byte) Texture {
	id := int(littleEndianToUint32(bytes[0:4]))
	width := float64(littleEndianToUint32(bytes[4:8]))
	height := float64(littleEndianToUint32(bytes[8:12]))
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

// Draws a texture onto the canvas where dx and dy specify the coordinates of the top-left corner.
func DrawTexture2f(texture Texture, dx, dy float64) {
	DrawTexture8f(texture, dx, dy, texture.Width, texture.Height, 0, 0, texture.Width, texture.Height)
}

// Draws a texture of width dWidth and height dHeight onto the canvas where dx and dy specify the coordinates of the top-left corner.
func DrawTexture4f(texture Texture, dx, dy, dWidth, dHeight float64) {
	DrawTexture8f(texture, dx, dy, dWidth, dHeight, 0, 0, texture.Width, texture.Height)
}

// Draws a texture of width dWidth and height dHeight onto the canvas where dx and dy specify the coordinates of the top-left corner and parameters sx, sy, sWidth and sHeight define a texture subsection to read from.
func DrawTexture8f(texture Texture, dx, dy, dWidth, dHeight, sx, sy, sWidth, sHeight float64) {
	instance := perInstanceData{
		tintColor: ctx.tintColor,
	}
	instance.modelMatrix = ctx.transformMatrix.Mul(linmath.NewTranslate(0.5+float32(dx), 0.5+float32(dy), 0).Mul(linmath.NewTranslate(-0.5, -0.5, 0).ScaleAniso(float32(dWidth), float32(dHeight), 1)))
	instance.textureMatrix = linmath.NewTranslate(float32(sx/ctx.maxTextureWidth), float32(sy/ctx.maxTextureHeight), 0).Mul(linmath.NewScale(float32(sWidth/ctx.maxTextureWidth), float32(sHeight/ctx.maxTextureHeight), 1))
	instance.textureMatrix[3][3] = float32(texture.id + 1) // add 1 because first texture is 1x1 white pixel
	ctx.instances = append(ctx.instances, instance)
}

// Draws a color-filled rectangle
func DrawRectangle(x, y, width, height float64) {
	DrawTexture4f(Texture{id: -1, Width: 1, Height: 1}, x, y, width, height)
}

// Clears the background with color specified by red, green, blue and alpha channel values between 0 and 255.
func ClearBackground(r, g, b, a uint8) {
	tmp := ctx.transformMatrix
	ctx.transformMatrix = linmath.NewIdentity()
	DrawRectangle(0, 0, ctx.width, ctx.height)
	ctx.transformMatrix = tmp
	ctx.instances[len(ctx.instances)-1].tintColor = linmath.Vec4{float32(r) / 255, float32(g) / 255, float32(b) / 255, float32(a) / 255}
}

// Sets the color to tint textures with specified by red, green, blue and alpha channel values between 0 and 255.
func SetTintColor(r, g, b, a uint8) {
	ctx.tintColor = linmath.Vec4{float32(r) / 255, float32(g) / 255, float32(b) / 255, float32(a) / 255}
}

// Sets the matrix to transform all following instances by.
func SetTransform(a, b, c, d, e, f float64) {
	ctx.transformMatrix[0][0] = float32(a)
	ctx.transformMatrix[0][1] = float32(b)
	ctx.transformMatrix[1][0] = float32(c)
	ctx.transformMatrix[1][1] = float32(d)
	ctx.transformMatrix[3][0] = float32(e)
	ctx.transformMatrix[3][1] = float32(f)
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

	return textureFromBytes(bytes[:])
}

type Font struct {
	texture        Texture
	size           float64
	monospaceWidth float64
}

//export loadFont
func loadFont(font string, bytes []byte)

// LoadFont - Load monospaced font from a CSS font string into GPU memory (VRAM)
func LoadFont(cssFont string) Font {
	var bytes [12]byte
	loadFont(cssFont, bytes[:])
	texture := textureFromBytes(bytes[:])

	return Font{
		texture:        texture,
		size:           (texture.Height - 7) / 6,
		monospaceWidth: float64(texture.Width-17) / 16,
	}
}

// Draws color-filled monospaced text
func DrawText(font Font, text string, x, y float64, size int) {
	scale := float64(size) / float64(font.size)
	for pos, char := range text {
		DrawTexture8f(font.texture, x+scale*float64(pos)*font.monospaceWidth, y, scale*font.monospaceWidth, float64(size), 1+float64((char-' ')%16)*(font.monospaceWidth+1), 1+float64((char-' ')/16)*float64(font.size+1), font.monospaceWidth, float64(font.size))
	}
}

// Sets the function to call when it's time to update your game for the next repaint
func SetGameLoop(update func(deltaTime, width, height, mouseX, mouseY float64, mouseButtons int)) {
	ctx.update = update
	select {}
}

//export update
func update(deltaTime, width, height, mouseX, mouseY, mouseButtons float64) uint64 {
	ctx.width = width
	ctx.height = height
	ctx.tintColor = linmath.Vec4{1, 1, 1, 1}
	ctx.transformMatrix = linmath.NewIdentity()
	ctx.update(deltaTime, width, height, mouseX, mouseY, int(mouseButtons))
	ret := uint64(uintptr(unsafe.Pointer(unsafe.SliceData(ctx.instances))))<<32 | uint64(len(ctx.instances))
	ctx.instances = ctx.instances[:0]

	return ret
}
