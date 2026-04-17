import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import SuccessMessage from '../components/SuccessMessage'

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [validationError, setValidationError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  
  const { register, error, clearError } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    // Clear errors when user starts typing
    if (error) clearError()
    if (validationError) setValidationError('')
  }

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match')
      return false
    }
    if (formData.password.length < 6) {
      setValidationError('Password must be at least 6 characters long')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsLoading(true)
    
    try {
      const result = await register(formData.name, formData.email, formData.password)
      if (result.success) {
        setSuccessMessage('Registration successful! Please login to continue.')
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      }
    } catch (err) {
      console.error('Registration error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {successMessage && (
        <SuccessMessage 
          message={successMessage} 
          onClose={() => setSuccessMessage('')} 
        />
      )}
      <nav className="navbar">
        <div className="navbar__content">
          <div className="navbar__left">
            <img src="../images/slogon logo.png" alt="SwachhMitra Slogan" className="slogan-img" />
          </div>
          <div className="navbar__right">
            <img src="../images/swatchhmita logo.png" alt="SwachhMitra Logo" className="brand-img" />
          </div>
        </div>
      </nav>

      <div className="fullscreen-center">
        <div className="auth-layout">
          <div className="card auth-form">
            <h2 className="h2">Trash to Treasure, Together. <br />Registration</h2>
            <form className="mt-8 stack" onSubmit={handleSubmit}>
              {(error || validationError) && (
                <div className="error-message" style={{ color: 'red', marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#ffe6e6', borderRadius: '4px' }}>
                  {error || validationError}
                </div>
              )}
              
              <div className="stack">
                <div>
                  <label htmlFor="name" className="label">Full Name</label>
                  <input 
                    id="name" 
                    name="name" 
                    type="text" 
                    required 
                    className="input" 
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="label">Email Address</label>
                  <input 
                    id="email" 
                    name="email" 
                    type="email" 
                    required 
                    className="input" 
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="label">Password</label>
                  <input 
                    id="password" 
                    name="password" 
                    type="password" 
                    required 
                    className="input" 
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="label">Confirm Password</label>
                  <input 
                    id="confirmPassword" 
                    name="confirmPassword" 
                    type="password" 
                    required 
                    className="input" 
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <button type="submit" className="button" disabled={isLoading}>
                  {isLoading ? 'Registering...' : 'Register'}
                </button>
              </div>

              <div className="text-center">
                <p className="text-muted">
                  Already have an account? <Link to="/login">Login</Link>
                </p>
              </div>
            </form>
          </div>

          <div className="auth-media">
            <video
              className="auth-video"
              src="../videos/onesteplogo.mp4"
              autoPlay
              muted
              loop
              playsInline
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default Register
