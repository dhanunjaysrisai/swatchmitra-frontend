/**
 * Hamming distance between two 64-bit perceptual hashes encoded as 16 hex characters.
 */
function popcount4(n) {
  let c = 0
  for (let i = 0; i < 4; i++) {
    if ((n >> i) & 1) c++
  }
  return c
}

function hammingDistance64(hexA, hexB) {
  if (!hexA || !hexB || hexA.length !== 16 || hexB.length !== 16) return 64
  let d = 0
  for (let i = 0; i < 16; i++) {
    const x = parseInt(hexA[i], 16) ^ parseInt(hexB[i], 16)
    d += popcount4(x)
  }
  return d
}

module.exports = { hammingDistance64 }
