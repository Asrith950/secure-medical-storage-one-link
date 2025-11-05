const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const Tesseract = require('tesseract.js');
const sharp = require('sharp');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Local upload config allowing images, pdf, and dicom (.dcm)
const uploadDir = path.join(__dirname, '..', 'uploads', 'analysis');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `ai-${unique}${path.extname(file.originalname)}`);
  }
});

const allowed = [
  'image/jpeg', 'image/jpg', 'image/png',
  'application/pdf',
  'application/dicom', 'application/dicom+json', 'application/octet-stream'
];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const isDicom = ext === '.dcm';
  if (allowed.includes(file.mimetype) || isDicom) return cb(null, true);
  cb(new Error('Unsupported file type for AI analysis. Allowed: images, PDF, DICOM (.dcm).'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 20 * 1024 * 1024 } });

// Simple clinical heuristics to create a health summary from extracted text
function buildHealthSummary(text = '') {
  const summary = {
    keyVitals: {},
    possibleConditions: [],
    redFlags: [],
    suggestions: []
  };

  try {
    const bpMatch = text.match(/(?:BP|Blood Pressure)\s*[:\-]?\s*(\d{2,3})\/(\d{2,3})/i);
    if (bpMatch) summary.keyVitals.bloodPressure = `${bpMatch[1]}/${bpMatch[2]}`;

    const glucoseMatch = text.match(/(?:FBS|Fasting\s*Glucose|Glucose)\s*[:\-]?\s*(\d{2,3})/i);
    if (glucoseMatch) summary.keyVitals.glucose = `${glucoseMatch[1]} mg/dL`;

    const hba1c = text.match(/(?:HbA1c|A1C)\s*[:\-]?\s*(\d{1,2}\.\d)/i);
    if (hba1c) summary.keyVitals.hba1c = `${hba1c[1]} %`;

    const chol = text.match(/(?:Total\s*Cholesterol|Cholesterol)\s*[:\-]?\s*(\d{2,3})/i);
    if (chol) summary.keyVitals.totalCholesterol = `${chol[1]} mg/dL`;

    const keywordsToConditions = [
      { re: /(hypertension|high blood pressure)/i, cond: 'Hypertension' },
      { re: /(diabetes|hyperglycemia|hba1c\s*[>≥]\s*6\.?5?)/i, cond: 'Diabetes risk' },
      { re: /(hyperlipidemia|high cholesterol)/i, cond: 'Hyperlipidemia' },
      { re: /(asthma|wheezing)/i, cond: 'Asthma' }
    ];
    for (const k of keywordsToConditions) if (k.re.test(text)) summary.possibleConditions.push(k.cond);

    const redFlagPatterns = [
      /(chest pain|shortness of breath|severe headache|vision loss)/i,
      /(blood in stool|blood in urine)/i,
      /(unexplained weight loss|fainting)/i
    ];
    if (redFlagPatterns.some((p) => p.test(text))) summary.redFlags.push('Potential urgent symptoms present');

    // Generic tips (would be personalized with a proper model)
    summary.suggestions.push(
      'Maintain a balanced diet, regular exercise (150 min/week), and adequate sleep (7-9h).',
      'Schedule follow-up with your physician for abnormal labs or persistent symptoms.',
      'Keep an updated list of medications and allergies.'
    );
  } catch (e) {
    // no-op
  }

  return summary;
}

// Build lifestyle plan suggestions using detected vitals, conditions, and meds
function buildLifestylePlan(summary = {}, prescription = {}) {
  const plan = {
    sleep: {
      targetHours: '7-9 hours/night',
      schedule: 'Consistent bedtime and wake time (±30 minutes)'
    },
    diet: {
      focus: [],
      avoid: [],
      tips: []
    },
    hydration: {
      targetLiters: '2–3 L/day',
      tips: ['Increase during fever or hot weather']
    },
    activity: {
      targetMinutesPerWeek: 150,
      types: ['Brisk walk', 'Cycling', 'Swimming', 'Light strength training'],
      cautions: []
    },
    monitoring: {
      checks: []
    },
    reminders: {
      meds: [],
      general: ['Keep an updated list of medications and allergies']
    },
    redFlags: [...(summary.redFlags || [])]
  };

  const conds = new Set(summary.possibleConditions || []);
  const meds = (prescription.medications || []).map(m => (m.name || '').toLowerCase());

  // Diabetes or hyperglycemia
  if (conds.has('Diabetes risk') || /(glucose|hba1c)/i.test(JSON.stringify(summary.keyVitals || {}))) {
    plan.diet.focus.push('Low-glycemic whole foods: vegetables, legumes, whole grains, lean protein');
    plan.diet.avoid.push('Sugary drinks, refined carbs, large dessert portions');
    plan.activity.tips = ['Aim for 30 min/day; include post-meal walks (10–15 min)'];
    plan.monitoring.checks.push('Fasting glucose 1–2x/week or as advised', 'HbA1c every 3 months if uncontrolled');
    plan.reminders.general.push('Distribute carbs evenly across meals');
  }

  // Hypertension
  if (conds.has('Hypertension') || /\b\d{2,3}\/(?:\d{2,3})\b/.test((summary.keyVitals || {}).bloodPressure || '')) {
    plan.diet.focus.push('DASH-style diet: fruits, vegetables, low-fat dairy');
    plan.diet.avoid.push('Excess salt (>5g/day), processed foods, excess alcohol');
    plan.activity.tips = ['150–300 min/week moderate cardio'];
    plan.monitoring.checks.push('Home blood pressure log 3–4 days/week');
  }

  // Hyperlipidemia
  if (conds.has('Hyperlipidemia') || /(cholesterol)/i.test(JSON.stringify(summary.keyVitals || {}))) {
    plan.diet.focus.push('High-fiber foods (oats, beans), nuts, olive oil, fish 2x/week');
    plan.diet.avoid.push('Trans fats, deep-fried foods, excess red meat');
    plan.monitoring.checks.push('Fasting lipid profile every 3–6 months');
  }

  // Asthma
  if (conds.has('Asthma')) {
    plan.activity.cautions.push('Avoid triggers; warm up; carry rescue inhaler if prescribed');
    plan.reminders.general.push('Check inhaler technique and spacer use');
  }

  // GERD/gastritis hint (PPI use)
  if (meds.some(n => /(omep|panto|rabep|esomep)/.test(n))) {
    plan.diet.focus.push('Small, frequent meals; last meal 3 hours before bed');
    plan.diet.avoid.push('Spicy, fatty foods; caffeine; late-night meals');
    plan.sleep.notes = 'Elevate head of bed if night reflux';
  }

  // Antibiotic course → infection care
  if (meds.some(n => /(amox|azith|doxy|cef|oflox|levo|cipro|metronid)/.test(n))) {
    plan.hydration.tips.push('Extra fluids while on antibiotics');
    plan.reminders.meds.push('Complete the full antibiotic course; do not skip doses');
  }

  // NSAID caution
  if (meds.some(n => /(ibuprofen|diclofenac|naproxen|aceclofenac)/.test(n))) {
    plan.diet.tips.push('Take NSAIDs after food to reduce gastric irritation');
  }

  // General defaults if no condition hints found
  if (plan.diet.focus.length === 0) plan.diet.focus.push('Balanced plate: 1/2 vegetables, 1/4 protein, 1/4 whole grains');
  if (plan.diet.tips.length === 0) plan.diet.tips.push('Limit added sugar and ultra-processed foods');
  if (plan.monitoring.checks.length === 0) plan.monitoring.checks.push('Annual physical with basic labs');

  return plan;
}

// Parse prescriptions with heuristics to extract medications and instructions
function parsePrescription(raw = '') {
  const text = raw.replace(/\r/g, '').split('\n').map(l => l.trim()).filter(Boolean);

  const result = {
    header: {
      patient: null,
      age: null,
      sex: null,
      date: null
    },
    vitals: {},
    medications: [],
    instructions: []
  };

  try {
    const headerText = text.slice(0, 10).join(' ');
    const nameMatch = headerText.match(/(?:Mr\.?|Ms\.?|Mrs\.?|Name)\s*[:\-]?\s*([A-Za-z ]{2,40})/i);
    if (nameMatch) result.header.patient = nameMatch[1].trim();
    const ageMatch = headerText.match(/(?:Age)\s*[:\-]?\s*(\d{1,3})/i);
    if (ageMatch) result.header.age = ageMatch[1];
    const sexMatch = headerText.match(/\b(M|F|Male|Female)\b/i);
    if (sexMatch) result.header.sex = sexMatch[1];
    const dateMatch = headerText.match(/(?:Date|Dt|Dated)\s*[:\-]?\s*([0-3]?\d[\/\-.][01]?\d[\/\-.](?:\d{2}|\d{4}))/i);
    if (dateMatch) result.header.date = dateMatch[1];

    const joined = text.join(' ');
    const dash = (s) => s && s.replace(/\s{2,}/g, ' ').trim();
    const bpMatch = joined.match(/(?:BP|Blood Pressure)\s*[:\-]?\s*(\d{2,3})\s*\/?\s*(\d{2,3})/i);
    if (bpMatch) result.vitals.bp = `${bpMatch[1]}/${bpMatch[2]}`;
    const pulseMatch = joined.match(/(?:Pulse|HR)\s*[:\-]?\s*(\d{2,3})/i);
    if (pulseMatch) result.vitals.pulse = `${pulseMatch[1]} bpm`;
    const spo2Match = joined.match(/(?:SpO2|SPO2|O2)\s*[:\-]?\s*(\d{2})/i);
    if (spo2Match) result.vitals.spo2 = `${spo2Match[1]} %`;
    const tempMatch = joined.match(/(?:Temp|Temperature)\s*[:\-]?\s*([\d\.]{2,5})/i);
    if (tempMatch) result.vitals.temp = `${tempMatch[1]} °C`;

    // Medication line identifiers and patterns
    const freqMap = {
      'od': 'once daily',
      'bd': 'twice daily',
      'tid': 'three times daily',
      'qid': 'four times daily',
      'hs': 'at bedtime',
      'sos': 'as needed'
    };
    const isMedLine = (l) => /^(tab|cap|syr|inj|drop|cream|gel|ointment|\-|\u2022|\*)/i.test(l) || /(\b1-1-1\b|\b1-0-1\b|\bod\b|\bbd\b|\btid\b|\bqid\b|\bhs\b|\bsos\b)/i.test(l);
    const medCandidates = text.filter(isMedLine);

    const antibioticHints = /(amox|azith|doxy|clav|cef|cefi|cefix|oflox|levoflox|cipro|metronid)/i;
    const ppiHints = /(omep|panto|rabep|esomep)/i;
    const nsaidHints = /(ibuprofen|diclofenac|naproxen|aceclofenac)/i;
    const antihistHints = /(cetirizine|levocet|fexofenadine|loratadine)/i;

    medCandidates.forEach((line) => {
      const l = line.replace(/^[-•*]+\s*/, '').replace(/\s{2,}/g, ' ');
      const formMatch = l.match(/^(Tab\.?|Cap\.?|Syr\.?|Inj\.?|Drop\.?|Cream|Gel|Ointment)\s*/i);
      const form = formMatch ? formMatch[1].replace(/\.$/, '').toLowerCase() : null;
      const nameStrengthMatch = l.replace(/^(Tab\.?|Cap\.?|Syr\.?|Inj\.?|Drop\.?|Cream|Gel|Ointment)\s*/i, '')
        .match(/^([A-Za-z][A-Za-z0-9+\- ]{2,50}?)(?:\s+(\d+\s*(?:mg|mcg|g|ml)))?/i);
      const name = nameStrengthMatch ? dash(nameStrengthMatch[1]) : null;
      const strength = nameStrengthMatch && nameStrengthMatch[2] ? nameStrengthMatch[2] : null;

      const freqMatch = l.match(/\b(1-1-1|1-0-1|1-0-0|0-1-1|0-0-1|0-1-0|od|bd|tid|qid|hs|sos)\b/i);
      const freqRaw = freqMatch ? freqMatch[1].toLowerCase() : null;
      const frequency = freqRaw && freqMap[freqRaw] ? freqMap[freqRaw] : freqRaw;

      const durationMatch = l.match(/\bfor\s+(\d{1,2})\s*(day|days|week|weeks)\b/i) || l.match(/\b(\d{1,2})\s*(day|days|week|weeks)\b/i);
      const duration = durationMatch ? `${durationMatch[1]} ${durationMatch[2]}` : null;

      const notes = [];
      if (ppiHints.test(l) || ppiHints.test(name || '')) notes.push('Take 30 minutes before breakfast');
      if (nsaidHints.test(l) || nsaidHints.test(name || '')) notes.push('Take after food; may cause gastric irritation');
      if (antihistHints.test(l) || antihistHints.test(name || '')) notes.push('May cause drowsiness; avoid driving');
      if (antibioticHints.test(l) || antibioticHints.test(name || '')) notes.push('Complete the full course; do not skip doses');

      if (name) {
        result.medications.push({ name, form, strength, frequency, duration, notes });
      }
    });

    // High-level instructions
    if (result.medications.some(m => antibioticHints.test(m.name))) {
      result.instructions.push('Antibiotic prescribed: complete the full course even if you feel better.');
    }
    if (result.medications.some(m => ppiHints.test(m.name))) {
      result.instructions.push('Acid-reducer noted: take before breakfast for best effect.');
    }
    if (Object.keys(result.vitals).length === 0) {
      result.instructions.push('Vitals not clearly captured; double-check BP, pulse, and temperature if noted.');
    }
  } catch (e) {
    // no-op
  }

  return result;
}

// POST /api/ai/analyze
router.post('/analyze', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const filePath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase();
    const mime = req.file.mimetype;

    let extractedText = '';
    let fileType = 'unknown';

    if (mime === 'application/pdf' || ext === '.pdf') {
      fileType = 'pdf';
      const data = await pdfParse(fs.readFileSync(filePath));
      extractedText = data.text || '';
    } else if (mime.startsWith('image/') || ['.jpg', '.jpeg', '.png'].includes(ext)) {
      fileType = 'image';
      // Preprocess to improve OCR
      const preprocessedPath = filePath.replace(/(\.[a-z]+)$/i, '-pre$1');
      try {
        await sharp(filePath)
          .grayscale()
          .normalize()
          .resize({ width: 2000, withoutEnlargement: false })
          .median(1)
          .toFile(preprocessedPath);
      } catch (e) {
        // fallback to original
      }
      const ocrTarget = fs.existsSync(preprocessedPath) ? preprocessedPath : filePath;
      const result = await Tesseract.recognize(ocrTarget, 'eng', {
        logger: () => {},
        tessedit_pageseg_mode: 6,
        preserve_interword_spaces: '1'
      });
      extractedText = (result && result.data && result.data.text) ? result.data.text : '';
    } else if (ext === '.dcm') {
      fileType = 'dicom';
      // We do not parse pixel data here. Client will render with Cornerstone.
      extractedText = 'DICOM file detected. Use the DICOM viewer to inspect in 2D/3D.';
    } else {
      return res.status(400).json({ success: false, message: 'Unsupported file type' });
    }

  const summary = buildHealthSummary(extractedText);
  const prescription = parsePrescription(extractedText);
  const lifestylePlan = buildLifestylePlan(summary, prescription);

    return res.status(200).json({
      success: true,
      fileType,
      extractedText,
      summary,
      prescription,
      lifestylePlan
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Analysis failed. ' + err.message });
  }
});

module.exports = router;
