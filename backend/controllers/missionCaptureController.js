const MissionCapture = require('../models/MissionCapture');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { hammingDistance64 } = require('../utils/hashDistance');

const MAX_HAMMING_DUPLICATE = 12;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/missions/';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'mission-' + uniqueSuffix + (path.extname(file.originalname) || '.jpg'));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
});

const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 15MB.',
      });
    }
  }
  if (err && err.message === 'Only image files are allowed!') {
    return res.status(400).json({
      success: false,
      message: 'Only image files are allowed!',
    });
  }
  next(err);
};

const createMissionCapture = async (req, res) => {
  try {
    const userId = req.user.id;
    const { perceptualHash, label, confidencePercent, points } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image is required',
      });
    }

    if (!perceptualHash || typeof perceptualHash !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Missing perceptual hash',
      });
    }

    const hex = perceptualHash.trim().toLowerCase();
    if (!/^[0-9a-f]{16}$/.test(hex)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid perceptual hash',
      });
    }

    const existing = await MissionCapture.find({ userId }).select('perceptualHash').lean();
    for (const doc of existing) {
      if (hammingDistance64(hex, doc.perceptualHash) <= MAX_HAMMING_DUPLICATE) {
        try {
          fs.unlinkSync(req.file.path);
        } catch {
          // no-op
        }
        return res.status(409).json({
          success: false,
          duplicate: true,
          message:
            'This looks like the same object as a previous capture. Please photograph a different item to earn rewards.',
        });
      }
    }

    const imagePath = `/uploads/missions/${path.basename(req.file.path)}`;

    const pct = confidencePercent != null ? Number(confidencePercent) : 0;
    const pts = points != null ? Number(points) : 0;

    await MissionCapture.create({
      userId,
      image: imagePath,
      perceptualHash: hex,
      label: typeof label === 'string' ? label.slice(0, 200) : '',
      confidencePercent: Number.isFinite(pct) ? pct : 0,
      points: Number.isFinite(pts) ? Math.max(0, Math.min(10, Math.floor(pts))) : 0,
    });

    res.status(201).json({
      success: true,
      message: 'Capture saved',
      data: { image: imagePath },
    });
  } catch (error) {
    console.error('createMissionCapture:', error);
    if (req.file?.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch {
        // no-op
      }
    }
    res.status(500).json({
      success: false,
      message: 'Could not save capture',
    });
  }
};

module.exports = {
  upload,
  handleMulterError,
  createMissionCapture,
};
