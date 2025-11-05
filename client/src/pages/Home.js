import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: '🔐',
      title: 'Secure Storage',
      description: 'Your medical records are encrypted and stored securely with industry-standard security measures.'
    },
    {
      icon: '📱',
      title: 'Access Anywhere',
      description: 'Access your medical records from any device, anywhere, anytime with our responsive web application.'
    },
    {
      icon: '💊',
      title: 'Medicine Reminders',
      description: 'Set up automated reminders for medications and never miss a dose again.'
    },
    {
      icon: '📊',
      title: 'Health Tracking',
      description: 'Track your health metrics, BMI, and get personalized health tips and recommendations.'
    },
    {
      icon: '🚨',
      title: 'Emergency Info',
      description: 'Store emergency contacts, allergies, and critical medical information for quick access.'
    },
    {
      icon: '🤖',
      title: 'Health Chatbot',
      description: 'Get instant answers to basic health questions from our intelligent health assistant.'
    }
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Secure Medical Record Storage
              </h1>
              <p className="hero-subtitle">
                Store, organize, and access your medical records safely. 
                Get health reminders, tips, and emergency information all in one place.
              </p>
              <div className="hero-actions">
                {user ? (
                  <Link to="/dashboard" className="btn btn-primary">
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="btn btn-primary">
                      Get Started
                    </Link>
                    <Link to="/login" className="btn btn-secondary">
                      Sign In
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="hero-image">
              <div className="hero-graphic">
                <span className="graphic-icon">🏥</span>
                <span className="graphic-icon">📋</span>
                <span className="graphic-icon">💊</span>
                <span className="graphic-icon">📱</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Why Choose SecureMed?</h2>
            <p className="section-subtitle">
              Comprehensive health management with security and simplicity at its core
            </p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="security-section">
        <div className="container">
          <div className="security-content">
            <div className="security-text">
              <h2 className="security-title">Your Privacy is Our Priority</h2>
              <p className="security-description">
                We use end-to-end encryption, secure authentication, and follow healthcare 
                industry standards to ensure your medical information remains private and protected.
              </p>
              <ul className="security-features">
                <li>🔒 End-to-end encryption</li>
                <li>🛡️ HIPAA compliant security</li>
                <li>🔐 Secure user authentication</li>
                <li>📱 Multi-device synchronization</li>
                <li>🔄 Regular security updates</li>
              </ul>
            </div>
            <div className="security-visual">
              <div className="security-graphic">
                <span className="security-shield">🛡️</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="cta-section">
          <div className="container">
            <div className="cta-content">
              <h2 className="cta-title">Ready to Secure Your Health Records?</h2>
              <p className="cta-description">
                Join thousands of users who trust SecureMed with their medical information.
              </p>
              <Link to="/register" className="btn btn-primary btn-lg">
                Start Free Today
              </Link>
            </div>
          </div>
        </section>
      )}

      <style jsx>{`
        .home-page {
          min-height: 100vh;
        }

        .hero {
          padding: 4rem 0;
          background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
          color: white;
        }

        .hero-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          line-height: 1.2;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          margin-bottom: 2rem;
          opacity: 0.9;
          line-height: 1.6;
        }

        .hero-actions {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .hero-image {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .hero-graphic {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          padding: 2rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 1rem;
          backdrop-filter: blur(10px);
        }

        .graphic-icon {
          font-size: 3rem;
          text-align: center;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 0.5rem;
        }

        .features {
          padding: 4rem 0;
          background-color: var(--surface-color);
        }

        .section-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .section-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: var(--text-color);
        }

        .section-subtitle {
          font-size: 1.125rem;
          color: var(--text-secondary);
          max-width: 600px;
          margin: 0 auto;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .feature-card {
          background-color: var(--background-color);
          padding: 2rem;
          border-radius: 1rem;
          border: 1px solid var(--border-color);
          text-align: center;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-lg);
        }

        .feature-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .feature-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: var(--text-color);
        }

        .feature-description {
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .security-section {
          padding: 4rem 0;
        }

        .security-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }

        .security-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          color: var(--text-color);
        }

        .security-description {
          font-size: 1.125rem;
          color: var(--text-secondary);
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .security-features {
          list-style: none;
        }

        .security-features li {
          padding: 0.5rem 0;
          font-size: 1.125rem;
          color: var(--text-color);
        }

        .security-visual {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .security-graphic {
          width: 200px;
          height: 200px;
          background: linear-gradient(135deg, var(--success-color) 0%, var(--primary-color) 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-lg);
        }

        .security-shield {
          font-size: 4rem;
          color: white;
        }

        .cta-section {
          padding: 4rem 0;
          background: linear-gradient(135deg, var(--success-color) 0%, var(--primary-color) 100%);
          color: white;
        }

        .cta-content {
          text-align: center;
        }

        .cta-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }

        .cta-description {
          font-size: 1.125rem;
          margin-bottom: 2rem;
          opacity: 0.9;
        }

        .btn-lg {
          padding: 1rem 2rem;
          font-size: 1.125rem;
        }

        @media (max-width: 768px) {
          .hero-content,
          .security-content {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .hero-title {
            font-size: 2.5rem;
          }

          .section-title,
          .security-title,
          .cta-title {
            font-size: 2rem;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }

          .hero-actions {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;