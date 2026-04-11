import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./dashboard.css";

function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-greeting">
            Welcome back, {user?.name || "SwachhMitra User"}!
          </p>
          <p className="dashboard-subtitle">
            Your personal hub for impact, rewards and reports.
          </p>
        </div>
        <button className="dashboard-logout" onClick={logout}>
          Logout
        </button>
      </header>

      <section className="dashboard-welcome-card">
        <h2>Account Summary</h2>
        <div className="dashboard-summary-grid">
          <div className="dashboard-summary-card">
            <span className="dashboard-summary-title">Name</span>
            <strong>{user?.name || "—"}</strong>
          </div>
          <div className="dashboard-summary-card">
            <span className="dashboard-summary-title">Email</span>
            <strong>{user?.email || "—"}</strong>
          </div>
          <div className="dashboard-summary-card">
            <span className="dashboard-summary-title">Status</span>
            <strong>Active</strong>
          </div>
        </div>
      </section>

      <section className="dashboard-actions">
        <h3>Quick Actions</h3>
        <div className="dashboard-action-grid">
          <Link to="/complaints" className="dashboard-action-card">
            <h4>Submit Complaint</h4>
            <p>Report local issues and help keep your area clean.</p>
          </Link>
          <Link to="/mission" className="dashboard-action-card">
            <h4>View Missions</h4>
            <p>Join community cleanups and earn rewards.</p>
          </Link>
          <Link to="/rewards" className="dashboard-action-card">
            <h4>Check Rewards</h4>
            <p>Track earned coins and available offers.</p>
          </Link>
        </div>
      </section>

      <section className="dashboard-info-panel">
        <div className="dashboard-panel-card">
          <h4>Impact Snapshot</h4>
          <p>
            Your actions help the Swachh Bharat movement grow stronger every
            day.
          </p>
          <ul>
            <li>Complaints submitted: 0</li>
            <li>Missions joined: 0</li>
            <li>Rewards coins: 0</li>
          </ul>
        </div>
        <div className="dashboard-panel-card">
          <h4>Next Steps</h4>
          <p>
            Keep using the app to earn more coins and improve local cleanliness.
          </p>
          <ol>
            <li>Submit a new complaint.</li>
            <li>Join a mission drive.</li>
            <li>Redeem your rewards.</li>
          </ol>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
