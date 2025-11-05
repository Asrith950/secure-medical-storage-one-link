// Simple client-side i18n for AI summary modal
// Usage: t(lang, key) for known labels; tx(lang, text) best-effort phrase translation

export const LANGS = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'kn', label: 'ಕನ್ನಡ' }
];

const dict = {
  en: {},
  hi: {
    'AI Health Summary': 'एआई स्वास्थ्य सारांश',
    'File Type': 'फ़ाइल प्रकार',
    'Vitals Detected': 'पाए गए महत्वपूर्ण संकेत',
    'Possible Conditions': 'संभावित स्थितियां',
    'Red Flags': 'चेतावनी संकेत',
    'Suggestions': 'सुझाव',
    'Key Vitals': 'मुख्य महत्वपूर्ण संकेत',
    'None detected.': 'कोई नहीं मिला।',
    'Prescription Summary': 'दवा पर्ची सारांश',
    'Date': 'तारीख',
    'Form': 'रूप',
    'Additional Instructions': 'अतिरिक्त निर्देश',
    'Personalized Lifestyle Plan': 'व्यक्तिगत जीवनशैली योजना',
    'Sleep': 'नींद',
    'Diet': 'आहार',
    'Focus': 'ध्यान दें',
    'Avoid': 'बचें',
    'Tips': 'टिप्स',
    'Hydration': 'हाइड्रेशन',
    'Target': 'लक्ष्य',
    'Activity': 'गतिविधि',
    'Goal': 'लक्ष्य',
    'Types': 'प्रकार',
    'Cautions': 'सावधानियां',
    'Monitoring': 'निगरानी',
    'Reminders': 'अनुस्मारक',
    'Close': 'बंद करें',
    'Disclaimer: This is an automated summary to help you understand your document. It is not medical advice.': 'अस्वीकरण: यह आपके दस्तावेज़ को समझने में मदद के लिए स्वचालित सारांश है। यह चिकित्सीय सलाह नहीं है।',
    // Common suggestions
    'Maintain a balanced diet, regular exercise (150 min/week), and adequate sleep (7-9h).': 'संतुलित आहार, नियमित व्यायाम (साप्ताहिक 150 मिनट) और पर्याप्त नींद (7-9 घंटे) बनाए रखें।',
    'Schedule follow-up with your physician for abnormal labs or persistent symptoms.': 'असामान्य रिपोर्ट या लगातार लक्षणों के लिए अपने चिकित्सक से फॉलो-अप कराएं।',
    'Keep an updated list of medications and allergies.': 'दवाइयों और एलर्जी की अद्यतन सूची रखें।',
    // Medication notes
    'Take 30 minutes before breakfast': 'नाश्ते से 30 मिनट पहले लें',
    'Take after food; may cause gastric irritation': 'भोजन के बाद लें; पेट में जलन हो सकती है',
    'May cause drowsiness; avoid driving': 'नींद आ सकती है; गाड़ी चलाने से बचें',
    'Complete the full course; do not skip doses': 'पूरा कोर्स पूरा करें; खुराक न छोड़ें'
  },
  kn: {
    'AI Health Summary': 'ಎಐ ಆರೋಗ್ಯ ಸಂಕ್ಷೆಪ',
    'File Type': 'ಫೈಲ್ ಪ್ರಕಾರ',
    'Vitals Detected': 'ಪತ್ತೆಯಾದ ಪ್ರಮುಖ ಲಕ್ಷಣಗಳು',
    'Possible Conditions': 'ಸಂಭವ್ಯ ಸ್ಥಿತಿಗಳು',
    'Red Flags': 'ಎಚ್ಚರಿಕೆಯ ಲಕ್ಷಣಗಳು',
    'Suggestions': 'ಸಲಹೆಗಳು',
    'Key Vitals': 'ಮುಖ್ಯ ವೈಟಲ್ಸ್',
    'None detected.': 'ಯಾವುದೂ ಕಂಡುಬಂದಿಲ್ಲ.',
    'Prescription Summary': 'ಔಷಧಿ ಪರ್ಸ್ಕ್ರಿಪ್ಷನ್ ಸಂಕ್ಷಿಪ್ತ',
    'Date': 'ದಿನಾಂಕ',
    'Form': 'ರೂಪ',
    'Additional Instructions': 'ಹೆಚ್ಚುವರಿ ಸೂಚನೆಗಳು',
    'Personalized Lifestyle Plan': 'ವೈಯಕ್ತಿಕ ಜೀವನಶೈಲಿ ಯೋಜನೆ',
    'Sleep': 'ನಿದ್ರೆ',
    'Diet': 'ಆಹಾರ',
    'Focus': 'ಗಮನ ಕೊಡಿ',
    'Avoid': 'ತಪ್ಪಿಸಿ',
    'Tips': 'ಸಲಹೆಗಳು',
    'Hydration': 'ದ್ರವಪಾನ',
    'Target': 'ಲಕ್ಷ್ಯ',
    'Activity': 'ಚಟುವಟಿಕೆ',
    'Goal': 'ಗುರಿ',
    'Types': 'ಪ್ರಕಾರಗಳು',
    'Cautions': 'ಜಾಗ್ರತೆಗಳು',
    'Monitoring': 'ನೆರವನ್ನು ವೀಕ್ಷಣೆ',
    'Reminders': 'ಸ್ಮರಣಿಕೆಗಳು',
    'Close': 'ಮುಚ್ಚಿ',
    'Disclaimer: This is an automated summary to help you understand your document. It is not medical advice.': 'ಅಸ್ಪೋಟನೆ: ಇದು ನಿಮ್ಮ ದಾಖಲೆ ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ಸಹಾಯ ಮಾಡುವ ಸ್ವಯಂಚಾಲಿತ ಸಂಕ್ಷಿಪ್ತ. ಇದು ವೈದ್ಯಕೀಯ ಸಲಹೆ ಅಲ್ಲ.',
    // Common suggestions
    'Maintain a balanced diet, regular exercise (150 min/week), and adequate sleep (7-9h).': 'ಸಮತೋಲಿತ ಆಹಾರ, ನಿಯಮಿತ ವ್ಯಾಯಾಮ (ವಾರಕ್ಕೆ 150 ನಿಮಿ) ಮತ್ತು ಪರ್ಯಾಯ ನಿದ್ರೆ (7-9 ಗಂಟೆ) ಕಾಯ್ದುಕೊಳ್ಳಿ.',
    'Schedule follow-up with your physician for abnormal labs or persistent symptoms.': 'ಅಸಾಧಾರಣ ವರದಿಗಳು ಅಥವಾ ನಿರಂತರ ಲಕ್ಷಣಗಳಿಗೆ ನಿಮ್ಮ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ.',
    'Keep an updated list of medications and allergies.': 'ಔಷಧಿಗಳು ಮತ್ತು ಅಲರ್ಜಿಗಳ ನವೀಕರಿಸಿದ ಪಟ್ಟಿಯನ್ನು ಇಡಿ.',
    // Medication notes
    'Take 30 minutes before breakfast': 'ಉಪಾಹಾರದ 30 ನಿಮಿಷ ಮೊದಲು ತೆಗೆದುಕೊಳ್ಳಿ',
    'Take after food; may cause gastric irritation': 'ಆಹಾರದ ನಂತರ ತೆಗೆದುಕೊಳ್ಳಿ; ಹೊಟ್ಟೆಜ್ವರ ಉಂಟಾಗಬಹುದು',
    'May cause drowsiness; avoid driving': 'ನಿದ್ದೆ ತರಬಹುದು; ವಾಹನ ಚಲಾಯಿಸುವುದನ್ನು ತಪ್ಪಿಸಿ',
    'Complete the full course; do not skip doses': 'ಪೂರ್ಣ ಕೋರ್ಸ್ ಮುಗಿಸಿ; ಪ್ರಮಾಣಗಳನ್ನು ತಪ್ಪಿಸಬೇಡಿ'
  }
};

export function t(lang, key) {
  const table = dict[lang] || dict.en;
  return table[key] || key;
}

export function tx(lang, text) {
  // best-effort: try full match first; otherwise split by ';' and map parts
  const table = dict[lang] || dict.en;
  if (table[text]) return table[text];
  if (!text) return text;
  if (text.includes(';')) {
    return text.split(';').map(s => (table[s.trim()] || s.trim())).join('; ');
  }
  return table[text] || text;
}
