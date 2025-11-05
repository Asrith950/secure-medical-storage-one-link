import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const EmergencyInfo = () => {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [emergencyInfo, setEmergencyInfo] = useState({
    bloodGroup: '',
    allergies: [],
    conditions: [],
    emergencyContacts: []
  });
  const [newAllergy, setNewAllergy] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [newContact, setNewContact] = useState({
    name: '',
    relationship: '',
    phone: ''
  });

  useEffect(() => {
    if (user?.emergencyInfo) {
      setEmergencyInfo({
        bloodGroup: user.emergencyInfo.bloodGroup || '',
        allergies: user.emergencyInfo.allergies || [],
        conditions: user.emergencyInfo.conditions || [],
        emergencyContacts: user.emergencyInfo.emergencyContacts || []
      });
    }
  }, [user]);

  const updateEmergencyInfo = async (updatedInfo) => {
    try {
      setLoading(true);
      const response = await axios.put('/api/users/emergency-info', updatedInfo, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        toast.success('Emergency information updated successfully');
        return true;
      }
    } catch (error) {
      toast.error('Failed to update emergency information');
      console.error('Update error:', error);
    } finally {
      setLoading(false);
    }
    return false;
  };

  const handleBloodGroupChange = async (bloodGroup) => {
    const updated = { ...emergencyInfo, bloodGroup };
    setEmergencyInfo(updated);
    await updateEmergencyInfo(updated);
  };

  const addAllergy = async () => {
    if (newAllergy.trim() && !emergencyInfo.allergies.includes(newAllergy.trim())) {
      const updated = {
        ...emergencyInfo,
        allergies: [...emergencyInfo.allergies, newAllergy.trim()]
      };
      setEmergencyInfo(updated);
      setNewAllergy('');
      await updateEmergencyInfo(updated);
    }
  };

  const removeAllergy = async (allergyToRemove) => {
    const updated = {
      ...emergencyInfo,
      allergies: emergencyInfo.allergies.filter(allergy => allergy !== allergyToRemove)
    };
    setEmergencyInfo(updated);
    await updateEmergencyInfo(updated);
  };

  const addCondition = async () => {
    if (newCondition.trim() && !emergencyInfo.conditions.includes(newCondition.trim())) {
      const updated = {
        ...emergencyInfo,
        conditions: [...emergencyInfo.conditions, newCondition.trim()]
      };
      setEmergencyInfo(updated);
      setNewCondition('');
      await updateEmergencyInfo(updated);
    }
  };

  const removeCondition = async (conditionToRemove) => {
    const updated = {
      ...emergencyInfo,
      conditions: emergencyInfo.conditions.filter(condition => condition !== conditionToRemove)
    };
    setEmergencyInfo(updated);
    await updateEmergencyInfo(updated);
  };

  const addContact = async () => {
    if (newContact.name.trim() && newContact.phone.trim()) {
      const updated = {
        ...emergencyInfo,
        emergencyContacts: [...emergencyInfo.emergencyContacts, { ...newContact }]
      };
      setEmergencyInfo(updated);
      setNewContact({ name: '', relationship: '', phone: '' });
      await updateEmergencyInfo(updated);
    }
  };

  const removeContact = async (index) => {
    const updated = {
      ...emergencyInfo,
      emergencyContacts: emergencyInfo.emergencyContacts.filter((_, i) => i !== index)
    };
    setEmergencyInfo(updated);
    await updateEmergencyInfo(updated);
  };

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <div className="page">
      <div className="container">
        <h1>🚨 Emergency Information</h1>
        <p>Manage your critical medical information for emergency situations</p>

        <div className="emergency-grid">
          {/* Blood Group */}
          <div className="emergency-card">
            <h2>🩸 Blood Group</h2>
            <div className="blood-group-selector">
              {bloodGroups.map(group => (
                <button
                  key={group}
                  onClick={() => handleBloodGroupChange(group)}
                  className={`blood-group-btn ${emergencyInfo.bloodGroup === group ? 'active' : ''}`}
                  disabled={loading}
                >
                  {group}
                </button>
              ))}
            </div>
            {emergencyInfo.bloodGroup && (
              <div className="selected-blood-group">
                Your blood group: <strong>{emergencyInfo.bloodGroup}</strong>
              </div>
            )}
          </div>

          {/* Allergies */}
          <div className="emergency-card">
            <h2>🤧 Allergies</h2>
            <div className="add-item">
              <input
                type="text"
                value={newAllergy}
                onChange={(e) => setNewAllergy(e.target.value)}
                placeholder="Enter allergy (e.g., Peanuts, Shellfish)"
                className="item-input"
                onKeyPress={(e) => e.key === 'Enter' && addAllergy()}
              />
              <button onClick={addAllergy} className="btn btn-outline" disabled={loading}>
                Add
              </button>
            </div>
            <div className="items-list">
              {emergencyInfo.allergies.map((allergy, index) => (
                <div key={index} className="item-tag">
                  <span>{allergy}</span>
                  <button onClick={() => removeAllergy(allergy)} className="remove-btn">×</button>
                </div>
              ))}
              {emergencyInfo.allergies.length === 0 && (
                <p className="no-items">No allergies recorded</p>
              )}
            </div>
          </div>

          {/* Medical Conditions */}
          <div className="emergency-card">
            <h2>🏥 Medical Conditions</h2>
            <div className="add-item">
              <input
                type="text"
                value={newCondition}
                onChange={(e) => setNewCondition(e.target.value)}
                placeholder="Enter medical condition"
                className="item-input"
                onKeyPress={(e) => e.key === 'Enter' && addCondition()}
              />
              <button onClick={addCondition} className="btn btn-outline" disabled={loading}>
                Add
              </button>
            </div>
            <div className="items-list">
              {emergencyInfo.conditions.map((condition, index) => (
                <div key={index} className="item-tag">
                  <span>{condition}</span>
                  <button onClick={() => removeCondition(condition)} className="remove-btn">×</button>
                </div>
              ))}
              {emergencyInfo.conditions.length === 0 && (
                <p className="no-items">No medical conditions recorded</p>
              )}
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="emergency-card emergency-contacts">
            <h2>📞 Emergency Contacts</h2>
            <div className="add-contact">
              <div className="contact-inputs">
                <input
                  type="text"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  placeholder="Contact name"
                  className="contact-input"
                />
                <input
                  type="text"
                  value={newContact.relationship}
                  onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                  placeholder="Relationship"
                  className="contact-input"
                />
                <input
                  type="tel"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  placeholder="Phone number"
                  className="contact-input"
                />
              </div>
              <button onClick={addContact} className="btn btn-primary" disabled={loading}>
                Add Contact
              </button>
            </div>
            
            <div className="contacts-list">
              {emergencyInfo.emergencyContacts.map((contact, index) => (
                <div key={index} className="contact-card">
                  <div className="contact-info">
                    <h4>{contact.name}</h4>
                    <p>{contact.relationship}</p>
                    <p className="contact-phone">{contact.phone}</p>
                  </div>
                  <button onClick={() => removeContact(index)} className="remove-contact-btn">
                    Remove
                  </button>
                </div>
              ))}
              {emergencyInfo.emergencyContacts.length === 0 && (
                <p className="no-items">No emergency contacts added</p>
              )}
            </div>
          </div>
        </div>

        <div className="emergency-info-footer">
          <div className="info-card">
            <h3>ℹ️ Important Information</h3>
            <ul>
              <li>This information is crucial for medical emergencies</li>
              <li>Keep your emergency contacts updated</li>
              <li>Inform your emergency contacts about their role</li>
              <li>Consider medical alert jewelry for critical conditions</li>
            </ul>
          </div>
        </div>
      </div>

      <style jsx>{`
        .emergency-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 2rem;
          margin-top: 2rem;
        }

        .emergency-card {
          background-color: var(--background-color);
          border: 1px solid var(--border-color);
          border-radius: 1rem;
          padding: 2rem;
          box-shadow: var(--shadow-md);
        }

        .emergency-card h2 {
          color: var(--primary-color);
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .blood-group-selector {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .blood-group-btn {
          padding: 0.75rem;
          border: 2px solid var(--border-color);
          background-color: var(--background-color);
          color: var(--text-color);
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 500;
        }

        .blood-group-btn:hover {
          border-color: var(--primary-color);
        }

        .blood-group-btn.active {
          background-color: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }

        .selected-blood-group {
          text-align: center;
          padding: 0.75rem;
          background-color: var(--light-bg);
          border-radius: 0.5rem;
          color: var(--text-color);
        }

        .add-item {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .item-input {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid var(--border-color);
          border-radius: 0.5rem;
          background-color: var(--background-color);
          color: var(--text-color);
        }

        .items-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .item-tag {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          background-color: var(--light-bg);
          border-radius: 1rem;
          font-size: 0.875rem;
        }

        .remove-btn {
          background: none;
          border: none;
          color: var(--error-color);
          cursor: pointer;
          font-size: 1.2rem;
          line-height: 1;
        }

        .no-items {
          color: var(--text-secondary);
          font-style: italic;
          margin: 0;
        }

        .emergency-contacts {
          grid-column: span 2;
        }

        .add-contact {
          margin-bottom: 1.5rem;
        }

        .contact-inputs {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .contact-input {
          padding: 0.75rem;
          border: 1px solid var(--border-color);
          border-radius: 0.5rem;
          background-color: var(--background-color);
          color: var(--text-color);
        }

        .contacts-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .contact-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background-color: var(--light-bg);
          border-radius: 0.5rem;
          border: 1px solid var(--border-color);
        }

        .contact-info h4 {
          margin: 0 0 0.25rem 0;
          color: var(--text-color);
        }

        .contact-info p {
          margin: 0;
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .contact-phone {
          font-weight: 500;
          color: var(--primary-color) !important;
        }

        .remove-contact-btn {
          padding: 0.5rem 1rem;
          background-color: var(--error-color);
          color: white;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 0.875rem;
        }

        .emergency-info-footer {
          margin-top: 3rem;
        }

        .info-card {
          background-color: var(--light-bg);
          padding: 2rem;
          border-radius: 1rem;
          border: 1px solid var(--border-color);
        }

        .info-card h3 {
          color: var(--primary-color);
          margin-bottom: 1rem;
        }

        .info-card ul {
          margin: 0;
          padding-left: 1.5rem;
          color: var(--text-secondary);
        }

        .info-card li {
          margin-bottom: 0.5rem;
        }

        @media (max-width: 768px) {
          .emergency-grid {
            grid-template-columns: 1fr;
          }

          .emergency-contacts {
            grid-column: span 1;
          }

          .blood-group-selector {
            grid-template-columns: repeat(2, 1fr);
          }

          .contact-inputs {
            grid-template-columns: 1fr;
          }

          .contact-card {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default EmergencyInfo;