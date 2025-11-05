import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';

const Reminders = () => {
  // eslint-disable-next-line no-unused-vars
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    medicineName: '',
    dosage: '',
    frequency: 'Once Daily',
    startDate: '',
    endDate: '',
    times: ['08:00'],
    notes: ''
  });
  const [isAdding, setIsAdding] = useState(false);

  const frequencies = [
    'Once Daily',
    'Twice Daily', 
    'Three Times Daily',
    'Four Times Daily',
    'Every 8 Hours',
    'Every 12 Hours',
    'As Needed',
    'Weekly'
  ];

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/reminders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Handle both array and object responses
      const remindersData = response.data.data || response.data;
      setReminders(Array.isArray(remindersData) ? remindersData : []);
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch reminders');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFrequencyChange = (e) => {
    const frequency = e.target.value;
    let defaultTimes = ['08:00'];
    
    switch(frequency) {
      case 'Twice Daily':
        defaultTimes = ['08:00', '20:00'];
        break;
      case 'Three Times Daily':
        defaultTimes = ['08:00', '14:00', '20:00'];
        break;
      case 'Four Times Daily':
        defaultTimes = ['08:00', '12:00', '16:00', '20:00'];
        break;
      case 'Every 8 Hours':
        defaultTimes = ['08:00', '16:00', '00:00'];
        break;
      case 'Every 12 Hours':
        defaultTimes = ['08:00', '20:00'];
        break;
      default:
        defaultTimes = ['08:00'];
    }

    setFormData({
      ...formData,
      frequency: frequency,
      times: defaultTimes
    });
  };

  const handleTimeChange = (index, value) => {
    const newTimes = [...formData.times];
    newTimes[index] = value;
    setFormData({
      ...formData,
      times: newTimes
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsAdding(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/reminders', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('Medication reminder added successfully!');
      setFormData({
        medicineName: '',
        dosage: '',
        frequency: 'Once Daily',
        startDate: '',
        endDate: '',
        times: ['08:00'],
        notes: ''
      });
      fetchReminders();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add reminder');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (reminderId) => {
    if (window.confirm('Are you sure you want to delete this reminder?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/reminders/${reminderId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Reminder deleted successfully!');
        fetchReminders();
      } catch (error) {
        setError('Failed to delete reminder');
      }
    }
  };

  const toggleReminderStatus = async (reminderId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/reminders/${reminderId}`, {
        isActive: !currentStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchReminders();
    } catch (error) {
      setError('Failed to update reminder status');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getNextDose = (times) => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    for (let time of times) {
      const [hours, minutes] = time.split(':').map(Number);
      const timeInMinutes = hours * 60 + minutes;
      
      if (timeInMinutes > currentTime) {
        return time;
      }
    }
    
    return times[0] + ' (tomorrow)';
  };

  if (loading) {
    return (
      <div className={`reminders-page ${isDarkMode ? 'dark-mode' : ''}`}>
        <div className="container">
          <div className="loading">Loading reminders...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`reminders-page ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="container">
        {/* Hero Header */}
        <div className="page-header">
          <div className="header-content">
            <div className="header-icon">💊</div>
            <div>
              <h1 className="page-title">Medicine Reminders</h1>
              <p className="page-subtitle">Never miss a dose - Set up and manage your medication schedule</p>
            </div>
          </div>
          <div className="header-stats">
            <div className="stat-badge">
              <span className="stat-number">{reminders.length}</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat-badge active">
              <span className="stat-number">{reminders.filter(r => r.isActive).length}</span>
              <span className="stat-label">Active</span>
            </div>
          </div>
        </div>

        {error && <div className="alert alert-error">
          <span className="alert-icon">⚠️</span>
          {error}
        </div>}
        {success && <div className="alert alert-success">
          <span className="alert-icon">✓</span>
          {success}
        </div>}

        {/* Add Reminder Form */}
        <div className="add-reminder-card">
          <div className="card-header-custom">
            <h2>➕ Add New Reminder</h2>
            <p>Fill in the details to create a medication reminder</p>
          </div>
          <form onSubmit={handleSubmit} className="reminder-form-modern">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="medicineName">Medicine Name *</label>
                <input
                  type="text"
                  id="medicineName"
                  name="medicineName"
                  value={formData.medicineName}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Aspirin"
                />
              </div>
              <div className="form-group">
                <label htmlFor="dosage">Dosage *</label>
                <input
                  type="text"
                  id="dosage"
                  name="dosage"
                  value={formData.dosage}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., 100mg, 1 tablet"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="frequency">Frequency *</label>
                <select
                  id="frequency"
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleFrequencyChange}
                  required
                >
                  {frequencies.map(freq => (
                    <option key={freq} value={freq}>{freq}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Reminder Times</label>
                <div className="times-grid">
                  {formData.times.map((time, index) => (
                    <input
                      key={index}
                      type="time"
                      value={time}
                      onChange={(e) => handleTimeChange(index, e.target.value)}
                      required
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startDate">Start Date *</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="endDate">End Date</label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Additional instructions or notes..."
                rows="2"
              />
            </div>

            <button 
              type="submit" 
              className="btn-submit-modern"
              disabled={isAdding}
            >
              {isAdding ? (
                <>
                  <span className="spinner"></span> Adding...
                </>
              ) : (
                <>
                  <span>✓</span> Add Reminder
                </>
              )}
            </button>
          </form>
        </div>

        {/* Reminders List */}
        <div className="reminders-section-modern">
          <div className="section-header-modern">
            <h2>📋 Your Medication Schedule</h2>
            <span className="reminder-count">{reminders.length} reminder{reminders.length !== 1 ? 's' : ''}</span>
          </div>
          
          {!Array.isArray(reminders) || reminders.length === 0 ? (
            <div className="empty-state-modern">
              <div className="empty-icon">💊</div>
              <h3>No Reminders Yet</h3>
              <p>Start by adding your first medication reminder above</p>
              <div className="empty-features">
                <span>⏰ Never miss a dose</span>
                <span>📱 Stay on schedule</span>
                <span>💯 Better health outcomes</span>
              </div>
            </div>
          ) : (
            <div className="reminders-grid-modern">
              {Array.isArray(reminders) && reminders.map(reminder => (
                <div key={reminder._id} className={`reminder-card-modern ${!reminder.isActive ? 'card-inactive' : ''}`}>
                  {/* Card Badge */}
                  <div className={`card-badge ${reminder.isActive ? 'badge-active' : 'badge-inactive'}`}>
                    {reminder.isActive ? '🟢 Active' : '⚫ Paused'}
                  </div>

                  {/* Card Header */}
                  <div className="card-top">
                    <div className="medicine-icon">💊</div>
                    <div className="medicine-info">
                      <h3 className="medicine-name">{reminder.medicineName}</h3>
                      <span className="medicine-dosage">{reminder.dosage}</span>
                    </div>
                    <label className="toggle-switch-modern">
                      <input
                        type="checkbox"
                        checked={reminder.isActive}
                        onChange={() => toggleReminderStatus(reminder._id, reminder.isActive)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                  
                  {/* Card Body */}
                  <div className="card-body-modern">
                    <div className="info-row">
                      <div className="info-item">
                        <span className="info-icon">🔄</span>
                        <div>
                          <span className="info-label">Frequency</span>
                          <span className="info-value">{reminder.frequency}</span>
                        </div>
                      </div>
                    </div>

                    <div className="info-row">
                      <div className="info-item">
                        <span className="info-icon">⏰</span>
                        <div>
                          <span className="info-label">Schedule</span>
                          <div className="times-badges">
                            {reminder.times.map((time, idx) => (
                              <span key={idx} className="time-badge">{time}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="info-row">
                      <div className="info-item highlight">
                        <span className="info-icon">🔔</span>
                        <div>
                          <span className="info-label">Next Dose</span>
                          <span className="info-value-large">{getNextDose(reminder.times)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="info-row">
                      <div className="info-item">
                        <span className="info-icon">📅</span>
                        <div>
                          <span className="info-label">Duration</span>
                          <span className="info-value">
                            {formatDate(reminder.startDate)}
                            {reminder.endDate && ` → ${formatDate(reminder.endDate)}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {reminder.notes && (
                      <div className="notes-section">
                        <span className="info-icon">📝</span>
                        <span className="notes-text">{reminder.notes}</span>
                      </div>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="card-footer-modern">
                    <button
                      onClick={() => handleDelete(reminder._id)}
                      className="btn-delete-modern"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .reminders-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2rem 0;
          transition: background 0.3s ease;
        }

        .reminders-page.dark-mode {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        }

        .page-header {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1.5rem;
        }

        .dark-mode .page-header {
          background: rgba(30, 41, 59, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .header-icon {
          font-size: 3.5rem;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .page-title {
          font-size: 2.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0;
        }

        .dark-mode .page-title {
          background: linear-gradient(135deg, #8b5cf6, #a78bfa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .page-subtitle {
          color: #666;
          margin: 0.5rem 0 0 0;
          font-size: 1rem;
        }

        .dark-mode .page-subtitle {
          color: #9ca3af;
        }

        .header-stats {
          display: flex;
          gap: 1rem;
        }

        .stat-badge {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          padding: 1rem 1.5rem;
          border-radius: 15px;
          text-align: center;
          color: white;
          min-width: 100px;
        }

        .dark-mode .stat-badge {
          background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
        }

        .stat-badge.active {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }

        .dark-mode .stat-badge.active {
          background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
        }

        .stat-number {
          display: block;
          font-size: 2rem;
          font-weight: 700;
        }

        .stat-label {
          font-size: 0.875rem;
          opacity: 0.9;
        }

        .alert {
          padding: 1rem 1.5rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .alert-error {
          background: #fee;
          border-left: 4px solid #f44336;
          color: #c62828;
        }

        .alert-success {
          background: #e8f5e9;
          border-left: 4px solid #4caf50;
          color: #2e7d32;
        }

        .alert-icon {
          font-size: 1.5rem;
        }

        .add-reminder-card {
          background: white;
          border-radius: 20px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        }

        .dark-mode .add-reminder-card {
          background: rgba(30, 41, 59, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        }

        .card-header-custom {
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #f0f0f0;
        }

        .card-header-custom h2 {
          font-size: 1.75rem;
          color: #333;
          margin: 0 0 0.5rem 0;
        }

        .dark-mode .card-header-custom h2 {
          color: #8b5cf6;
        }

        .card-header-custom p {
          color: #666;
          margin: 0;
        }

        .dark-mode .card-header-custom p {
          color: #9ca3af;
        }

        .reminder-form-modern .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .reminder-form-modern .form-group {
          display: flex;
          flex-direction: column;
        }

        .reminder-form-modern label {
          font-weight: 600;
          color: #333;
          margin-bottom: 0.5rem;
          font-size: 0.95rem;
        }

        .dark-mode .reminder-form-modern label {
          color: #e5e7eb;
        }

        .reminder-form-modern input,
        .reminder-form-modern select,
        .reminder-form-modern textarea {
          padding: 0.875rem;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.3s ease;
          background: white;
          color: #1f2937;
        }

        .dark-mode .reminder-form-modern input,
        .dark-mode .reminder-form-modern select,
        .dark-mode .reminder-form-modern textarea {
          background: rgba(15, 23, 42, 0.8);
          border: 2px solid rgba(255, 255, 255, 0.1);
          color: #e5e7eb;
        }

        .reminder-form-modern input:focus,
        .reminder-form-modern select:focus,
        .reminder-form-modern textarea:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
        }

        .dark-mode .reminder-form-modern input:focus,
        .dark-mode .reminder-form-modern select:focus,
        .dark-mode .reminder-form-modern textarea:focus {
          border-color: #8b5cf6;
          box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.2);
        }

        .times-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 0.75rem;
        }

        .btn-submit-modern {
          width: 100%;
          padding: 1rem 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .dark-mode .btn-submit-modern {
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
        }

        .btn-submit-modern:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
        }

        .dark-mode .btn-submit-modern:hover:not(:disabled) {
          box-shadow: 0 10px 30px rgba(139, 92, 246, 0.4);
        }

        .btn-submit-modern:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .reminders-section-modern {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        }

        .dark-mode .reminders-section-modern {
          background: rgba(30, 41, 59, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        }

        .section-header-modern {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #f0f0f0;
        }

        .section-header-modern h2 {
          font-size: 1.75rem;
          color: #333;
          margin: 0;
        }

        .dark-mode .section-header-modern h2 {
          color: #8b5cf6;
        }

        .reminder-count {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .empty-state-modern {
          text-align: center;
          padding: 4rem 2rem;
        }

        .empty-icon {
          font-size: 5rem;
          margin-bottom: 1rem;
          animation: bounce 2s infinite;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .empty-state-modern h3 {
          font-size: 1.5rem;
          color: #333;
          margin-bottom: 0.5rem;
        }

        .dark-mode .empty-state-modern h3 {
          color: #d1d5db;
        }

        .empty-state-modern p {
          color: #666;
          margin-bottom: 1.5rem;
        }

        .dark-mode .empty-state-modern p {
          color: #9ca3af;
        }

        .empty-features {
          display: flex;
          justify-content: center;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .empty-features span {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.875rem;
        }

        .reminders-grid-modern {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .reminder-card-modern {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.3s ease;
          position: relative;
        }

        .dark-mode .reminder-card-modern {
          background: linear-gradient(135deg, #3730a3 0%, #4338ca 100%);
        }

        .reminder-card-modern:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 40px rgba(102, 126, 234, 0.3);
        }

        .dark-mode .reminder-card-modern:hover {
          box-shadow: 0 15px 40px rgba(67, 56, 202, 0.4);
        }

        .reminder-card-modern.card-inactive {
          background: linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%);
          opacity: 0.7;
        }

        .dark-mode .reminder-card-modern.card-inactive {
          background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
        }

        .card-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          padding: 0.375rem 0.875rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          z-index: 10;
        }

        .badge-active {
          background: rgba(76, 175, 80, 0.9);
          color: white;
        }

        .badge-inactive {
          background: rgba(158, 158, 158, 0.9);
          color: white;
        }

        .card-top {
          background: white;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .medicine-icon {
          font-size: 2.5rem;
          background: linear-gradient(135deg, #667eea, #764ba2);
          width: 60px;
          height: 60px;
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .medicine-info {
          flex: 1;
        }

        .medicine-name {
          font-size: 1.25rem;
          font-weight: 700;
          color: #333;
          margin: 0 0 0.25rem 0;
        }

        .medicine-dosage {
          color: #666;
          font-size: 0.95rem;
        }

        .toggle-switch-modern {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 26px;
          flex-shrink: 0;
        }

        .toggle-switch-modern input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: 0.3s;
          border-radius: 26px;
        }

        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 20px;
          width: 20px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: 0.3s;
          border-radius: 50%;
        }

        .toggle-switch-modern input:checked + .toggle-slider {
          background: linear-gradient(135deg, #667eea, #764ba2);
        }

        .dark-mode .toggle-switch-modern input:checked + .toggle-slider {
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
        }

        .toggle-switch-modern input:checked + .toggle-slider:before {
          transform: translateX(24px);
        }

        .card-body-modern {
          padding: 1.5rem;
          color: white;
        }

        .info-row {
          margin-bottom: 1rem;
        }

        .info-item {
          display: flex;
          gap: 0.75rem;
          align-items: flex-start;
        }

        .info-item.highlight {
          background: rgba(255, 255, 255, 0.15);
          padding: 1rem;
          border-radius: 12px;
        }

        .info-icon {
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .info-label {
          display: block;
          font-size: 0.8rem;
          opacity: 0.9;
          margin-bottom: 0.25rem;
        }

        .info-value {
          display: block;
          font-weight: 600;
        }

        .info-value-large {
          display: block;
          font-weight: 700;
          font-size: 1.25rem;
        }

        .times-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .time-badge {
          background: rgba(255, 255, 255, 0.2);
          padding: 0.375rem 0.75rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .notes-section {
          display: flex;
          gap: 0.75rem;
          background: rgba(255, 255, 255, 0.1);
          padding: 1rem;
          border-radius: 12px;
          margin-top: 1rem;
        }

        .notes-text {
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .card-footer-modern {
          background: rgba(0, 0, 0, 0.1);
          padding: 1rem 1.5rem;
          display: flex;
          justify-content: flex-end;
        }

        .btn-delete-modern {
          background: rgba(244, 67, 54, 0.9);
          color: white;
          border: none;
          padding: 0.5rem 1.25rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-delete-modern:hover {
          background: #f44336;
          transform: scale(1.05);
        }

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .header-content {
            flex-direction: column;
            align-items: flex-start;
          }

          .header-icon {
            font-size: 2.5rem;
          }

          .page-title {
            font-size: 2rem;
          }

          .reminder-form-modern .form-row {
            grid-template-columns: 1fr;
          }

          .reminders-grid-modern {
            grid-template-columns: 1fr;
          }

          .header-stats {
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>
    </div>
  );
};

export default Reminders;