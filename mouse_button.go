package flatland

type MouseButton uint8

const (
	MouseButtonLeft MouseButton = 1 << iota
	MouseButtonRight
	MouseButtonMiddle
	MouseButtonBack
	MouseButtonForward
)
