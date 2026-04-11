const mongoose = require('mongoose');

const missionCaptureSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    image: {
      type: String,
      required: true,
    },
    perceptualHash: {
      type: String,
      required: true,
      maxlength: 32,
    },
    label: {
      type: String,
      default: '',
    },
    confidencePercent: {
      type: Number,
      default: 0,
    },
    points: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

missionCaptureSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('MissionCapture', missionCaptureSchema);
