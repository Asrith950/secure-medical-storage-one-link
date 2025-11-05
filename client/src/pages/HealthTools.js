import React, { useState } from 'react';

// eslint-disable-next-line no-unused-vars
const HealthTools = () => {
  
  // BMI Calculator State
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bmi, setBmi] = useState(null);
  const [bmiCategory, setBmiCategory] = useState('');

  // Water Tracker State
  const [waterGoal, setWaterGoal] = useState(8);
  const [waterIntake, setWaterIntake] = useState(0);

  const calculateBMI = () => {
    if (height && weight) {
      const heightInMeters = height / 100;
      const bmiValue = (weight / (heightInMeters * heightInMeters)).toFixed(1);
      setBmi(bmiValue);
      
      if (bmiValue < 18.5) {
        setBmiCategory('Underweight');
      } else if (bmiValue < 25) {
        setBmiCategory('Normal weight');
      } else if (bmiValue < 30) {
        setBmiCategory('Overweight');
      } else {
        setBmiCategory('Obese');
      }
    }
  };

  const addWater = (glasses) => {
    setWaterIntake(prev => Math.min(prev + glasses, waterGoal));
  };

  const resetWater = () => {
    setWaterIntake(0);
  };

  const getBmiColor = () => {
    if (!bmi) return 'var(--primary-color)';
    if (bmi < 18.5) return '#3498db';
    if (bmi < 25) return '#2ecc71';
    if (bmi < 30) return '#f39c12';
    return '#e74c3c';
  };

  const getWaterProgress = () => {
    return (waterIntake / waterGoal) * 100;
  };

  return (
    <div className="page">
      <div className="container">
        <h1>Health Tools</h1>
        <p>Track your health with our interactive tools</p>

        <div className="health-tools-grid">
          {/* BMI Calculator */}
          <div className="tool-card">
            <h2>BMI Calculator</h2>
            <p>Calculate your Body Mass Index</p>
            
            <div className="bmi-inputs">
              <div className="input-group">
                <label>Height (cm)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="e.g., 175"
                  className="tool-input"
                />
              </div>
              
              <div className="input-group">
                <label>Weight (kg)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="e.g., 70"
                  className="tool-input"
                />
              </div>
            </div>

            <button onClick={calculateBMI} className="btn btn-primary">
              Calculate BMI
            </button>

            {bmi && (
              <div className="bmi-result">
                <div className="bmi-value" style={{ color: getBmiColor() }}>
                  <span className="bmi-number">{bmi}</span>
                  <span className="bmi-category">{bmiCategory}</span>
                </div>
                <div className="bmi-info">
                  <p>BMI Categories:</p>
                  <ul>
                    <li>Underweight: Below 18.5</li>
                    <li>Normal: 18.5 - 24.9</li>
                    <li>Overweight: 25 - 29.9</li>
                    <li>Obese: 30 and above</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Water Tracker */}
          <div className="tool-card">
            <h2>💧 Water Tracker</h2>
            <p>Track your daily water intake</p>
            
            <div className="water-goal">
              <label>Daily Goal (glasses)</label>
              <input
                type="number"
                value={waterGoal}
                onChange={(e) => setWaterGoal(Number(e.target.value))}
                min="1"
                max="20"
                className="tool-input"
              />
            </div>

            <div className="water-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${getWaterProgress()}%` }}
                ></div>
              </div>
              <p>{waterIntake} / {waterGoal} glasses ({Math.round(getWaterProgress())}%)</p>
            </div>

            <div className="water-actions">
              <button onClick={() => addWater(1)} className="btn btn-outline">
                +1 Glass
              </button>
              <button onClick={() => addWater(2)} className="btn btn-outline">
                +2 Glasses
              </button>
              <button onClick={resetWater} className="btn btn-secondary">
                Reset
              </button>
            </div>

            {getWaterProgress() >= 100 && (
              <div className="achievement">
                🎉 Congratulations! You've reached your daily water goal!
              </div>
            )}
          </div>

          {/* Health Tips */}
          <div className="tool-card health-tips">
            <h2>💡 Health Tips</h2>
            <div className="tips-list">
              <div className="tip">
                <span className="tip-icon">🏃‍♂️</span>
                <p>Aim for at least 30 minutes of physical activity daily</p>
              </div>
              <div className="tip">
                <span className="tip-icon">🥗</span>
                <p>Include 5 servings of fruits and vegetables in your diet</p>
              </div>
              <div className="tip">
                <span className="tip-icon">😴</span>
                <p>Get 7-9 hours of quality sleep each night</p>
              </div>
              <div className="tip">
                <span className="tip-icon">🧘‍♀️</span>
                <p>Practice stress management techniques like meditation</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .health-tools-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 2rem;
          margin-top: 2rem;
        }

        .tool-card {
          background-color: var(--background-color);
          border: 1px solid var(--border-color);
          border-radius: 1rem;
          padding: 2rem;
          box-shadow: var(--shadow-md);
          transition: transform 0.3s ease;
        }

        .tool-card:hover {
          transform: translateY(-5px);
        }

        .tool-card h2 {
          color: var(--primary-color);
          margin-bottom: 0.5rem;
        }

        .bmi-inputs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin: 1.5rem 0;
        }

        .input-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: var(--text-color);
        }

        .tool-input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid var(--border-color);
          border-radius: 0.5rem;
          background-color: var(--background-color);
          color: var(--text-color);
          font-size: 1rem;
        }

        .tool-input:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .bmi-result {
          margin-top: 1.5rem;
          text-align: center;
        }

        .bmi-value {
          margin-bottom: 1rem;
        }

        .bmi-number {
          font-size: 2.5rem;
          font-weight: bold;
          display: block;
        }

        .bmi-category {
          font-size: 1.2rem;
          font-weight: 500;
        }

        .bmi-info {
          background-color: var(--light-bg);
          padding: 1rem;
          border-radius: 0.5rem;
          text-align: left;
        }

        .bmi-info ul {
          margin: 0.5rem 0 0 1rem;
          color: var(--text-secondary);
        }

        .water-goal {
          margin: 1.5rem 0;
        }

        .water-progress {
          margin: 1.5rem 0;
        }

        .progress-bar {
          width: 100%;
          height: 20px;
          background-color: var(--light-bg);
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #3498db, #2ecc71);
          transition: width 0.3s ease;
        }

        .water-actions {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .achievement {
          background: linear-gradient(135deg, #2ecc71, #27ae60);
          color: white;
          padding: 1rem;
          border-radius: 0.5rem;
          text-align: center;
          margin-top: 1rem;
          font-weight: 500;
        }

        .health-tips {
          grid-column: span 2;
        }

        .tips-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .tip {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background-color: var(--light-bg);
          border-radius: 0.5rem;
        }

        .tip-icon {
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .tip p {
          margin: 0;
          color: var(--text-secondary);
        }

        @media (max-width: 768px) {
          .health-tools-grid {
            grid-template-columns: 1fr;
          }

          .health-tips {
            grid-column: span 1;
          }

          .tips-list {
            grid-template-columns: 1fr;
          }

          .bmi-inputs {
            grid-template-columns: 1fr;
          }

          .water-actions {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default HealthTools;