import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// eslint-disable-next-line no-unused-vars
const Chatbot = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: `Hello ${user?.name || 'there'}! I'm your AI Health Assistant. I can help answer general health questions, provide wellness tips, and offer basic medical guidance. How can I help you today?`,
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Health knowledge base with responses
  const healthKnowledge = {
    symptoms: {
      keywords: ['headache', 'fever', 'cough', 'cold', 'pain', 'stomach', 'nausea', 'dizzy', 'tired', 'fatigue'],
      responses: [
        "I understand you're experiencing symptoms. While I can provide general information, it's important to consult with a healthcare professional for proper diagnosis and treatment.",
        "For common symptoms like headaches or mild fever, rest and hydration often help. However, if symptoms persist or worsen, please see a doctor.",
        "If you're experiencing severe symptoms or emergency signs (chest pain, difficulty breathing, severe bleeding), please seek immediate medical attention or call emergency services."
      ]
    },
    nutrition: {
      keywords: ['diet', 'food', 'nutrition', 'vitamins', 'healthy eating', 'weight', 'calories'],
      responses: [
        "A balanced diet includes fruits, vegetables, whole grains, lean proteins, and healthy fats. Aim for 5 servings of fruits and vegetables daily.",
        "Stay hydrated by drinking 8-10 glasses of water daily. Limit processed foods, sugar, and excessive salt.",
        "For personalized nutrition advice, consider consulting with a registered dietitian who can create a plan tailored to your needs."
      ]
    },
    exercise: {
      keywords: ['exercise', 'workout', 'fitness', 'activity', 'gym', 'running', 'walking'],
      responses: [
        "Aim for at least 150 minutes of moderate aerobic activity or 75 minutes of vigorous activity weekly, plus muscle-strengthening exercises twice a week.",
        "Start slowly if you're new to exercise. Even a 10-minute walk daily can provide health benefits.",
        "Choose activities you enjoy - dancing, swimming, hiking, or playing sports can all be great forms of exercise!"
      ]
    },
    sleep: {
      keywords: ['sleep', 'insomnia', 'tired', 'rest', 'bedtime', 'sleeping'],
      responses: [
        "Adults need 7-9 hours of quality sleep nightly. Maintain a consistent sleep schedule by going to bed and waking up at the same time daily.",
        "Create a relaxing bedtime routine: limit screen time, keep your bedroom cool and dark, and avoid caffeine late in the day.",
        "If you have persistent sleep problems, consider speaking with a healthcare provider about possible sleep disorders."
      ]
    },
    mental_health: {
      keywords: ['stress', 'anxiety', 'depression', 'mental health', 'mood', 'worried', 'sad'],
      responses: [
        "Mental health is just as important as physical health. Practice stress management through deep breathing, meditation, or yoga.",
        "Stay connected with friends and family, engage in activities you enjoy, and don't hesitate to seek professional help if needed.",
        "If you're experiencing persistent sadness, anxiety, or thoughts of self-harm, please reach out to a mental health professional or crisis helpline immediately."
      ]
    },
    medications: {
      keywords: ['medicine', 'medication', 'pills', 'dosage', 'side effects', 'prescription'],
      responses: [
        "Always take medications as prescribed by your healthcare provider. Don't skip doses or stop taking medication without consulting your doctor.",
        "Keep an updated list of all medications you take, including over-the-counter drugs and supplements.",
        "If you experience side effects, contact your healthcare provider. Never share prescription medications with others."
      ]
    },
    prevention: {
      keywords: ['prevent', 'vaccination', 'checkup', 'screening', 'health check'],
      responses: [
        "Regular health screenings and preventive care are crucial. Follow your doctor's recommendations for checkups, vaccinations, and screenings.",
        "Practice good hygiene: wash hands frequently, cover coughs and sneezes, and avoid close contact with sick individuals.",
        "Maintain a healthy lifestyle with good nutrition, regular exercise, adequate sleep, and stress management."
      ]
    }
  };

  const generateResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    // Check for greetings
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return "Hello! I'm here to help with your health questions. What would you like to know about?";
    }

    // Check for thanks
    if (message.includes('thank') || message.includes('thanks')) {
      return "You're welcome! Remember, I provide general health information only. Always consult healthcare professionals for medical advice. Is there anything else I can help you with?";
    }

    // Emergency keywords
    const emergencyKeywords = ['emergency', 'urgent', 'severe pain', 'chest pain', 'can\'t breathe', 'bleeding', 'unconscious'];
    if (emergencyKeywords.some(keyword => message.includes(keyword))) {
      return "🚨 This sounds like a medical emergency. Please call emergency services (911) or go to the nearest emergency room immediately. Don't wait for online advice in emergency situations.";
    }

    // Find matching category
    for (const [, data] of Object.entries(healthKnowledge)) {
      if (data.keywords.some(keyword => message.includes(keyword))) {
        const randomResponse = data.responses[Math.floor(Math.random() * data.responses.length)];
        return randomResponse;
      }
    }

    // Default response for unmatched queries
    return "I can help with general health topics like nutrition, exercise, sleep, stress management, and wellness tips. Could you please be more specific about what health topic you'd like to discuss?";
  };

  const toChatHistory = (msgs) => {
    // Convert local message objects to OpenAI-style roles for context
    return msgs
      .filter(m => m && m.text && (m.sender === 'user' || m.sender === 'bot'))
      .slice(-12)
      .map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text }));
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/chatbot/chat', {
        message: userMessage.text,
        history: toChatHistory(messages)
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      const botText = response?.data?.data?.botResponse || generateResponse(userMessage.text);
      const botMessage = {
        id: Date.now() + 1,
        text: botText,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      // Fallback to local generator if API call fails
      const botMessage = {
        id: Date.now() + 1,
        text: generateResponse(userMessage.text),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const formatPrescriptionSummary = (data, fileName) => {
    try {
      const { prescription = {}, summary = {}, lifestylePlan = {} } = data || {};
      const meds = (prescription.medications || []).slice(0, 8);

      const headerBits = [];
      if (prescription.header?.patient) headerBits.push(`Patient: ${prescription.header.patient}`);
      if (prescription.header?.age) headerBits.push(`Age: ${prescription.header.age}`);
      if (prescription.header?.sex) headerBits.push(`Sex: ${prescription.header.sex}`);
      if (prescription.header?.date) headerBits.push(`Date: ${prescription.header.date}`);

      const vitalsBits = [];
      if (prescription.vitals?.bp) vitalsBits.push(`BP ${prescription.vitals.bp}`);
      if (prescription.vitals?.pulse) vitalsBits.push(`Pulse ${prescription.vitals.pulse}`);
      if (prescription.vitals?.spo2) vitalsBits.push(`SpO2 ${prescription.vitals.spo2}`);
      if (prescription.vitals?.temp) vitalsBits.push(`Temp ${prescription.vitals.temp}`);

      let text = `Analyzed ${fileName ? '"' + fileName + '"' : 'document'}\n\n`;
      if (headerBits.length) text += `Header: ${headerBits.join(' | ')}\n`;
      if (vitalsBits.length) text += `Vitals: ${vitalsBits.join(' | ')}\n`;

      if (meds.length) {
        text += `\nPrescription Summary:`;
        meds.forEach((m, idx) => {
          const parts = [];
          if (m.name) parts.push(m.name);
          if (m.strength) parts.push(m.strength);
          if (m.frequency) parts.push(m.frequency);
          if (m.duration) parts.push(m.duration);
          const line = parts.join(' • ');
          const notes = (m.notes || []).length ? ` (Notes: ${(m.notes || []).join('; ')})` : '';
          text += `\n  ${idx + 1}. ${line}${notes}`;
        });
      } else {
        text += `\nNo clear medications detected.`;
      }

      const instr = prescription.instructions || [];
      if (instr.length) {
        text += `\n\nGeneral Instructions:`;
        instr.forEach((i) => (text += `\n  • ${i}`));
      }

      // Lifestyle plan details
      const dietFocus = (lifestylePlan?.diet?.focus || []).slice(0, 6);
      const dietAvoid = (lifestylePlan?.diet?.avoid || []).slice(0, 6);
      const dietTips = (lifestylePlan?.diet?.tips || []).slice(0, 3);
      const sleep = lifestylePlan?.sleep || {};
      const hydration = lifestylePlan?.hydration || {};
      const activity = lifestylePlan?.activity || {};
      const monitoring = lifestylePlan?.monitoring || {};
      const reminders = lifestylePlan?.reminders || {};

      text += `\n\nLifestyle Guidance:`;
      if (dietFocus.length || dietAvoid.length || dietTips.length) {
        text += `\nDiet:`;
        if (dietFocus.length) text += `\n  • Focus: ${dietFocus.join('; ')}`;
        if (dietAvoid.length) text += `\n  • Avoid: ${dietAvoid.join('; ')}`;
        if (dietTips.length) text += `\n  • Tips: ${dietTips.join(' | ')}`;
      }
      if (sleep.targetHours || sleep.schedule || sleep.notes) {
        const sleepBits = [];
        if (sleep.targetHours) sleepBits.push(`Target ${sleep.targetHours}`);
        if (sleep.schedule) sleepBits.push(sleep.schedule);
        if (sleep.notes) sleepBits.push(sleep.notes);
        text += `\nSleep: ${sleepBits.join(' | ')}`;
      }
      if (hydration.targetLiters || (hydration.tips || []).length) {
        const hTips = (hydration.tips || []).slice(0, 2);
        text += `\nHydration: ${hydration.targetLiters || '2–3 L/day'}${hTips.length ? ' • ' + hTips.join(' | ') : ''}`;
      }
      if (activity.targetMinutesPerWeek || (activity.types || []).length || (activity.cautions || []).length) {
        const aTypes = (activity.types || []).slice(0, 3);
        const aCautions = (activity.cautions || []).slice(0, 2);
        text += `\nActivity: Aim ${activity.targetMinutesPerWeek || 150} min/week`;
        if (aTypes.length) text += ` • Types: ${aTypes.join(', ')}`;
        if (aCautions.length) text += ` • Caution: ${aCautions.join('; ')}`;
      }
      if ((monitoring.checks || []).length) {
        const checks = (monitoring.checks || []).slice(0, 4);
        text += `\nMonitoring: ${checks.join(' | ')}`;
      }
      if ((reminders.general || []).length || (reminders.meds || []).length) {
        const gen = (reminders.general || []).slice(0, 2);
        const medsR = (reminders.meds || []).slice(0, 2);
        if (gen.length) text += `\nReminders: ${gen.join(' | ')}`;
        if (medsR.length) text += `\nMedication reminders: ${medsR.join(' | ')}`;
      }

      const redFlags = summary.redFlags || [];
      if (redFlags.length) {
        text += `\n\n⚠️ Red flags noted: ${redFlags.join('; ')}`;
      }

      text += `\n\nNote: Always follow your doctor's advice. This summary is AI-generated from the document text.`;
      return text;
    } catch {
      return 'I analyzed the file but could not format the summary.';
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    // Reset input so the same file can be selected again later
    if (fileInputRef.current) fileInputRef.current.value = '';

    const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowed.includes(file.type) && !/\.pdf$|\.jpg$|\.jpeg$|\.png$/i.test(file.name)) {
      setMessages(prev => [...prev, { id: Date.now(), text: 'Unsupported file type. Please upload a PDF or image (JPG/PNG).', sender: 'bot', timestamp: new Date() }]);
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setMessages(prev => [...prev, { id: Date.now(), text: 'File too large. Please upload a file under 20 MB.', sender: 'bot', timestamp: new Date() }]);
      return;
    }

    // Show a user message indicating upload
    const userMsg = { id: Date.now(), text: `📄 Uploaded: ${file.name}`, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);
    setIsAnalyzing(true);

    try {
      const form = new FormData();
      form.append('file', file);
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/ai/analyze', form, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res?.data?.success) {
        const summaryText = formatPrescriptionSummary(res.data, file.name);
        const botMessage = { id: Date.now() + 1, text: summaryText, sender: 'bot', timestamp: new Date() };
        setMessages(prev => [...prev, botMessage]);
      } else {
        const botMessage = { id: Date.now() + 1, text: 'Sorry, I could not analyze that file.', sender: 'bot', timestamp: new Date() };
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (err) {
      const botMessage = { id: Date.now() + 1, text: `Analysis failed: ${err?.response?.data?.message || err.message}`, sender: 'bot', timestamp: new Date() };
      setMessages(prev => [...prev, botMessage]);
    } finally {
      setIsTyping(false);
      setIsAnalyzing(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    "How can I improve my sleep?",
    "What's a healthy diet?",
    "How much exercise do I need?",
    "How to manage stress?",
    "What are preventive health measures?"
  ];

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
  };

  return (
    <div className="page">
      <div className="container">
        <h1>🤖 AI Health Assistant</h1>
        <p>Get instant answers to your general health questions</p>

        <div className="chatbot-container">
          <div className="chat-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
              >
                <div className="message-content">
                  <div className="message-text">{message.text}</div>
                  <div className="message-time">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div className="message-avatar">
                  {message.sender === 'user' ? '👤' : '🤖'}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="message bot-message">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
                <div className="message-avatar">🤖</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="quick-questions">
            <p>Quick questions:</p>
            <div className="quick-buttons">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickQuestion(question)}
                  className="quick-btn"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          <div className="chat-input">
            <input
              type="file"
              accept=".pdf,image/*"
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <button
              type="button"
              className="upload-button"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              disabled={isTyping || isAnalyzing}
              title="Upload prescription (PDF/JPG/PNG)"
            >
              {isAnalyzing ? 'Analyzing…' : 'Upload'}
            </button>
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about health, nutrition, exercise, sleep, or wellness..."
              className="message-input"
              rows="3"
            />
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="send-button"
            >
              Send
            </button>
          </div>

          <div className="disclaimer">
            <p>
              ⚠️ <strong>Medical Disclaimer:</strong> This AI assistant provides general health information only and should not replace professional medical advice, diagnosis, or treatment. Always consult qualified healthcare providers for medical concerns.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .chatbot-container {
          max-width: 800px;
          margin: 2rem auto;
          border: 1px solid var(--border-color);
          border-radius: 1rem;
          overflow: hidden;
          background-color: var(--background-color);
          box-shadow: var(--shadow-lg);
        }

        .chat-messages {
          height: 500px;
          overflow-y: auto;
          padding: 1rem;
          background-color: var(--light-bg);
        }

        .message {
          display: flex;
          margin-bottom: 1rem;
          align-items: flex-end;
          gap: 0.75rem;
        }

        .user-message {
          flex-direction: row-reverse;
        }

        .message-content {
          max-width: 70%;
          display: flex;
          flex-direction: column;
        }

        .message-text {
          padding: 1rem;
          border-radius: 1rem;
          word-wrap: break-word;
          line-height: 1.5;
        }

        .user-message .message-text {
          background-color: var(--primary-color);
          color: white;
          border-bottom-right-radius: 0.25rem;
        }

        .bot-message .message-text {
          background-color: var(--background-color);
          color: var(--text-color);
          border: 1px solid var(--border-color);
          border-bottom-left-radius: 0.25rem;
        }

        .message-time {
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin-top: 0.25rem;
          padding: 0 0.5rem;
        }

        .user-message .message-time {
          text-align: right;
        }

        .message-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: var(--primary-color);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .typing-indicator {
          display: flex;
          gap: 0.25rem;
          padding: 1rem;
          align-items: center;
        }

        .typing-indicator span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: var(--text-secondary);
          animation: typing 1.4s infinite ease-in-out;
        }

        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-10px);
          }
        }

        .quick-questions {
          padding: 1rem;
          border-top: 1px solid var(--border-color);
          background-color: var(--background-color);
        }

        .quick-questions p {
          margin: 0 0 0.75rem 0;
          font-weight: 500;
          color: var(--text-color);
        }

        .quick-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .quick-btn {
          padding: 0.5rem 1rem;
          background-color: var(--light-bg);
          border: 1px solid var(--border-color);
          border-radius: 1rem;
          color: var(--text-color);
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.875rem;
        }

        .quick-btn:hover {
          background-color: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }

        .chat-input {
          display: flex;
          gap: 0.75rem;
          padding: 1rem;
          background-color: var(--background-color);
          border-top: 1px solid var(--border-color);
        }

        .message-input {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid var(--border-color);
          border-radius: 0.5rem;
          background-color: var(--background-color);
          color: var(--text-color);
          resize: none;
          font-family: inherit;
        }

        .message-input:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .send-button {
          padding: 0.75rem 1.5rem;
          background-color: var(--primary-color);
          color: white;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.3s ease;
        }

        .upload-button {
          padding: 0.75rem 1rem;
          background-color: var(--background-color);
          color: var(--text-color);
          border: 1px solid var(--border-color);
          border-radius: 0.5rem;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .upload-button:hover:not(:disabled) {
          background-color: var(--light-bg);
        }

        .send-button:hover:not(:disabled) {
          background-color: var(--primary-dark);
        }

        .send-button:disabled {
          background-color: var(--text-secondary);
          cursor: not-allowed;
        }

        .disclaimer {
          padding: 1rem;
          background-color: var(--warning-bg, #fef3cd);
          border-top: 1px solid var(--border-color);
          font-size: 0.875rem;
        }

        .disclaimer p {
          margin: 0;
          color: var(--warning-text, #856404);
        }

        @media (max-width: 768px) {
          .message-content {
            max-width: 85%;
          }

          .quick-buttons {
            flex-direction: column;
          }

          .chat-input {
            flex-direction: column;
          }

          .send-button {
            align-self: flex-end;
          }
        }
      `}</style>
    </div>
  );
};

export default Chatbot;