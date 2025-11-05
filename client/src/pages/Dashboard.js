import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalRecords: 0,
    activeReminders: 0,
    emergencyContacts: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/users/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          setStats({
            totalRecords: response.data.totalRecords || 0,
            activeReminders: response.data.activeReminders || 0,
            emergencyContacts: response.data.emergencyContacts || 0
          });
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  const quickActions = [
    {
      title: 'Upload Medical Record',
      description: 'Add a new medical document or report',
      icon: '📋',
      link: '/medical-records',
      color: 'primary'
    },
    {
      title: 'Set Medicine Reminder',
      description: 'Create a new medication reminder',
      icon: '💊',
      link: '/reminders',
      color: 'success'
    },
    {
      title: 'Health Tools',
      description: 'BMI calculator and health tips',
      icon: '📊',
      link: '/health-tools',
      color: 'warning'
    },
    {
      title: 'Health Assistant',
      description: 'Chat with our health bot',
      icon: '🤖',
      link: '/chatbot',
      color: 'secondary'
    }
  ];

  const statsDisplay = [
    { label: 'Medical Records', value: stats.totalRecords, icon: '📋' },
    { label: 'Active Reminders', value: stats.activeReminders, icon: '💊' },
    { label: 'Emergency Contacts', value: stats.emergencyContacts, icon: '🚨' },
    { label: 'Days Since Last Login', value: '0', icon: '📅' }
  ];

  return (
    <div className="dashboard">
      <div className="container">
        {/* Welcome Section */}
        <div className="welcome-section">
          <div className="welcome-content">
            <h1 className="welcome-title">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="welcome-subtitle">
              Manage your health records and stay on top of your medical care.
            </p>
          </div>
          <div className="last-login">
            <span className="last-login-text">
              Last login: {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Today'}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          {statsDisplay.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-content">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="quick-actions-section">
          <h2 className="section-title">Quick Actions</h2>
          <div className="quick-actions-grid">
            {quickActions.map((action, index) => (
              <Link 
                key={index} 
                to={action.link} 
                className={`action-card action-${action.color}`}
              >
                <div className="action-icon">{action.icon}</div>
                <div className="action-content">
                  <h3 className="action-title">{action.title}</h3>
                  <p className="action-description">{action.description}</p>
                </div>
                <div className="action-arrow">→</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="recent-activity-section">
          <h2 className="section-title">Recent Activity</h2>
          <div className="activity-card">
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>No recent activity</h3>
              <p>Start by uploading your first medical record or setting up a reminder.</p>
              <Link to="/medical-records" className="btn btn-primary">
                Upload First Record
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dashboard {
          padding: 2rem 0;
          min-height: calc(100vh - 80px);
        }

        .welcome-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding: 2rem;
          background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
          border-radius: 1rem;
          color: white;
        }

        .welcome-title {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .welcome-subtitle {
          font-size: 1.125rem;
          opacity: 0.9;
        }

        .last-login-text {
          font-size: 0.875rem;
          opacity: 0.8;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .stat-card {
          background-color: var(--surface-color);
          border: 1px solid var(--border-color);
          border-radius: 0.75rem;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .stat-icon {
          font-size: 2rem;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-color);
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-color);
          margin-bottom: 1.5rem;
        }

        .quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .action-card {
          background-color: var(--surface-color);
          border: 1px solid var(--border-color);
          border-radius: 0.75rem;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          text-decoration: none;
          color: var(--text-color);
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }

        .action-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-lg);
        }

        .action-card.action-primary::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background-color: var(--primary-color);
        }

        .action-card.action-success::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background-color: var(--success-color);
        }

        .action-card.action-warning::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background-color: var(--warning-color);
        }

        .action-card.action-secondary::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background-color: var(--secondary-color);
        }

        .action-icon {
          font-size: 2rem;
          flex-shrink: 0;
        }

        .action-content {
          flex: 1;
        }

        .action-title {
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .action-description {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .action-arrow {
          font-size: 1.25rem;
          opacity: 0.6;
          transition: transform 0.2s ease;
        }

        .action-card:hover .action-arrow {
          transform: translateX(5px);
        }

        .activity-card {
          background-color: var(--surface-color);
          border: 1px solid var(--border-color);
          border-radius: 0.75rem;
          padding: 3rem;
        }

        .empty-state {
          text-align: center;
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .empty-state h3 {
          color: var(--text-color);
          margin-bottom: 0.5rem;
        }

        .empty-state p {
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
        }

        @media (max-width: 768px) {
          .welcome-section {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .stats-grid {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          }

          .quick-actions-grid {
            grid-template-columns: 1fr;
          }

          .welcome-title {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;