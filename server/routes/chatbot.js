const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');
let OpenAI;
try {
  // Lazy require to avoid crashing if dependency isn't installed in some environments
  OpenAI = require('openai');
} catch (_) {
  OpenAI = null;
}

const router = express.Router();

// Simple health chatbot responses
const healthResponses = {
  greetings: [
    "Hello! I'm here to help with your health questions. How can I assist you today?",
    "Hi there! I'm your health assistant. What would you like to know?",
    "Welcome! I can help you with basic health information. What's on your mind?"
  ],
  symptoms: {
    headache: [
      "For headaches, try resting in a quiet, dark room. Stay hydrated and consider applying a cold compress.",
      "Common headache remedies include adequate rest, hydration, and over-the-counter pain relievers. If headaches persist, consult a doctor."
    ],
    fever: [
      "For fever, rest and drink plenty of fluids. You can take acetaminophen or ibuprofen as directed. Seek medical attention if fever exceeds 103°F (39.4°C).",
      "Monitor your temperature and stay hydrated. If fever persists for more than 3 days, contact your healthcare provider."
    ],
    cough: [
      "For cough relief, try honey, warm water with lemon, or throat lozenges. If cough persists for more than 2 weeks, see a doctor.",
      "Stay hydrated and use a humidifier. Avoid smoking and irritants. Persistent coughs should be evaluated by a healthcare professional."
    ],
    nausea: [
      "For nausea, try ginger tea, small frequent meals, and avoiding strong odors. If symptoms persist, consult your doctor.",
      "Rest and try bland foods like crackers or toast. Stay hydrated with small sips of clear fluids."
    ]
  },
  general_health: [
    "Maintain a balanced diet with fruits, vegetables, whole grains, and lean proteins.",
    "Regular exercise, adequate sleep, and stress management are key to good health.",
    "Stay hydrated by drinking at least 8 glasses of water daily.",
    "Regular health check-ups can help prevent and detect health issues early."
  ],
  emergency: [
    "If this is a medical emergency, please call emergency services immediately or go to the nearest emergency room.",
    "For urgent medical concerns, please contact your healthcare provider or emergency services.",
    "I cannot provide emergency medical advice. Please seek immediate medical attention if needed."
  ],
  medication: [
    "Always take medications as prescribed by your healthcare provider.",
    "Keep track of your medications and their schedules using our reminder feature.",
    "Never share medications with others, and properly dispose of expired medications.",
    "If you experience side effects, contact your healthcare provider immediately."
  ],
  diet: [
    "A balanced diet includes a variety of foods from all food groups.",
    "Limit processed foods, added sugars, and excessive salt intake.",
    "Eat plenty of fruits and vegetables - aim for at least 5 servings daily.",
    "Stay hydrated and limit alcohol consumption."
  ]
};

// Function to determine response category based on user message
const categorizeMessage = (message) => {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return 'greetings';
  }
  
  if (lowerMessage.includes('emergency') || lowerMessage.includes('urgent') || lowerMessage.includes('911')) {
    return 'emergency';
  }
  
  if (lowerMessage.includes('headache') || lowerMessage.includes('head pain')) {
    return 'symptoms.headache';
  }
  
  if (lowerMessage.includes('fever') || lowerMessage.includes('temperature')) {
    return 'symptoms.fever';
  }
  
  if (lowerMessage.includes('cough') || lowerMessage.includes('coughing')) {
    return 'symptoms.cough';
  }
  
  if (lowerMessage.includes('nausea') || lowerMessage.includes('nauseous') || lowerMessage.includes('sick')) {
    return 'symptoms.nausea';
  }
  
  if (lowerMessage.includes('medication') || lowerMessage.includes('medicine') || lowerMessage.includes('pills')) {
    return 'medication';
  }
  
  if (lowerMessage.includes('diet') || lowerMessage.includes('food') || lowerMessage.includes('nutrition')) {
    return 'diet';
  }
  
  return 'general_health';
};

// Function to get response based on category
const getResponse = (category) => {
  if (category.includes('.')) {
    const [main, sub] = category.split('.');
    const responses = healthResponses[main][sub];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  const responses = healthResponses[category];
  return responses[Math.floor(Math.random() * responses.length)];
};

// @desc    Chat with health bot
// @route   POST /api/chatbot/chat
// @access  Private
router.post('/chat', [
  protect,
  body('message').notEmpty().withMessage('Message is required').isLength({ max: 5000 }).withMessage('Message too long')
], async (req, res) => {
  // Common disclaimer
  const disclaimer = "⚠️ This is general health information only and should not replace professional medical advice. Always consult with your healthcare provider for medical concerns.";

  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { message, history } = req.body;

    const hasOpenAI = !!(process.env.OPENAI_API_KEY);

    // If OpenAI is configured, use it. Otherwise, fallback to the rule-based responder.
    if (hasOpenAI && OpenAI) {
      try {
        const client = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
          baseURL: process.env.OPENAI_BASE_URL || undefined
        });

        const model = process.env.LLM_MODEL || 'gpt-4o-mini';

        // Build chat messages with a safety-oriented system prompt
        const systemPrompt = [
          "You are a helpful health information assistant for a medical records app.",
          "Provide general health education only. Do NOT diagnose or prescribe.",
          "When asked about emergencies, advise seeking immediate medical help.",
          "Keep answers concise, evidence-informed, and accessible."
        ].join(' ');

        const chatMessages = [
          { role: 'system', content: systemPrompt },
          ...(Array.isArray(history) ? history.filter(m => m && m.role && m.content).slice(-12) : []),
          { role: 'user', content: message }
        ];

        // Use Chat Completions for broad compatibility with OpenAI-compatible endpoints
        const completion = await client.chat.completions.create({
          model,
          messages: chatMessages,
          temperature: 0.3,
          max_tokens: 400
        });

        const botResponse = completion.choices?.[0]?.message?.content?.trim() || 'Sorry, I could not generate a response.';

        return res.status(200).json({
          success: true,
          data: {
            userMessage: message,
            botResponse,
            disclaimer,
            provider: 'openai',
            model,
            timestamp: new Date()
          }
        });
      } catch (llmErr) {
        console.error('LLM error:', llmErr?.response?.data || llmErr?.message || llmErr);
        // fall through to rule-based fallback
      }
    }

    // Fallback: categorize the message and get appropriate response
    const category = categorizeMessage(message);
    const response = getResponse(category);

    return res.status(200).json({
      success: true,
      data: {
        userMessage: message,
        botResponse: response,
        disclaimer: category !== 'greetings' ? disclaimer : null,
        provider: 'builtin',
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get chatbot capabilities
// @route   GET /api/chatbot/capabilities
// @access  Private
router.get('/capabilities', protect, (req, res) => {
  try {
    const capabilities = [
      'General health information',
      'Basic symptom guidance',
      'Medication reminders and tips',
      'Diet and nutrition advice',
      'Exercise recommendations',
      'Emergency contact information'
    ];

    const topics = [
      'Headaches and pain management',
      'Fever and temperature concerns',
      'Cough and respiratory issues',
      'Nausea and digestive problems',
      'Medication management',
      'Healthy diet and nutrition',
      'Exercise and fitness',
      'Sleep and rest'
    ];

    res.status(200).json({
      success: true,
      data: {
        capabilities,
        topics,
        disclaimer: "This chatbot provides general health information only and should not replace professional medical advice.",
        llm: {
          provider: process.env.OPENAI_API_KEY ? 'openai' : 'builtin',
          model: process.env.LLM_MODEL || null,
          baseURL: process.env.OPENAI_BASE_URL || null
        }
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get emergency contacts and information
// @route   GET /api/chatbot/emergency
// @access  Private
router.get('/emergency', protect, (req, res) => {
  try {
    const emergencyInfo = {
      emergency_services: {
        general: "911",
        poison_control: "1-800-222-1222",
        mental_health: "988" // Suicide & Crisis Lifeline
      },
      when_to_call: [
        "Chest pain or difficulty breathing",
        "Severe allergic reactions",
        "Loss of consciousness",
        "Severe injuries or bleeding",
        "Signs of stroke (face drooping, arm weakness, speech difficulty)",
        "High fever with severe symptoms"
      ],
      first_aid_basics: [
        "Call for help immediately in emergencies",
        "Stay calm and assess the situation",
        "Apply pressure to bleeding wounds",
        "Do not move someone with potential spinal injuries",
        "Perform CPR if trained and necessary"
      ]
    };

    res.status(200).json({
      success: true,
      data: emergencyInfo
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;