import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate('/dashboard');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <h1 className="auth-title">Welcome Back</h1>
              <p className="auth-subtitle">Sign in to access your medical records</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter your password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary auth-submit"
              >
                {isLoading ? (
                  <span className="loading-text">
                    <span className="spinner-small"></span>
                    Signing In...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="auth-footer">
              <p>
                Don't have an account?{' '}
                <Link to="/register" className="auth-link">
                  Create one here
                </Link>
              </p>
            </div>
          </div>

          <div className="auth-info">
            <div className="info-card">
              <h3>Secure Access</h3>
              <p>
                Your medical records are protected with enterprise-grade security. 
                We use advanced encryption to keep your health information safe.
              </p>
              <ul className="security-features">
                <li>🔒 256-bit encryption</li>
                <li>🛡️ HIPAA compliant</li>
                <li>🔐 Secure authentication</li>
                <li>📱 Multi-device access</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          padding: 2rem 0;
          background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
        }

        .auth-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
          max-width: 1000px;
          margin: 0 auto;
        }

        .auth-card {
          background-color: var(--background-color);
          padding: 3rem;
          border-radius: 1rem;
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--border-color);
        }

        .auth-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .auth-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--text-color);
          margin-bottom: 0.5rem;
        }

        .auth-subtitle {
          color: var(--text-secondary);
          font-size: 1.125rem;
        }

        .auth-form {
          margin-bottom: 2rem;
        }

        .auth-submit {
          width: 100%;
          margin-top: 1rem;
        }

        .loading-text {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .auth-footer {
          text-align: center;
          color: var(--text-secondary);
        }

        .auth-link {
          color: var(--primary-color);
          text-decoration: none;
          font-weight: 500;
        }

        .auth-link:hover {
          text-decoration: underline;
        }

        .auth-info {
          color: white;
        }

        .info-card {
          background: rgba(255, 255, 255, 0.1);
          padding: 2rem;
          border-radius: 1rem;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .info-card h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .info-card p {
          margin-bottom: 1.5rem;
          opacity: 0.9;
          line-height: 1.6;
        }

        .security-features {
          list-style: none;
        }

        .security-features li {
          padding: 0.5rem 0;
          opacity: 0.9;
        }

        @media (max-width: 768px) {
          .auth-container {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .auth-card {
            padding: 2rem;
          }

          .auth-title {
            font-size: 2rem;
          }

          .info-card {
            padding: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;