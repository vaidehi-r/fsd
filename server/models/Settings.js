import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    commissionPercent: {
      type: Number,
      default: 10,
      min: 0,
      max: 50,
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
