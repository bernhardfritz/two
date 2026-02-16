package main

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

func mat4x4_row(r *vec4, M mat4x4, i int) {
	for k := 0; k < 4; k++ {
		r[k] = M[k][i]
	}
}

func mat4x4_scale_aniso(M *mat4x4, a mat4x4, x, y, z float32) {
	vec4_scale(&M[0], a[0], x)
	vec4_scale(&M[1], a[1], y)
	vec4_scale(&M[2], a[2], z)
	vec4_dup(&M[3], a[3])
}

func mat4x4_translate_in_place(M *mat4x4, x, y, z float32) {
	t := vec4{x, y, z, 0}
	var r vec4
	for i := 0; i < 4; i++ {
		mat4x4_row(&r, *M, i)
		M[3][i] += vec4_mul_inner(r, t)
	}
}
