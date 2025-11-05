const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for allowed file types
const fileFilter = (req, file, cb) => {
  // Allowed file types for medical records (including DICOM .dcm)
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExt = /(\.jpeg|\.jpg|\.png|\.gif|\.pdf|\.doc|\.docx|\.dcm)$/i.test(ext);
  const allowedMime = /(image\/jpeg|image\/jpg|image\/png|image\/gif|application\/pdf|application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document|application\/dicom|application\/dicom\+json|application\/octet-stream)/i.test(file.mimetype);

  if (allowedExt && (allowedMime || ext === '.dcm')) {
    return cb(null, true);
  } else {
    cb(new Error('Only images, documents (PDF, DOC, DOCX), and DICOM (.dcm) files are allowed!'));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: fileFilter
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected field name.'
      });
    }
  }
  
  if (err.message === 'Only images, documents (PDF, DOC, DOCX), and DICOM (.dcm) files are allowed!') {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  next(err);
};

module.exports = { upload, handleMulterError };