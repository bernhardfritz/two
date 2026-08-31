package bitset256

type Bitset256 [4]uint64

func (bitset *Bitset256) Set(bitIndex uint8) {
	bitset[bitIndex/64] |= 1 << (bitIndex % 64)
}

func (bitset *Bitset256) Get(bitIndex uint8) bool {
	return bitset[bitIndex/64]&(1<<(bitIndex%64)) != 0
}

func (bitset *Bitset256) Clear() {
	bitset[0] = 0
	bitset[1] = 0
	bitset[2] = 0
	bitset[3] = 0
}
