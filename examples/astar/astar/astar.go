package astar

import (
	"container/heap"
	"math"
	"slices"
)

type ivec2 [2]int

func ivec2Equal(a, b ivec2) bool {
	return a[0] == b[0] && a[1] == b[1]
}

func ivec2Sum(a, b ivec2) ivec2 {
	return ivec2{a[0] + b[0], a[1] + b[1]}
}

type bvecn []bool

func (grid *bvecn) get(cols int, position ivec2) bool {
	return (*grid)[position[1]*cols+position[0]]
}

var directions = []ivec2{
	{0, 1}, {1, 0}, {0, -1}, {-1, 0},
}

func FindPath(grid bvecn, cols int, position1, position2 ivec2) [][2]int {
	rows := len(grid) / cols
	path := make([][2]int, 0)
	if grid.get(cols, position1) || grid.get(cols, position2) {
		return path
	}
	closedSet := make([]*Node, 0)
	openSet := make(PriorityQueue, 0)
	start := &Node{
		position: position1,
		gScore:   0,
		hScore:   heuristicCostEstimate(position1, position2),
		cameFrom: nil,
		index:    0,
	}
	openSet.Push(start)

	var current *Node = nil
	for openSet.Len() != 0 {
		current = openSet[len(openSet)-1]
		if ivec2Equal(current.position, position2) {
			break
		}

		openSet.Pop()
		closedSet = append(closedSet, current)

		for i := 0; i < 4; i++ {
			position := ivec2Sum(current.position, directions[i])
			if position[0] < 0 || position[0] >= cols || position[1] < 0 || position[1] >= rows || grid.get(cols, position) {
				continue
			}
			cont := false
			for _, node := range closedSet {
				if ivec2Equal(node.position, position) {
					cont = true
					break
				}
			}
			if cont {
				continue
			}

			tentativeGScore := current.gScore + 1 // 1 represents distance between two cells

			var neighbor *Node = nil
			for _, node := range openSet {
				if ivec2Equal(node.position, position) {
					neighbor = node
					break
				}
			}
			if neighbor == nil {
				neighbor = &Node{
					position: position,
					gScore:   tentativeGScore,
					hScore:   heuristicCostEstimate(position, position2),
					cameFrom: current,
					index:    0,
				}
				for _, node := range openSet {
					node.index++
				}
				openSet = slices.Insert(openSet, 0, neighbor)
				heap.Fix(&openSet, 0)
			} else if tentativeGScore < neighbor.gScore {
				neighbor.cameFrom = current
				neighbor.gScore = tentativeGScore
				heap.Fix(&openSet, neighbor.index)
			}
		}
	}

	if current != nil && ivec2Equal(current.position, position2) {
		for current != nil {
			path = append(path, current.position)
			current = current.cameFrom
		}
		slices.Reverse(path)
	}

	return path
}

func heuristicCostEstimate(position1, position2 ivec2) float64 {
	return math.Abs(float64(position1[0]-position2[0])) + math.Abs(float64(position1[1]-position2[1]))
}
