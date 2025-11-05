import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { register, user } = useAuth();
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
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, number, and special character';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    const result = await register(formData.name, formData.email, formData.password);
    
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
              <h1 className="auth-title">Create Account</h1>
              <p className="auth-subtitle">Join SecureMed to protect your health records</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`form-input ${errors.name ? 'error' : ''}`}
                  placeholder="Enter your full name"
                  required
                />
                {errors.name && <div className="form-error">{errors.name}</div>}
              </div>

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
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="Enter your email"
                  required
                />
                {errors.email && <div className="form-error">{errors.email}</div>}
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
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder="Create a strong password"
                  required
                />
                {errors.password && <div className="form-error">{errors.password}</div>}
                <div className="password-requirements">
                  <p>Password must contain:</p>
                  <ul>
                    <li className={/[a-z]/.test(formData.password) ? 'valid' : ''}>
                      One lowercase letter
                    </li>
                    <li className={/[A-Z]/.test(formData.password) ? 'valid' : ''}>
                      One uppercase letter
                    </li>
                    <li className={/\d/.test(formData.password) ? 'valid' : ''}>
                      One number
                    </li>
                    <li className={/[@$!%*?&]/.test(formData.password) ? 'valid' : ''}>
                      One special character
                    </li>
                    <li className={formData.password.length >= 8 ? 'valid' : ''}>
                      At least 8 characters
                    </li>
                  </ul>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                  placeholder="Confirm your password"
                  required
                />
                {errors.confirmPassword && <div className="form-error">{errors.confirmPassword}</div>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary auth-submit"
              >
                {isLoading ? (
                  <span className="loading-text">
                    <span className="spinner-small"></span>
                    Creating Account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <div className="auth-footer">
              <p>
                Already have an account?{' '}
                <Link to="/login" className="auth-link">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>

          <div className="auth-info">
            <div className="info-card">
              <h3>Why Join SecureMed?</h3>
              <div className="benefits">
                <div className="benefit">
                  <span className="benefit-icon">🔒</span>
                  <div>
                    <h4>Secure Storage</h4>
                    <p>Your medical records are encrypted and protected</p>
                  </div>
                </div>
                <div className="benefit">
                  <span className="benefit-icon">💊</span>
                  <div>
                    <h4>Medicine Reminders</h4>
                    <p>Never miss a dose with automated reminders</p>
                  </div>
                </div>
                <div className="benefit">
                  <span className="benefit-icon">📱</span>
                  <div>
                    <h4>Access Anywhere</h4>
                    <p>View your records from any device, anytime</p>
                  </div>
                </div>
                <div className="benefit">
                  <span className="benefit-icon">🤖</span>
                  <div>
                    <h4>Health Assistant</h4>
                    <p>Get instant answers to health questions</p>
                  </div>
                </div>
              </div>
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
          align-items: start;
          max-width: 1200px;
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

        .form-input.error {
          border-color: var(--error-color);
        }

        .form-error {
          color: var(--error-color);
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }

        .password-requirements {
          margin-top: 0.5rem;
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .password-requirements p {
          margin-bottom: 0.5rem;
          font-weight: 500;
        }

        .password-requirements ul {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .password-requirements li {
          padding: 0.125rem 0;
          transition: color 0.2s ease;
        }

        .password-requirements li.valid {
          color: var(--success-color);
        }

        .password-requirements li.valid::before {
          content: '✓ ';
          font-weight: bold;
        }

        .password-requirements li:not(.valid)::before {
          content: '• ';
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
          margin-bottom: 1.5rem;
          text-align: center;
        }

        .benefits {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .benefit {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }

        .benefit-icon {
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .benefit h4 {
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .benefit p {
          opacity: 0.9;
          margin: 0;
          line-height: 1.4;
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

export default Register;