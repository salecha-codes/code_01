import mongoose from 'mongoose';
export const CATEGORIES = [
  'Content Quality',
  'Speaker/Instructor',
  'Organization',
  'Venue/Facilities',
  'Overall Experience',
];
const feedbackSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    rating: { type: Number, required: true, min: 1, max: 5, validate: Number.isInteger },
    category: { type: String, required: true, enum: CATEGORIES },
    comment: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: '',
      validate: (value) => !value || value.length >= 3,
    },
    wouldRecommend: { type: Boolean },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);
feedbackSchema.index({ eventId: 1, createdAt: -1 });
feedbackSchema.index({ rating: 1, createdAt: -1 });
feedbackSchema.index({ createdAt: -1, _id: -1 });
export default mongoose.model('Feedback', feedbackSchema);
