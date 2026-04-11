/**
 * 64-bit average hash (16 hex chars) for perceptual similarity on the canvas image.
 */
export function computeAverageHashHex(canvas) {
  const small = document.createElement('canvas')
  small.width = 8
  small.height = 8
  const sctx = small.getContext('2d')
  if (!sctx) return ''
  sctx.drawImage(canvas, 0, 0, 8, 8)
  const imgData = sctx.getImageData(0, 0, 8, 8).data
  const grays = []
  for (let i = 0; i < 64; i++) {
    const o = i * 4
    grays.push(0.299 * imgData[o] + 0.587 * imgData[o + 1] + 0.114 * imgData[o + 2])
  }
  const avg = grays.reduce((a, b) => a + b, 0) / 64
  let bits = ''
  for (const g of grays) {
    bits += g >= avg ? '1' : '0'
  }
  let hex = ''
  for (let i = 0; i < 64; i += 4) {
    hex += parseInt(bits.slice(i, i + 4), 2).toString(16)
  }
  return hex
}
