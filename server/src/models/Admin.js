import mongoose from 'mongoose';
const adminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['admin'], default: 'admin' },
    // Changing this value revokes all previously issued tokens for this admin.
    sessionVersion: { type: Number, default: 0, select: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);
export default mongoose.model('Admin', adminSchema);
