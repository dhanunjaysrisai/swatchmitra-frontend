import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

function ScratchRewardCard({ points, percent, label, onClose }) {
  const canvasRef = useRef(null)
  const [revealed, setRevealed] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)

  const safePoints = useMemo(() => Math.max(0, Number(points || 0)), [points])
  const safePercent = useMemo(() => Math.max(0, Math.min(100, Number(percent || 0))), [percent])
  const safeLabel = label || ''

  const initCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const parent = canvas.parentElement
    if (!parent) return

    const dpr = window.devicePixelRatio || 1
    const { width, height } = parent.getBoundingClientRect()

    canvas.width = Math.max(1, Math.floor(width * dpr))
    canvas.height = Math.max(1, Math.floor(height * dpr))
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Draw overlay
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.scale(dpr, dpr)

    // Base overlay
    ctx.fillStyle = 'rgba(200,200,200,0.95)'
    ctx.fillRect(0, 0, width, height)

    // Add subtle tricolor stripes
    const stripeCount = 18
    for (let i = 0; i < stripeCount; i++) {
      const x = (width * i) / stripeCount
      ctx.fillStyle = i % 3 === 0 ? 'rgba(255,122,0,0.35)' : i % 3 === 1 ? 'rgba(255,255,255,0.18)' : 'rgba(22,163,74,0.28)'
      ctx.fillRect(x, 0, Math.max(1, width / stripeCount / 2), height)
    }

    // Add light noise lines
    ctx.strokeStyle = 'rgba(0,0,0,0.10)'
    for (let i = 0; i < 22; i++) {
      const y = (height * i) / 22
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y + (Math.random() - 0.5) * 8)
      ctx.stroke()
    }
  }

  useEffect(() => {
    setRevealed(false)
    setHasInteracted(false)
    // Wait for layout
    const t = setTimeout(() => initCanvas(), 50)
    return () => clearTimeout(t)
  }, [points, percent, label])

  const getCanvasPoint = (clientX, clientY) => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top
    return { x, y }
  }

  const scratchAt = (x, y, radius = 22) => {
    if (revealed) return
    const canvas = canvasRef.current
    if (!canvas) return
    const parent = canvas.parentElement
    if (!parent) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = parent.getBoundingClientRect()
    if (x < 0 || y < 0 || x > width || y > height) return

    setHasInteracted(true)

    // Make scratched pixels transparent
    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()

    // Optional: reveal based on coverage after interaction
    checkCoverage(ctx)
  }

  const checkCoverage = (ctx) => {
    // Sampling on the physical canvas buffer for alpha==0
    const canvas = canvasRef.current
    if (!canvas) return
    const sampleCols = 28
    const sampleRows = 16

    const img = ctx.getImageData(0, 0, canvas.width, canvas.height).data

    let cleared = 0
    let total = 0

    const stepX = Math.max(1, Math.floor(canvas.width / sampleCols))
    const stepY = Math.max(1, Math.floor(canvas.height / sampleRows))

    for (let y = 0; y < canvas.height; y += stepY) {
      for (let x = 0; x < canvas.width; x += stepX) {
        const idx = (y * canvas.width + x) * 4
        const alpha = img[idx + 3]
        total += 1
        if (alpha === 0) cleared += 1
      }
    }

    const ratio = total ? cleared / total : 0
    // Reveal when enough overlay is removed
    if (ratio > 0.35) {
      setRevealed(true)
    }
  }

  useEffect(() => {
    if (!revealed) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }, [revealed])

  const onPointerDown = (e) => {
    if (revealed) return
    e.preventDefault()
    const pt = getCanvasPoint(e.clientX, e.clientY)
    if (!pt) return
    scratchAt(pt.x, pt.y)
  }

  const onPointerMove = (e) => {
    if (revealed) return
    if (!(e.buttons & 1)) return // only while mouse pressed
    const pt = getCanvasPoint(e.clientX, e.clientY)
    if (!pt) return
    scratchAt(pt.x, pt.y)
  }

  return (
    <div className="scratch-modal" role="dialog" aria-modal="true" aria-label="Reward scratch card">
      <div className="scratch-modal-backdrop" onClick={onClose} />
      <div className="scratch-card" onClick={(e) => e.stopPropagation()}>
        <button className="scratch-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <div className="scratch-card-body">
          <div className="scratch-card-header">
            <div className="scratch-badge">Scratch Reward</div>
            <div className="scratch-percentage">{safePercent}% confidence</div>
          </div>

          <div className="scratch-card-inner">
            <div className="scratch-reveal">
              <div className="scratch-title">You earned</div>
              <div className="scratch-points">{safePoints} points</div>
              {safeLabel && <div className="scratch-label">Prediction: {safeLabel}</div>}
              <Link to="/rewards" className="scratch-view-btn">
                View Rewards
              </Link>
            </div>

            {!revealed && (
              <canvas
                ref={canvasRef}
                className="scratch-canvas"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
              />
            )}
          </div>

          {!hasInteracted && (
            <div className="scratch-instruction">Scrape your finger/mouse to reveal your points</div>
          )}

          {revealed && <div className="scratch-revealed-text">Reward unlocked</div>}
        </div>
      </div>
    </div>
  )
}

export default ScratchRewardCard

