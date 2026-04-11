import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { loadRewards } from '../services/rewardService'
import './rewards.css'

function Rewards() {
  const { user, isAuthenticated, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const userKey = useMemo(() => user?._id || user?.email || 'anon', [user])
  const [rewards, setRewards] = useState(() => loadRewards(userKey))

  useEffect(() => {
    setRewards(loadRewards(userKey))
  }, [userKey])

  const closeMenu = () => setMenuOpen(false)

  const topEvent = rewards.events[0]
  const hasRewards = rewards.totalPoints > 0

  const formatWhen = (iso) => {
    try {
      return new Date(iso).toLocaleString()
    } catch {
      return ''
    }
  }

  return (
    <>
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
                    textDecoration: 'underline',
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
                  fontFamily: 'inherit',
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

      <main className="rewards-page">
        <section className="rewards-hero">
          <h1 className="rewards-title">Your Rewards</h1>
          <p className="rewards-subtitle">
            Earn points by clicking photos in Mission. Your total updates automatically.
          </p>

          <div className="rewards-total">
            <span className="rewards-total-number">{rewards.totalPoints}</span>
            <span className="rewards-total-unit">points</span>
          </div>

          {hasRewards && topEvent && (
            <div className="rewards-last">
              <div className="rewards-last-label">Last reward</div>
              <div className="rewards-last-value">
                {topEvent.points} points • {topEvent.percent}% confidence
              </div>
              <div className="rewards-last-time">{formatWhen(topEvent.at)}</div>
            </div>
          )}

          {!hasRewards && (
            <div className="rewards-empty">
              <div className="rewards-empty-title">No rewards yet</div>
              <div className="rewards-empty-text">
                Upload a photo from the Mission page to earn your first scratch reward.
              </div>
              <Link to="/mission" className="rewards-cta">
                Go to Mission
              </Link>
            </div>
          )}
        </section>

        <section className="rewards-history">
          <h2 className="rewards-history-title">Recent Rewards</h2>
          {rewards.events.length === 0 ? (
            <div className="rewards-history-empty">Nothing to show yet.</div>
          ) : (
            <div className="rewards-grid">
              {rewards.events.map((ev) => (
                <div className="rewards-card" key={ev.id}>
                  <div className="rewards-card-top">
                    <div className="rewards-card-points">{ev.points} pts</div>
                    <div className="rewards-card-percent">{ev.percent}%</div>
                  </div>
                  <div className="rewards-card-label">
                    {ev.label ? `Prediction: ${ev.label}` : 'Prediction'}
                  </div>
                  <div className="rewards-card-time">{formatWhen(ev.at)}</div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  )
}

export default Rewards

