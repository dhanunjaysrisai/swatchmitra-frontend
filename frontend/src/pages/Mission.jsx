import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import * as tmImage from '@teachablemachine/image'
import '@tensorflow/tfjs'
import { useAuth } from '../contexts/AuthContext'
import { addRewardEvent } from '../services/rewardService'
import { submitMissionCapture } from '../services/missionCaptureService'
import { computeAverageHashHex } from '../utils/imageHash'
import ScratchRewardCard from '../components/ScratchRewardCard'
import { getApiBaseUrl } from '../config/apiBase'
import './mission.css'
import './mission-main.css'

/**
 * Same-origin Teachable Machine assets from Vite's public/models/ (dev + production).
 * Uses import.meta.env.BASE_URL so subpath deploys work (e.g. example.com/app/).
 */
function getTeachableMachineModelsBase() {
  const base = import.meta.env.BASE_URL || '/'
  const withSlash = base.endsWith('/') ? base : `${base}/`
  return `${withSlash}models/`
}

function isNetworkFailure(err) {
  const msg = typeof err?.message === 'string' ? err.message : ''
  if (msg === 'Failed to fetch') return true
  if (err?.name === 'TypeError' && /fetch|network|load/i.test(msg)) return true
  return false
}

function Mission() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()

  const userKey = useMemo(() => user?._id || user?.email || 'anon', [user])
  const mainSectionRef = useRef(null)
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const captureCanvasRef = useRef(null)

  const [isProcessing, setIsProcessing] = useState(false)
  const [modelError, setModelError] = useState('')
  const [cameraActive, setCameraActive] = useState(false)
  const [scratchOpen, setScratchOpen] = useState(false)
  const [scratchData, setScratchData] = useState({ points: 0, percent: 0, label: '' })

  const modelRef = useRef(null)
  const modelLoadPromiseRef = useRef(null)

  const closeMenu = () => setMenuOpen(false)

  const handleJoinMovement = () => {
    mainSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const stopCamera = () => {
    try {
      if (videoRef.current) {
        videoRef.current.pause()
        videoRef.current.srcObject = null
      }
      const stream = streamRef.current
      if (stream) {
        stream.getTracks().forEach((t) => t.stop())
      }
    } catch {
      // no-op
    } finally {
      streamRef.current = null
      setCameraActive(false)
    }
  }

  const handleOpenCamera = async () => {
    setModelError('')
    try {
      // If already active, do nothing
      if (streamRef.current) return

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      })
      streamRef.current = stream
      setCameraActive(true)
    } catch (err) {
      console.error('Camera error:', err)
      setModelError('Camera permission denied or camera unavailable. Please allow camera access and try again.')
      stopCamera()
    }
  }

  const ensureModel = async () => {
    if (modelRef.current) return modelRef.current
    if (modelLoadPromiseRef.current) return modelLoadPromiseRef.current

    modelLoadPromiseRef.current = (async () => {
      setModelError('')
      const URL_BASE = getTeachableMachineModelsBase()
      const modelJsonUrl = `${URL_BASE}model.json`
      const metadataUrl = `${URL_BASE}metadata.json`

      try {
        const loaded = await tmImage.load(modelJsonUrl, metadataUrl)
        modelRef.current = loaded
        return loaded
      } catch (e) {
        const hint =
          'Place model.json, metadata.json, and weights.bin in frontend/public/models/ and restart the dev server. ' +
          'Weights load from the same folder as model.json (same origin as this page, not the API).'
        throw new Error(`${hint} (${e?.message || 'load failed'})`)
      }
    })()

    return modelLoadPromiseRef.current
  }

  const handleCaptureAndPredict = async () => {
    if (!videoRef.current) return
    setIsProcessing(true)
    setModelError('')

    try {
      const model = await ensureModel()

      const video = videoRef.current
      const canvas = captureCanvasRef.current
      if (!canvas) {
        throw new Error('Capture canvas missing')
      }

      const w = video.videoWidth || 640
      const h = video.videoHeight || 480
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Canvas context missing')
      ctx.drawImage(video, 0, 0, w, h)

      const predictions = await model.predict(canvas)
      const top =
        Array.isArray(predictions) && predictions.length > 0
          ? predictions.reduce((max, p) => (p.probability > max.probability ? p : max), predictions[0])
          : null

      if (!top || typeof top.probability !== 'number') {
        setModelError('Could not get a valid prediction. Please try another image.')
        return
      }

      const percent = Math.round(top.probability * 100)
      const points = Math.max(0, Math.min(10, Math.floor(percent / 10)))
      const label = top.className || ''

      if (!isAuthenticated) {
        setModelError('Please log in to save your capture and earn scratch rewards.')
        return
      }

      const perceptualHash = computeAverageHashHex(canvas)
      const imageBlob = await new Promise((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error('Could not encode image'))),
          'image/jpeg',
          0.88
        )
      })

      const formData = new FormData()
      formData.append('image', imageBlob, 'capture.jpg')
      formData.append('perceptualHash', perceptualHash)
      formData.append('label', label)
      formData.append('confidencePercent', String(percent))
      formData.append('points', String(points))

      try {
        await submitMissionCapture(formData)
      } catch (apiErr) {
        if (isNetworkFailure(apiErr)) {
          setModelError(
            `Could not reach the API at ${getApiBaseUrl()}. On a phone, use your PC's LAN address in the browser (not localhost), run the backend on port 5000, and allow it through the firewall.`
          )
          return
        }
        throw apiErr
      }

      addRewardEvent(userKey, { points, percent, label })
      setScratchData({ points, percent, label })
      setScratchOpen(true)
    } catch (err) {
      console.error('Model inference error:', err)
      if (err?.status === 409 || err?.duplicate) {
        setModelError(
          err.message ||
            'This looks like the same object as a previous capture. Please photograph a different item to earn rewards.'
        )
        return
      }
      if (err?.status === 401) {
        setModelError('Your session expired. Please log in again to save captures and earn rewards.')
        return
      }
      if (isNetworkFailure(err)) {
        setModelError(
          `Could not load the AI model or its weights. Stay on the same origin as this page, ensure public/models/ is deployed, or try again online. (${getApiBaseUrl()} for API saves.)`
        )
        return
      }
      const msg = typeof err?.message === 'string' && err.message ? err.message : 'Unknown error'
      setModelError(`Model inference failed: ${msg}`)
    } finally {
      setIsProcessing(false)
    }
  }

  useEffect(() => {
    return () => {
      stopCamera()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const stream = streamRef.current
    const video = videoRef.current
    if (!cameraActive || !stream || !video) return

    // Attach stream after <video> is mounted
    if (video.srcObject !== stream) {
      video.srcObject = stream
    }

    const play = async () => {
      try {
        await video.play()
      } catch (err) {
        console.error('Video play error:', err)
        setModelError('Camera started, but preview could not autoplay. Tap the preview area and try again.')
      }
    }

    play()
  }, [cameraActive])

  return (
    <>
      {/* Navbar */}
      <header className="site-navbar">
        <div className="site-navbar__inner">
          <button
            className={`site-navbar__toggle${menuOpen ? ' is-open' : ''}`}
            aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className="bar" />
            <span className="bar" />
            <span className="bar" />
          </button>

          <div className="site-navbar__brand">
            <Link to="/">SwachhMitra</Link>
          </div>

          <nav className="site-navbar__links">
            <Link to="/">Home</Link>
            <Link to="/rewards">Rewards</Link>
            <Link to="/complaints">Complaints</Link>
            <Link to="/mission">Mission</Link>
            <Link to="/contact">Contact</Link>
            {isAuthenticated ? (
              <>
                <span style={{ color: 'black', margin: '0 10px' }}>Welcome, {user?.name}</span>
                <button 
                  onClick={logout}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: 'black', 
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Mobile drawer */}
      <div className={`site-drawer${menuOpen ? ' is-open' : ''}`}>
        <nav className="site-drawer__nav" onClick={closeMenu}>
          <Link to="/">Home</Link>
          <Link to="/rewards">Rewards</Link>
          <Link to="/complaints">Complaints</Link>
          <Link to="/mission">Mission</Link>
          <Link to="/contact">Contact</Link>
          {isAuthenticated ? (
            <>
              <span style={{ color: 'black',display: 'block' }}>Welcome, {user?.name}</span>
              <button 
                onClick={() => {
                  logout()
                  closeMenu()
                }}
                style={{ 
                  display:'flex',
                  justifyContent:'left',
                  background: 'none', 
                  border: 'none', 
                  color: 'black', 
                  cursor: 'pointer',
                  textDecoration: 'none',
                  fontSize: 'inherit',
                  fontFamily: 'inherit'
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </div>
      {menuOpen && <div className="site-drawer__backdrop" onClick={closeMenu} />}

      {/* Mission Banner Section */}
      <section className="mission-banner">
        <div className="mission-banner-content">
          <div className="mission-left">
            <div className="map-video-container">
              <video 
                className="map-video"
                autoPlay
                loop
                muted
                playsInline
              >
                <source src={new URL('../../videos/mapvideo.mp4', import.meta.url).href} type="video/mp4" />
              </video>
            </div>
          </div>
          
          <div className="mission-right">
            <div className="mission-text">
              <img 
                src={new URL('../../images/mission.png', import.meta.url).href}
                alt="Mission background"
                className="mission-background-image"
              />
              <h1 className="mission-title">
                Our Mission: <span className="mission-highlight">Swachh Bharat with Accountability</span>
              </h1>
              <p className="mission-description">
                Empowering citizens to clean, complain, and earn while building a cleaner India
              </p>
              <button type="button" className="mission-cta-button" onClick={handleJoinMovement}>
                Join the Movement
              </button>
            </div>
            
          </div>
        </div>
        
        {/* Statistics Section */}
        <div className="mission-stats">
          <div className="stat-item">
            <div className="stat-label">Wrappers Cleaned</div>
            <div className="stat-value">10,000+</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Coins Distributed</div>
            <div className="stat-value">₹50,000+</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Active Citizens</div>
            <div className="stat-value">5000+</div>
          </div>
        </div>
      </section>

      {/* Mission Main Section */}
      <section ref={mainSectionRef} id="mission-main" className="mission-main">
        <div className="mission-main-inner">
          <div className="mission-main-copy">
            <h2 className="mission-main-title">Swachh Bharat, with Accountability</h2>
            <p className="mission-main-text">
              <span>Clean streets protect health and make communities stronger.</span>
              <br />
              <span>Report issues, share clean-up efforts, and earn rewards as you participate.</span>
            </p>
          </div>

          <div className="mission-main-actions">
            <button
              type="button"
              className="mission-camera-button"
              onClick={handleOpenCamera}
              disabled={isProcessing}
            >
              <span className="mission-camera-icon">📷</span>
              {cameraActive ? 'Camera Ready' : 'Open Camera'}
            </button>

            {!isAuthenticated && (
              <p className="mission-login-hint">
                Log in to save each capture and earn scratch rewards. Each reward needs a <strong>different object</strong>{' '}
                than your previous photos.
              </p>
            )}

            {cameraActive && (
              <div className="mission-camera-panel">
                <video ref={videoRef} className="mission-camera-preview" playsInline muted />
                <canvas ref={captureCanvasRef} className="mission-camera-canvas" />
                <div className="mission-camera-controls">
                  <button
                    type="button"
                    className="mission-capture-button"
                    onClick={handleCaptureAndPredict}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : 'Capture'}
                  </button>
                  <button type="button" className="mission-stop-button" onClick={stopCamera} disabled={isProcessing}>
                    Stop
                  </button>
                </div>
              </div>
            )}

            {modelError && <div className="mission-model-error">{modelError}</div>}
          </div>
        </div>
      </section>

      {scratchOpen && (
        <ScratchRewardCard
          points={scratchData.points}
          percent={scratchData.percent}
          label={scratchData.label}
          onClose={() => setScratchOpen(false)}
        />
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-brand">
              <h3 className="footer-title">SwachhMitra</h3>
              <p className="footer-tagline">Building a Cleaner, Safer India Together</p>
            </div>
            
            <div className="footer-links">
              <div className="footer-section">
                <h4 className="footer-section-title">Quick Links</h4>
                <ul className="footer-list">
                  <li><Link to="/" className="footer-link">Home</Link></li>
                  <li><Link to="/complaints" className="footer-link">File Complaint</Link></li>
                  <li><Link to="/mission" className="footer-link">Mission</Link></li>
                  <li><a href="#contact" className="footer-link">Contact</a></li>
                </ul>
              </div>
              
              <div className="footer-section">
                <h4 className="footer-section-title">Contact Info</h4>
                <ul className="footer-list">
                  <li className="footer-contact">
                    <span className="footer-icon">📞</span>
                    <span>+91 1800-123-4567</span>
                  </li>
                  <li className="footer-contact">
                    <span className="footer-icon">📞</span>
                    <span>+91 1800-987-6543</span>
                  </li>
                  <li className="footer-contact">
                    <span className="footer-icon">✉️</span>
                    <span>support@swachhmitra.gov.in</span>
                  </li>
                </ul>
              </div>
              
              <div className="footer-section">
                <h4 className="footer-section-title">Follow Us</h4>
                <div className="social-links">
                  <a href="https://instagram.com/swachhmitra" className="social-link" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                    <svg className="social-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                  <a href="https://twitter.com/swachhmitra" className="social-link" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                    <svg className="social-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </a>
                  <a href="https://youtube.com/c/swachhmitra" className="social-link" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                    <svg className="social-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                  <a href="mailto:support@swachhmitra.gov.in" className="social-link" aria-label="Email">
                    <svg className="social-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <div className="footer-copyright">
              <p>&copy; 2024 SwachhMitra. All rights reserved. | Empowering citizens for a cleaner India</p>
            </div>
            <div className="footer-tricolor">
              <div className="tricolor-bar"></div>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}

export default Mission
