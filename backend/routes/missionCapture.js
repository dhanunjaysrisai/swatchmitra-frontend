const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  upload,
  handleMulterError,
  createMissionCapture,
} = require('../controllers/missionCaptureController');

router.post('/', auth, upload.single('image'), handleMulterError, createMissionCapture);

module.exports = router;
