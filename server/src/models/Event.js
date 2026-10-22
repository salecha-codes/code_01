import mongoose from 'mongoose';
const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 1000, default: '' },
    date: { type: Date, required: true },
    status: { type: String, enum: ['active', 'closed'], default: 'active' },
  },
  { timestamps: true },
);
eventSchema.index({ status: 1, date: -1 });
export default mongoose.model('Event', eventSchema);
