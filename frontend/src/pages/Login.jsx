import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  
  const { login, error, clearError } = useAuth()
  const navigate = useNavigate()

  // Auto-dismiss error after 3 seconds
  useEffect(() => {
    if (!error) return
    const timer = setTimeout(() => {
      clearError()
    }, 3000)
    return () => clearTimeout(timer)
  }, [error, clearError])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    // Clear error when user starts typing
    if (error) clearError()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const result = await login(formData.email, formData.password)
      if (result.success) {
        navigate('/')
      }
    } catch (err) {
      console.error('Login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <nav className="navbar">
        <div className="navbar__content">
          <div className="navbar__left">
            <img src={new URL('../images/slogon logo.png', import.meta.url).href} alt="SwachhMitra Slogan" className="slogan-img" />
          </div>
          <div className="navbar__right">
            <img src={new URL('../images/swatchhmita logo.png', import.meta.url).href} alt="SwachhMitra Logo" className="brand-img" />
          </div>
        </div>
      </nav>

      <div className="fullscreen-center">
        <div className="auth-layout">
          <div className="card auth-form">
            <h2 className="h2">SwachhMitra - Login</h2>
            <form className="mt-8 stack" onSubmit={handleSubmit}>
              {error && (
                <div className="error-message" style={{ color: 'red', marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#ffe6e6', borderRadius: '4px' }}>
                  {error}
                </div>
              )}
              
              <div className="stack">
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
              </div>

              <div>
                <button type="submit" className="button" disabled={isLoading}>
                  {isLoading ? 'Logging in...' : 'Login'}
                </button>
              </div>

              <div className="text-center">
                <p className="text-muted">
                  Don't have an account? <Link to="/register">Register</Link>
                </p>
            a  </div>
            </form>
          </div>

          <div className="auth-media">
            <video
              className="auth-video"
              src={new URL('../videos/maplogo.mp4', import.meta.url).href}
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

export default Login
