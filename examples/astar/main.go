package main

import (
	"math/rand/v2"

	"github.com/bernhardfritz/two"
	"github.com/bernhardfritz/two/examples/astar/astar"
)

func randomGrid(grid []bool, cols int) {
	rows := len(grid) / cols
	for row := 0; row < rows; row++ {
		for col := 0; col < cols; col++ {
			grid[row*cols+col] = rand.Float64() < 0.25
		}
	}
}

func main() {
	const rows = 100
	const cols = 200
	grid := [rows * cols]bool{}
	randomGrid(grid[:], cols)
	for i := rows/2 - 2; i <= rows/2+2; i++ {
		for j := cols/2 - 2; j <= cols/2+2; j++ {
			grid[i*cols+j] = false
		}
	}
	start := [2]int{cols / 2, rows / 2}
	end := [2]int{}
	path := [][2]int{}
	var time float64 = 0
	update := func(deltaTime, width, height, mouseX, mouseY float64, mouseButtons int) {
		time += deltaTime
		dim := height / rows
		endX := int(mouseX / dim)
		endY := int(mouseY / dim)
		if endX != end[0] || endY != end[1] {
			end = [2]int{endX, endY}
			if !grid[end[1]*cols+end[0]] {
				path = astar.FindPath(grid[:], cols, start, end)
			}
		}
		two.ClearBackground(255, 255, 255, 255)
		two.SetTintColor(0, 0, 0, 255)
		for row := 0; row < rows; row++ {
			for col := 0; col < cols; col++ {
				if !grid[row*cols+col] {
					continue
				}
				two.DrawRectangle(float64(col)*dim, float64(row)*dim, dim, dim)
			}
		}
		if len(path) == 0 {
			return
		}
		marked := (int(time/25) % 1000) % len(path)
		for index, position := range path {
			if index == marked {
				two.SetTintColor(255, 255, 0, 255)
			} else {
				two.SetTintColor(0, 255, 255, 255)
			}
			two.DrawRectangle(float64(position[0])*dim, float64(position[1])*dim, dim, dim)
		}
	}

	two.SetGameLoop(update)
}
