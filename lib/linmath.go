package lib

type vec4 [4]float32

func vec4_scale(r *vec4, v vec4, s float32) {
	for i := 0; i < 4; i++ {
		r[i] = v[i] * s
	}
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
