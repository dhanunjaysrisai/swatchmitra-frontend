import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import complaintService from '../services/complaintService'
import './complaints.css'

function Complaints() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    category: '',
    image: null
  })
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [cameraStream, setCameraStream] = useState(null)
  const [capturedImage, setCapturedImage] = useState(null)
  
  const { user, isAuthenticated, logout } = useAuth()

  const handleChange = (e) => {
    const { name, value, files } = e.target
    setFormData({
      ...formData,
      [name]: files ? files[0] : value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      console.log('Submitting complaint with form data:', formData)
      
      // Check if user is authenticated
      if (!isAuthenticated) {
        alert('Please login to submit a complaint.')
        return
      }
      
      const response = await complaintService.submitComplaint(formData)
      console.log('Complaint submission response:', response)
      
      setSuccessMessage('Complaint submitted successfully! We will review it shortly.')
      
      // Auto-dismiss success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('')
      }, 5000)
      
      setFormData({
        title: '',
        description: '',
        location: '',
        category: '',
        image: null
      })
      
      // Reset file input and camera
      const fileInput = document.getElementById('image')
      if (fileInput) fileInput.value = ''
      setCapturedImage(null)
      setShowCamera(false)
      
    } catch (error) {
      console.error('Complaint submission error:', error)
      setSuccessMessage('')
      alert(`Failed to submit complaint: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const closeMenu = () => setMenuOpen(false)

  // Camera functionality
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      })
      setCameraStream(stream)
      setShowCamera(true)
    } catch (error) {
      console.error('Error accessing camera:', error)
      alert('Unable to access camera. Please check permissions.')
    }
  }

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop())
      setCameraStream(null)
    }
    setShowCamera(false)
  }

  const capturePhoto = () => {
    const video = document.getElementById('camera-video')
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    canvas.toBlob((blob) => {
      const file = new File([blob], 'captured-photo.jpg', { type: 'image/jpeg' })
      setCapturedImage(URL.createObjectURL(blob))
      setFormData(prev => ({ ...prev, image: file }))
      stopCamera()
    }, 'image/jpeg', 0.8)
  }

  const removeCapturedImage = () => {
    setCapturedImage(null)
    setFormData(prev => ({ ...prev, image: null }))
  }

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

      {/* Main Content */}
      <div className="complaints-container">
        <div className="complaints-header">
          <h1 className="complaints-title">File a Complaint</h1>
          <p className="complaints-subtitle">
            Help us make your area cleaner by reporting issues. Your voice matters!
          </p>
        </div>

        <div className="complaints-content">
          <div className="complaints-form-container">
            <form className="complaints-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="title" className="form-label">Complaint Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Brief description of the issue"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="category" className="form-label">Category</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Select a category</option>
                  <option value="sanitation">Sanitation Issues</option>
                  <option value="waste">Waste Management</option>
                  <option value="infrastructure">Infrastructure Problems</option>
                  <option value="safety">Safety Concerns</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="location" className="form-label">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Street, Area, City"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description" className="form-label">Detailed Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="form-textarea"
                  placeholder="Please provide detailed information about the issue..."
                  rows="5"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Photo (Optional)</label>
                <div className="photo-options">
                  <div className="photo-option">
                    <input
                      type="file"
                      id="image"
                      name="image"
                      onChange={handleChange}
                      className="form-file"
                      accept="image/*"
                    />
                    <label htmlFor="image" className="file-upload-btn">
                    <i class="fa-solid fa-upload"></i> Upload Photo
                    </label>
                  </div>
                  <div className="photo-option">
                    <button
                      type="button"
                      onClick={startCamera}
                      className="camera-btn"
                    >
                      <i class="fa-solid fa-camera"></i> Capture Photo
                    </button>
                  </div>
                </div>
                
                {formData.image && (
                  <div className="image-status">
                    <small>Image has been uploaded</small>
                  </div>
                )}

                {capturedImage && (
                  <div className="captured-image-preview">
                    <img src={capturedImage} alt="Captured" className="preview-image" />
                    <button
                      type="button"
                      onClick={removeCapturedImage}
                      className="remove-image-btn"
                    >
                      ❌ Remove
                    </button>
                  </div>
                )}
                
                <small className="form-help">Upload a photo or capture one to help us understand the issue better (Max 20MB)</small>
              </div>

              {successMessage && (
                <div className="success-message animated">
                  <div className="success-content">
                    <span className="success-icon"><i class="fa-solid fa-thumbs-up"></i></span>
                    <p>{successMessage}</p>
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                className="submit-button"
                disabled={isLoading}
              >
                {isLoading ? 'Submitting...' : 'Submit Complaint'}
              </button>
            </form>
          </div>

          <div className="complaints-info">
            <div className="info-card">
              <h3>Why Report Complaints?</h3>
              <ul>
                <li>Help authorities identify problem areas</li>
                <li>Contribute to cleaner neighborhoods</li>
                <li>Track resolution progress</li>
                <li>Build a better community together</li>
              </ul>
            </div>

            <div className="info-card">
              <h3>What Happens Next?</h3>
              <ol>
                <li>We review your complaint</li>
                <li>Forward to relevant authorities</li>
                <li>Track resolution progress</li>
                <li>Notify you of updates</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <div className="camera-modal">
          <div className="camera-modal-content">
            <div className="camera-header">
              <h3>Capture Photo</h3>
              <button onClick={stopCamera} className="close-camera-btn">✕</button>
            </div>
            <div className="camera-container">
              <video
                id="camera-video"
                autoPlay
                playsInline
                muted
                className="camera-video"
                ref={(video) => {
                  if (video && cameraStream) {
                    video.srcObject = cameraStream;
                  }
                }}
              />
              <div className="camera-controls">
                <button onClick={capturePhoto} className="capture-btn">
                  📷 Capture
                </button>
                <button onClick={stopCamera} className="cancel-btn">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
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
                  <li><a href="/" className="footer-link">Home</a></li>
                  <li><a href="/complaint" className="footer-link">File Complaint</a></li>
                  <li><a href="#about" className="footer-link">About Us</a></li>
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

export default Complaints
