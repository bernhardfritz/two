package lib

import "math"

type vec4 [4]float32

func vec4_scale(r *vec4, v vec4, s float32) {
	for i := 0; i < 4; i++ {
		r[i] = v[i] * s
	}
}

func vec4_mul_inner(a vec4, b vec4) float32 {
	var p float32
	for i := 0; i < 4; i++ {
		p += b[i] * a[i]
	}
	return p
}

func vec4_dup(r *vec4, src vec4) {
	for i := 0; i < 4; i++ {
		r[i] = src[i]
	}
}

type mat4x4 [4]vec4

func mat4x4_identity(M *mat4x4) {
	for i := 0; i < 4; i++ {
		for j := 0; j < 4; j++ {
			if i == j {
				M[i][j] = 1
			} else {
				M[i][j] = 0
			}
		}
	}
}

func mat4x4_dup(M *mat4x4, N mat4x4) {
	for i := 0; i < 4; i++ {
		vec4_dup(&M[i], N[i])
	}
}

func mat4x4_row(r *vec4, M mat4x4, i int) {
	for k := 0; k < 4; k++ {
		r[k] = M[k][i]
	}
}

func mat4x4_scale(M *mat4x4, a mat4x4, k float32) {
	for i := 0; i < 4; i++ {
		vec4_scale(&M[i], a[i], k)
	}
}

func mat4x4_scale_aniso(M *mat4x4, a mat4x4, x, y, z float32) {
	vec4_scale(&M[0], a[0], x)
	vec4_scale(&M[1], a[1], y)
	vec4_scale(&M[2], a[2], z)
	vec4_dup(&M[3], a[3])
}

func mat4x4_mul(M *mat4x4, a mat4x4, b mat4x4) {
	var temp mat4x4
	for c := 0; c < 4; c++ {
		for r := 0; r < 4; r++ {
			temp[c][r] = 0
			for k := 0; k < 4; k++ {
				temp[c][r] += a[k][r] * b[c][k]
			}
		}
	}
	mat4x4_dup(M, temp)
}

func mat4x4_translate(T *mat4x4, x, y, z float32) {
	mat4x4_identity(T)
	T[3][0] = x
	T[3][1] = y
	T[3][2] = z
}

func mat4x4_translate_in_place(M *mat4x4, x, y, z float32) {
	t := vec4{x, y, z, 0}
	var r vec4
	for i := 0; i < 4; i++ {
		mat4x4_row(&r, *M, i)
		M[3][i] += vec4_mul_inner(r, t)
	}
}

func mat4x4_rotate_Z(Q *mat4x4, M mat4x4, angle float32) {
	s := float32(math.Sin(float64(angle)))
	c := float32(math.Cos(float64(angle)))
	R := mat4x4{
		{c, s, 0, 0},
		{-s, c, 0, 0},
		{0, 0, 1, 0},
		{0, 0, 0, 1},
	}
	mat4x4_mul(Q, M, R)
}

func mat4x4_ortho(M mat4x4, l, r, b, t, n, f float32) {
	M[0][0] = 2 / (r - l)
	M[0][1], M[0][2], M[0][3] = 0, 0, 0

	M[1][1] = 2 / (t - b)
	M[1][0], M[1][2], M[1][3] = 0, 0, 0

	M[2][2] = -2 / (f - n)
	M[2][0], M[2][1], M[2][3] = 0, 0, 0

	M[3][0] = -(r + l) / (r - l)
	M[3][1] = -(t + b) / (t - b)
	M[3][2] = -(f + n) / (f - n)
	M[3][3] = 1
}
