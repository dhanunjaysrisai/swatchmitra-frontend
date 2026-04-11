import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { motion } from 'framer-motion'
import './contact.css'

function Contact() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()

  const closeMenu = () => setMenuOpen(false)

  const teamMembers = [
    {
      id: 1,
      name: 'Prasanth',
      role: 'Lead Developer',
      email: 'prasanth@swachhmitra.dev',
      icon: '👨‍💻',
      description: 'Specializing in full-stack development and system architecture'
    },
    {
      id: 2,
      name: 'Dhanujay',
      role: 'Backend Engineer',
      email: 'dhanujay@swachhmitra.dev',
      icon: '⚙️',
      description: 'Expert in database design and API development'
    },
    {
      id: 3,
      name: 'Surya',
      role: 'Frontend Developer',
      email: 'surya@swachhmitra.dev',
      icon: '🎨',
      description: 'Creating beautiful and responsive user interfaces'
    },
    {
      id: 4,
      name: 'Rohit',
      role: 'UI/UX Designer',
      email: 'rohit@swachhmitra.dev',
      icon: '🖼️',
      description: 'Designing intuitive and engaging user experiences'
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut'
      }
    },
    hover: {
      y: -10,
      transition: {
        duration: 0.3
      }
    }
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
              <span style={{ color: 'black', display: 'block' }}>Welcome, {user?.name}</span>
              <button 
                onClick={() => {
                  logout()
                  closeMenu()
                }}
                style={{ 
                  display: 'flex',
                  justifyContent: 'left',
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
      <div className="contact-container">
        {/* Header Section */}
        <section className="contact-header">
          <motion.div 
            className="contact-header-content"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="contact-title">Meet Our Team</h1>
            <p className="contact-subtitle">
              Dedicated to building a cleaner India through innovation and citizen engagement
            </p>
          </motion.div>
          <div className="contact-header-divider" />
        </section>

        {/* Mission & Team Members Section - Combined */}
        <section className="team-section">
          <motion.div 
            className="mission-team-header"
            initial={{ opacity: 0, y: -30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="mission-icon">🇮🇳</div>
            <h2 className="mission-title">Our Mission</h2>
            <p className="mission-text">
              We are four final-year engineering students from <strong>SASI Institute of Technology and Engineering</strong> 
              who are passionate about creating a positive impact on society. SwachhMitra is our contribution to 
              <strong> India's Swachh Bharat Mission</strong>, a government initiative to promote cleanliness and hygiene across the nation.
            </p>
            <p className="mission-subtext">
              Through this platform, we empower citizens to report cleanliness issues, participate in cleanup drives, 
              and earn rewards while building a more accountable and responsible community.
            </p>
          </motion.div>

          <motion.h2 
            className="team-title"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Meet the Builders
          </motion.h2>

          <motion.div 
            className="team-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            {teamMembers.map((member) => (
              <motion.div
                key={member.id}
                className="team-card"
                variants={cardVariants}
                whileHover="hover"
              >
                <div className="card-inner">
                  <div className="card-icon">{member.icon}</div>
                  <h3 className="card-name">{member.name}</h3>
                  <p className="card-role">{member.role}</p>
                  <p className="card-description">{member.description}</p>
                  
                  <div className="card-contact">
                    <a href={`mailto:${member.email}`} className="card-email">
                      <span className="email-icon">✉️</span>
                      {member.email}
                    </a>
                  </div>

                  <div className="card-social">
                    <a href="#" className="social-icon" aria-label="GitHub">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                    </a>
                    <a href="#" className="social-icon" aria-label="LinkedIn">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Contact CTA Section */}
        <section className="contact-cta-section">
          <motion.div 
            className="cta-box"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="cta-title">Get in Touch</h2>
            <p className="cta-text">
              Have questions, suggestions, or want to collaborate? We'd love to hear from you!
            </p>
            <div className="contact-methods">
              <div className="contact-method">
                <span className="method-icon">📧</span>
                <h4>Email</h4>
                <p>support@swachhmitra.gov.in</p>
              </div>
              <div className="contact-method">
                <span className="method-icon">📞</span>
                <h4>Phone</h4>
                <p>+91 1800-123-4567</p>
              </div>
              <div className="contact-method">
                <span className="method-icon">📍</span>
                <h4>Location</h4>
                <p>SASI Institute of Technology and Engineering, India</p>
              </div>
              <div className="contact-method">
                <span className="method-icon">⏰</span>
                <h4>Support Hours</h4>
                <p>Monday - Friday, 9 AM - 6 PM IST</p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Call to Action */}
        <section className="contact-final-cta">
          <motion.div 
            className="final-cta-content"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2>Join Us in Building a Cleaner India</h2>
            <p>Be part of the Swachh Bharat Mission. Report issues, earn rewards, and make a difference.</p>
            <div className="cta-buttons">
              <Link to="/complaints" className="cta-button primary">
                File a Complaint
              </Link>
              <Link to="/" className="cta-button secondary">
                Learn More
              </Link>
            </div>
          </motion.div>
        </section>
      </div>

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
                  <li><Link to="/contact" className="footer-link">Contact Us</Link></li>
                  <li><Link to="/mission" className="footer-link">Mission</Link></li>
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
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417a9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
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

export default Contact
