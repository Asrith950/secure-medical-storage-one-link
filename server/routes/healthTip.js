const express = require('express');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Health tips data (in a real app, this would come from a database)
const healthTips = [
  {
    category: 'diet',
    tips: [
      'Drink at least 8 glasses of water daily to stay hydrated.',
      'Include 5 servings of fruits and vegetables in your daily diet.',
      'Choose whole grains over refined grains for better nutrition.',
      'Limit processed foods and added sugars in your meals.',
      'Eat smaller, more frequent meals to maintain energy levels.'
    ]
  },
  {
    category: 'exercise',
    tips: [
      'Aim for at least 30 minutes of moderate exercise daily.',
      'Take breaks every hour if you work at a desk.',
      'Include both cardio and strength training in your routine.',
      'Start with light exercises and gradually increase intensity.',
      'Take the stairs instead of elevators when possible.'
    ]
  },
  {
    category: 'mental_health',
    tips: [
      'Practice deep breathing exercises to reduce stress.',
      'Get 7-9 hours of quality sleep each night.',
      'Maintain social connections with family and friends.',
      'Practice mindfulness or meditation for 10 minutes daily.',
      'Take breaks from screen time throughout the day.'
    ]
  },
  {
    category: 'general',
    tips: [
      'Wash your hands frequently to prevent infections.',
      'Schedule regular health check-ups with your doctor.',
      'Protect your skin from excessive sun exposure.',
      'Maintain good posture while sitting and standing.',
      'Keep a positive attitude and practice gratitude daily.'
    ]
  }
];

// @desc    Get daily health tip
// @route   GET /api/health-tips/daily
// @access  Private
router.get('/daily', protect, (req, res) => {
  try {
    // Get a random tip from all categories
    const allTips = healthTips.flatMap(category => 
      category.tips.map(tip => ({ ...tip, category: category.category }))
    );
    
    const randomIndex = Math.floor(Math.random() * allTips.length);
    const dailyTip = allTips[randomIndex];

    res.status(200).json({
      success: true,
      data: {
        tip: dailyTip,
        date: new Date().toDateString()
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

// @desc    Get health tips by category
// @route   GET /api/health-tips/:category
// @access  Private
router.get('/:category', protect, (req, res) => {
  try {
    const { category } = req.params;
    
    const categoryTips = healthTips.find(cat => cat.category === category);
    
    if (!categoryTips) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      data: categoryTips
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get all health tip categories
// @route   GET /api/health-tips
// @access  Private
router.get('/', protect, (req, res) => {
  try {
    const categories = healthTips.map(cat => ({
      category: cat.category,
      tipCount: cat.tips.length
    }));

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Calculate BMI
// @route   POST /api/health-tips/bmi
// @access  Private
router.post('/bmi', protect, (req, res) => {
  try {
    const { weight, height, unit } = req.body;

    if (!weight || !height) {
      return res.status(400).json({
        success: false,
        message: 'Weight and height are required'
      });
    }

    let bmi;
    let weightKg = weight;
    let heightM = height;

    // Convert to metric if needed
    if (unit === 'imperial') {
      weightKg = weight * 0.453592; // pounds to kg
      heightM = height * 0.0254; // inches to meters
    } else {
      heightM = height / 100; // cm to meters
    }

    bmi = weightKg / (heightM * heightM);
    bmi = Math.round(bmi * 10) / 10; // Round to 1 decimal place

    let category;
    let recommendations = [];

    if (bmi < 18.5) {
      category = 'Underweight';
      recommendations = [
        'Consider consulting a healthcare provider about healthy weight gain',
        'Include nutrient-dense foods in your diet',
        'Focus on strength training exercises'
      ];
    } else if (bmi >= 18.5 && bmi < 25) {
      category = 'Normal weight';
      recommendations = [
        'Maintain your current healthy lifestyle',
        'Continue regular exercise and balanced diet',
        'Monitor your weight regularly'
      ];
    } else if (bmi >= 25 && bmi < 30) {
      category = 'Overweight';
      recommendations = [
        'Consider gradual weight loss through diet and exercise',
        'Increase physical activity to 60 minutes per day',
        'Focus on portion control and healthy food choices'
      ];
    } else {
      category = 'Obese';
      recommendations = [
        'Consult with a healthcare provider for a weight management plan',
        'Focus on gradual, sustainable weight loss',
        'Consider working with a nutritionist'
      ];
    }

    res.status(200).json({
      success: true,
      data: {
        bmi,
        category,
        recommendations,
        calculatedAt: new Date()
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

module.exports = router;