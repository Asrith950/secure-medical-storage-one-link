import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          {/* Logo */}
          <Link to="/" className="navbar-brand">
            <span className="brand-icon">🏥</span>
            SecureMed
          </Link>

          {/* Desktop Navigation */}
          <div className="navbar-nav desktop-nav">
            {user ? (
              <>
                <Link to="/dashboard" className="nav-link">Dashboard</Link>
                <Link to="/medical-records" className="nav-link">Records</Link>
                <Link to="/reminders" className="nav-link">Reminders</Link>
                <Link to="/health-tools" className="nav-link">Health Tools</Link>
                <Link to="/chatbot" className="nav-link">Chatbot</Link>
              </>
            ) : (
              <>
                <Link to="/" className="nav-link">Home</Link>
                <Link to="/login" className="nav-link">Login</Link>
                <Link to="/register" className="nav-link">Register</Link>
              </>
            )}
          </div>

          {/* Right side controls */}
          <div className="navbar-controls">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="theme-toggle"
              aria-label="Toggle theme"
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>

            {/* User Menu */}
            {user && (
              <div className="user-menu">
                <button className="user-button">
                  <span className="user-avatar">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="user-name">{user.name}</span>
                </button>
                <div className="user-dropdown">
                  <Link to="/profile" className="dropdown-item">Profile</Link>
                  <Link to="/emergency-info" className="dropdown-item">Emergency Info</Link>
                  <button onClick={handleLogout} className="dropdown-item">
                    Logout
                  </button>
                </div>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button 
              className="mobile-menu-toggle"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              <span className={`hamburger ${isMenuOpen ? 'open' : ''}`}>
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`mobile-nav ${isMenuOpen ? 'open' : ''}`}>
          {user ? (
            <>
              <Link to="/dashboard" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                Dashboard
              </Link>
              <Link to="/medical-records" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                Medical Records
              </Link>
              <Link to="/reminders" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                Reminders
              </Link>
              <Link to="/health-tools" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                Health Tools
              </Link>
              <Link to="/chatbot" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                Chatbot
              </Link>
              <Link to="/profile" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                Profile
              </Link>
              <Link to="/emergency-info" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                Emergency Info
              </Link>
              <button onClick={handleLogout} className="mobile-nav-link">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                Home
              </Link>
              <Link to="/login" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                Login
              </Link>
              <Link to="/register" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                Register
              </Link>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background-color: var(--surface-color);
          border-bottom: 1px solid var(--border-color);
          z-index: 1000;
          box-shadow: var(--shadow-sm);
        }

        .navbar-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 0;
        }

        .navbar-brand {
          display: flex;
          align-items: center;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--primary-color);
          text-decoration: none;
          gap: 0.5rem;
        }

        .brand-icon {
          font-size: 1.75rem;
        }

        .desktop-nav {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .nav-link {
          color: var(--text-color);
          text-decoration: none;
          font-weight: 500;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          transition: all 0.2s ease;
        }

        .nav-link:hover {
          background-color: var(--primary-color);
          color: white;
        }

        .navbar-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .theme-toggle {
          background: none;
          border: none;
          font-size: 1.25rem;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 0.5rem;
          transition: background-color 0.2s ease;
        }

        .theme-toggle:hover {
          background-color: var(--border-color);
        }

        .user-menu {
          position: relative;
        }

        .user-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 0.5rem;
          transition: background-color 0.2s ease;
          color: var(--text-color);
        }

        .user-button:hover {
          background-color: var(--border-color);
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: var(--primary-color);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
        }

        .user-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          background-color: var(--surface-color);
          border: 1px solid var(--border-color);
          border-radius: 0.5rem;
          box-shadow: var(--shadow-lg);
          min-width: 150px;
          opacity: 0;
          visibility: hidden;
          transform: translateY(-10px);
          transition: all 0.2s ease;
        }

        .user-menu:hover .user-dropdown {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .dropdown-item {
          display: block;
          width: 100%;
          padding: 0.75rem 1rem;
          color: var(--text-color);
          text-decoration: none;
          border: none;
          background: none;
          text-align: left;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .dropdown-item:hover {
          background-color: var(--border-color);
        }

        .mobile-menu-toggle {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
        }

        .hamburger {
          display: flex;
          flex-direction: column;
          width: 24px;
          height: 18px;
          justify-content: space-between;
        }

        .hamburger span {
          display: block;
          height: 2px;
          background-color: var(--text-color);
          transition: all 0.3s ease;
        }

        .hamburger.open span:nth-child(1) {
          transform: translateY(8px) rotate(45deg);
        }

        .hamburger.open span:nth-child(2) {
          opacity: 0;
        }

        .hamburger.open span:nth-child(3) {
          transform: translateY(-8px) rotate(-45deg);
        }

        .mobile-nav {
          display: none;
          padding: 1rem 0;
          border-top: 1px solid var(--border-color);
        }

        .mobile-nav.open {
          display: block;
        }

        .mobile-nav-link {
          display: block;
          padding: 0.75rem 0;
          color: var(--text-color);
          text-decoration: none;
          font-weight: 500;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
          cursor: pointer;
        }

        .mobile-nav-link:hover {
          color: var(--primary-color);
        }

        @media (max-width: 768px) {
          .desktop-nav {
            display: none;
          }

          .mobile-menu-toggle {
            display: block;
          }

          .user-name {
            display: none;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;