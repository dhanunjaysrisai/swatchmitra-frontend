import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [statsSlide, setStatsSlide] = useState(0);
  const [isStatsHovered, setIsStatsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const carouselTrackRef = useRef(null);

  const { user, logout, isAuthenticated } = useAuth();

  const slides = [
    new URL("../images/indiaflag.jpg", import.meta.url).href,
    new URL("../images/modi.jpg", import.meta.url).href,
    new URL("../images/img1.png", import.meta.url).href,
    new URL("../images/cleanindia.jpg", import.meta.url).href,
  ];

  // Stats carousel data
  const statsData = [
    {
      image: new URL("../images/img2.png", import.meta.url).href,
      text: "Wrappers Cleaned: 10,000+",
    },
    {
      image: new URL("../images/img3.png", import.meta.url).href,
      text: "Coins Distributed: ₹50,000+",
    },
    {
      image: new URL("../images/img4.png", import.meta.url).href,
      text: "Active Citizens: 5,000+",
    },
    {
      image: new URL("../images/img5.png", import.meta.url).href,
      text: "Communities Impacted: 100+",
    },
    {
      image: new URL("../images/cleanindia.jpg", import.meta.url).href,
      text: "Cities Covered: 25+",
    },
  ];

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(intervalId);
  }, [slides.length]);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Auto-scroll stats carousel (pauses on hover)
  useEffect(() => {
    if (!isStatsHovered) {
      const intervalId = setInterval(() => {
        setStatsSlide((prev) => (prev + 1) % statsData.length);
      }, 3000);
      return () => clearInterval(intervalId);
    }
  }, [isStatsHovered, statsData.length]);

  // Typed text animation
  const phrases = [
    "One Step Towards Swachh Bharat.",
    "Small Acts, Big Impact.",
    "Clean Streets, Bright Tomorrow.",
    "Every Wrapper Counts, Every Citizen Matters.",
  ];

  useEffect(() => {
    const currentPhrase = phrases[phraseIndex % phrases.length];
    const typingSpeed = isDeleting ? 30 : 80;
    const pauseAtFullMs = 1200;
    const pauseAtEmptyMs = 300;

    let timerId;

    if (!isDeleting && typedText === currentPhrase) {
      timerId = setTimeout(() => setIsDeleting(true), pauseAtFullMs);
    } else if (isDeleting && typedText === "") {
      timerId = setTimeout(() => {
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % phrases.length);
      }, pauseAtEmptyMs);
    } else {
      timerId = setTimeout(() => {
        const nextLength = typedText.length + (isDeleting ? -1 : 1);
        setTypedText(currentPhrase.slice(0, nextLength));
      }, typingSpeed);
    }

    return () => clearTimeout(timerId);
  }, [typedText, isDeleting, phraseIndex]);

  const closeMenu = () => setMenuOpen(false);

  // Mobile navigation functions
  const goToPrevSlide = () => {
    setStatsSlide((prev) => (prev - 1 + statsData.length) % statsData.length);
  };

  const goToNextSlide = () => {
    setStatsSlide((prev) => (prev + 1) % statsData.length);
  };

  return (
    <>
      <header className="site-navbar">
        <div className="site-navbar__inner">
          <button
            className={`site-navbar__toggle${menuOpen ? " is-open" : ""}`}
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
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
                <Link to="/dashboard">Dashboard</Link>
                <span style={{ color: "black", margin: "0 10px" }}>
                  Welcome, {user?.name}
                </span>
                <button
                  onClick={logout}
                  style={{
                    background: "none",
                    border: "none",
                    color: "black",
                    cursor: "pointer",
                    textDecoration: "underline",
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
      <div className={`site-drawer${menuOpen ? " is-open" : ""}`}>
        <nav className="site-drawer__nav" onClick={closeMenu}>
          <Link to="/">Home</Link>
          <Link to="/rewards">Rewards</Link>
          <Link to="/complaints">Complaints</Link>
          <Link to="/mission">Mission</Link>
          <Link to="/contact">Contact</Link>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" onClick={closeMenu}>
                Dashboard
              </Link>
              <span style={{ color: "black", display: "block" }}>
                Welcome, {user?.name}
              </span>
              <button
                onClick={() => {
                  logout();
                  closeMenu();
                }}
                style={{
                  display: "flex",
                  justifyContent: "left",
                  background: "none",
                  border: "none",
                  color: "black",
                  cursor: "pointer",
                  textDecoration: "none",
                  fontSize: "inherit",
                  fontFamily: "inherit",
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
      {menuOpen && (
        <div className="site-drawer__backdrop" onClick={closeMenu} />
      )}

      {/* Slideshow below navbar */}
      <section className="slideshow" aria-label="Homepage highlights">
        {slides.map((src, index) => (
          <div
            key={src}
            className={`slideshow__slide${index === currentSlide ? " is-active" : ""}`}
            role="img"
            aria-label={`Slide ${index + 1}`}
            style={{ backgroundImage: `url(${src})` }}
          />
        ))}
        <div className="slideshow__overlay" />
        <div className="slideshow__content">
          <h2 className="slideshow__title">
            {typedText}
            <span className="slideshow__caret" aria-hidden="true">
              |
            </span>
          </h2>
        </div>
        <div
          className="slideshow__dots"
          role="tablist"
          aria-label="Choose slide"
        >
          {slides.map((_, index) => (
            <button
              key={index}
              className={`slideshow__dot${index === currentSlide ? " is-active" : ""}`}
              aria-label={`Go to slide ${index + 1}`}
              aria-selected={index === currentSlide}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </section>

      {/* Tricolor gradient divider */}
      <div className="section-divider" aria-hidden="true" />

      {/* About Section */}
      <section id="about" className="about">
        <div className="about__inner">
          <div className="about__media">
            <img
              src={new URL("../images/missionimg.jpg", import.meta.url).href}
              alt="Children participating in cleanliness drive"
              className="about__img"
              loading="lazy"
            />
          </div>
          <div className="about__content">
            <h2 className="about__title">SWACHHMITRA MISSION</h2>
            <p className="about__text">
              The core goal of SwachhMitra is to motivate citizens to
              responsibly dispose of waste by rewarding them with coins,
              fostering accountability, community engagement, and supporting
              India's Swachh Bharat Mission.
            </p>
          </div>
        </div>
      </section>
      <div className="section-divider" aria-hidden="true" />

      {/* How SwachhMitra Works - Flow Chart */}
      <section className="flow-section" id="how-it-works">
        <div className="flow-container">
          <div className="flow-header">
            <h2 className="flow-title">How SwachhMitra Works</h2>
            <p className="flow-subtitle">Simple Steps, Big Impact</p>
          </div>

          <div className="flow-grid" role="list">
            {/* Step 1 */}
            <motion.div
              role="listitem"
              className="flow-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flow-icon" aria-hidden>
                📱
              </div>
              <h3 className="flow-step-title">User Action</h3>
              <p className="flow-step-text">
                Click a photo of trash or wrappers
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              role="listitem"
              className="flow-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flow-icon" aria-hidden>
                ☁️🔍
              </div>
              <h3 className="flow-step-title">Upload & Verification</h3>
              <p className="flow-step-text">
                Upload the image – AI verifies trash & barcode
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              role="listitem"
              className="flow-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7 }}
            >
              <div className="flow-icon" aria-hidden>
                🪙
              </div>
              <h3 className="flow-step-title">Earn Rewards</h3>
              <p className="flow-step-text">
                Earn coins for every verified trash photo
              </p>
            </motion.div>

            {/* Step 4 */}
            <motion.div
              role="listitem"
              className="flow-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flow-icon" aria-hidden>
                📝👥
              </div>
              <h3 className="flow-step-title">Community & Complaints</h3>
              <p className="flow-step-text">
                Submit complaints & join clean-up drives
              </p>
            </motion.div>

            {/* Step 5 */}
            <motion.div
              role="listitem"
              className="flow-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.9 }}
            >
              <div className="flow-icon" aria-hidden>
                🇮🇳✨
              </div>
              <h3 className="flow-step-title">Impact & Goal</h3>
              <p className="flow-step-text">
                Together, we build a cleaner India!
              </p>
            </motion.div>
          </div>

          <div className="flow-cta">
            <Link to="/mission" className="flow-cta-button">
              Join the Movement
            </Link>
          </div>
        </div>
      </section>
      <div className="section-divider" aria-hidden="true" />

      {/* Statistics Section */}
      <section className="stats-section">
        <div className="stats-carousel-container">
          {/* Mobile Navigation Arrows */}
          {isMobile && (
            <>
              <button
                className="stats-nav-arrow stats-nav-arrow--left"
                onClick={goToPrevSlide}
                aria-label="Previous slide"
              >
                ‹
              </button>
              <button
                className="stats-nav-arrow stats-nav-arrow--right"
                onClick={goToNextSlide}
                aria-label="Next slide"
              >
                ›
              </button>
            </>
          )}

          <div
            ref={carouselTrackRef}
            className="stats-carousel-track"
            onMouseEnter={() => setIsStatsHovered(true)}
            onMouseLeave={() => setIsStatsHovered(false)}
            style={
              isMobile
                ? {
                    transform: `translateX(-${statsSlide * 220}px)`,
                  }
                : {}
            }
          >
            {statsData.map((stat, index) => {
              const isActive = index === statsSlide;
              let transform = "";
              let zIndex = 1;
              let opacity = 0.8;

              if (isMobile) {
                // Mobile: center the active slide with side images visible
                if (isActive) {
                  transform = "scale(1.1)";
                  zIndex = 3;
                  opacity = 1;
                } else {
                  transform = "scale(0.9)";
                  zIndex = 1;
                  opacity = 0.7;
                }
              } else {
                // Desktop: original behavior
                if (isActive) {
                  transform = "translateY(-20px) scale(1.05)";
                  zIndex = 3;
                  opacity = 1;
                } else {
                  transform = "translateY(0) scale(1)";
                  zIndex = 1;
                  opacity = 0.8;
                }
              }

              return (
                <div
                  key={index}
                  className="stats-carousel-slide"
                  style={{
                    transform,
                    zIndex,
                    opacity,
                  }}
                >
                  <img
                    src={stat.image}
                    alt={stat.text}
                    className="stats-image"
                  />
                  <div className="stats-text">{stat.text}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Desktop dots - hidden on mobile */}
        {!isMobile && (
          <div className="stats-dots">
            {statsData.map((_, index) => (
              <button
                key={index}
                className={`stats-dot ${index === statsSlide ? "active" : ""}`}
                onClick={() => setStatsSlide(index)}
                aria-label={`Go to stats slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </section>
      <div className="section-divider" aria-hidden="true" />

      {/* Complaint Box Advertisement Section */}
      <section className="complaint-section">
        <div className="complaint-video-container">
          <video className="complaint-video" autoPlay muted loop playsInline>
            <source
              src={
                new URL("../videos/complaient_video.mp4", import.meta.url).href
              }
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>

          <div className="complaint-overlay">
            <div className="complaint-overlay-content">
              <h2 className="complaint-heading">
                Raise Your Voice, Make Change Happen
              </h2>
              <p className="complaint-description">
                Every citizen matters. With our Complaint Box, you can report
                problems around you—whether it's sanitation, infrastructure, or
                safety. Upload a photo, add your address, and let's build a
                cleaner, safer India together.
              </p>
              <div className="complaint-actions">
                <Link to="/complaints" className="complaint-button">
                  File a Complaint
                </Link>
                <button
                  className="video-mute-button"
                  onClick={(e) => {
                    const video = e.target
                      .closest(".complaint-video-container")
                      .querySelector("video");
                    video.muted = !video.muted;
                    e.target.textContent = video.muted ? "🔇" : "🔊";
                  }}
                  aria-label="Toggle video sound"
                >
                  🔇
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="section-divider" aria-hidden="true" />

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-brand">
              <h3 className="footer-title">SwachhMitra</h3>
              <p className="footer-tagline">
                Building a Cleaner, Safer India Together
              </p>
            </div>

            <div className="footer-links">
              <div className="footer-section">
                <h4 className="footer-section-title">Quick Links</h4>
                <ul className="footer-list">
                  <li>
                    <Link to="/" className="footer-link">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link to="/complaint" className="footer-link">
                      File Complaint
                    </Link>
                  </li>
                  <li>
                    <a href="#about" className="footer-link">
                      About Us
                    </a>
                  </li>
                  <li>
                    <a href="#contact" className="footer-link">
                      Contact
                    </a>
                  </li>
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
                  <a
                    href="https://instagram.com/swachhmitra"
                    className="social-link"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                  >
                    <svg
                      className="social-icon"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                  <a
                    href="https://twitter.com/swachhmitra"
                    className="social-link"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Twitter"
                  >
                    <svg
                      className="social-icon"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                  </a>
                  <a
                    href="https://youtube.com/c/swachhmitra"
                    className="social-link"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="YouTube"
                  >
                    <svg
                      className="social-icon"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </a>
                  <a
                    href="mailto:support@swachhmitra.gov.in"
                    className="social-link"
                    aria-label="Email"
                  >
                    <svg
                      className="social-icon"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="footer-copyright">
              <p>
                &copy; 2024 SwachhMitra. All rights reserved. | Empowering
                citizens for a cleaner India
              </p>
            </div>
            <div className="footer-tricolor">
              <div className="tricolor-bar"></div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

export default App;
