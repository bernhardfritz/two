package main

import (
	fl "github.com/bernhardfritz/flatland"
)

func main() {
	whiteRabbitFont := fl.LoadFont("32px White Rabbit")

	animate := func() {
		fl.ClearBackground(0, 0, 0, 255)
		fl.SetTintColor(0, 255, 0, 255)
		fl.DrawText(whiteRabbitFont, "Wake up Neo.", 50, 50, 32)
		fl.DrawText(whiteRabbitFont, "The Matrix has you.", 50, 100, 32)
		fl.DrawText(whiteRabbitFont, "Follow the White Rabbit.", 50, 150, 32)
	}

	fl.SetAnimationLoop(animate)
}
