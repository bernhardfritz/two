// A simple 2D graphics library
package flatland

import (
	"io"
	"io/fs"
	"unsafe"

	"github.com/bernhardfritz/flatland/internal/linmath"
	"github.com/bernhardfritz/flatland/internal/state"
)

// milliseconds it took to draw last frame
var DeltaTime float64

// clientWidth of the canvas
var Width float64

// clientHeight of the canvas
var Height float64

// X coordinate of the mouse pointer
var MouseX float64

// Y coordinate of the mouse pointer
var MouseY float64

// buttons being pressed (if any)
var MouseButtons int

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
	if width > state.MaxTextureWidth {
		state.MaxTextureWidth = width
	}
	if height > state.MaxTextureHeight {
		state.MaxTextureHeight = height
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
	instance := state.PerInstanceData{
		TintColor: state.TintColor,
	}
	instance.ModelMatrix = state.TransformMatrix.Mul(linmath.NewTranslate(0.5+float32(dx), 0.5+float32(dy), 0).Mul(linmath.NewTranslate(-0.5, -0.5, 0).ScaleAniso(float32(dWidth), float32(dHeight), 1)))
	instance.TextureMatrix = linmath.NewTranslate(float32(sx/state.MaxTextureWidth), float32(sy/state.MaxTextureHeight), 0).Mul(linmath.NewScale(float32(sWidth/state.MaxTextureWidth), float32(sHeight/state.MaxTextureHeight), 1))
	instance.TextureMatrix[3][3] = float32(texture.id + 1) // add 1 because first texture is 1x1 white pixel
	state.Instances = append(state.Instances, instance)
}

// Draws a color-filled rectangle
func DrawRectangle(x, y, width, height float64) {
	DrawTexture4f(Texture{id: -1, Width: 1, Height: 1}, x, y, width, height)
}

// Clears the background with color specified by red, green, blue and alpha channel values between 0 and 255.
func ClearBackground(r, g, b, a uint8) {
	tmp := state.TransformMatrix
	state.TransformMatrix = linmath.NewIdentity()
	DrawRectangle(0, 0, Width, Height)
	state.TransformMatrix = tmp
	state.Instances[len(state.Instances)-1].TintColor = linmath.Vec4{float32(r) / 255, float32(g) / 255, float32(b) / 255, float32(a) / 255}
}

// Sets the color to tint textures with specified by red, green, blue and alpha channel values between 0 and 255.
func SetTintColor(r, g, b, a uint8) {
	state.TintColor = linmath.Vec4{float32(r) / 255, float32(g) / 255, float32(b) / 255, float32(a) / 255}
}

// Sets the matrix to transform all following instances by.
func SetTransform(a, b, c, d, e, f float64) {
	state.TransformMatrix[0][0] = float32(a)
	state.TransformMatrix[0][1] = float32(b)
	state.TransformMatrix[1][0] = float32(c)
	state.TransformMatrix[1][1] = float32(d)
	state.TransformMatrix[3][0] = float32(e)
	state.TransformMatrix[3][1] = float32(f)
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

// Font, struct literals can be created with [LoadFont] and passed to [DrawText]
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
func DrawText(font Font, text string, x, y float64) {
	for pos, char := range text {
		DrawTexture8f(font.texture, x+float64(pos)*font.monospaceWidth, y, font.monospaceWidth, font.size, 1+float64((char-' ')%16)*(font.monospaceWidth+1), 1+float64((char-' ')/16)*float64(font.size+1), font.monospaceWidth, float64(font.size))
	}
}

// Sets the function to call when it's time to update your animation for the next repaint
func SetAnimationLoop(animate func()) {
	state.AnimationLoop = animate
	select {}
}

// Check if a key is being pressed
func IsKeyPressed(key uint8) bool {
	return state.Keys.Get(key)
}

//export animationLoop
func animationLoop(deltaTime, width, height, mouseX, mouseY, mouseButtons float64, keys uint64) uint64 {
	DeltaTime = deltaTime
	Width = width
	Height = height
	MouseX = mouseX
	MouseY = mouseY
	MouseButtons = int(mouseButtons)
	state.TintColor = linmath.Vec4{1, 1, 1, 1}
	state.TransformMatrix = linmath.NewIdentity()
	state.Keys.Clear()
	for keys > 0 {
		state.Keys.Set(uint8(keys & 0xFF))
		keys >>= 8
	}
	state.AnimationLoop()
	ret := uint64(uintptr(unsafe.Pointer(unsafe.SliceData(state.Instances))))<<32 | uint64(len(state.Instances))
	state.Instances = state.Instances[:0]

	return ret
}
