const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getMyComplaints,
  getComplaint,
  updateComplaintStatus,
  getAllComplaints,
  getComplaintStats,
  upload,
  handleMulterError
} = require('../controllers/complaintController');
const auth = require('../middleware/auth');

// @route   POST /api/complaints
// @desc    Create a new complaint
// @access  Private
router.post('/', auth, upload.single('image'), handleMulterError, createComplaint);

// @route   GET /api/complaints/stats
// @desc    Get complaint statistics (admin only)
// @access  Private/Admin
router.get('/stats', auth, getComplaintStats);

// @route   GET /api/complaints/my-complaints
// @desc    Get user's complaints
// @access  Private
router.get('/my-complaints', auth, getMyComplaints);

// @route   GET /api/complaints
// @desc    Get all complaints (admin only)
// @access  Private/Admin
router.get('/', auth, getAllComplaints);

// @route   GET /api/complaints/:id
// @desc    Get a single complaint
// @access  Private
router.get('/:id', auth, getComplaint);

// @route   PUT /api/complaints/:id/status
// @desc    Update complaint status (admin only)
// @access  Private/Admin
router.put('/:id/status', auth, updateComplaintStatus);

module.exports = router;
