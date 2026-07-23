import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    locality: { type: String, required: true }, // e.g., JLN Marg, Malviya Nagar, C-Scheme
    city: { type: String, default: 'Jaipur' },
    contactPhone: { type: String, required: true },
    emergencyPhone: { type: String, default: '108' },
    departments: [{ type: String }],
    imageUrl: { type: String, default: '' },
    doctors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' }],
    rating: { type: Number, default: 4.8 },
    googleMapQuery: { type: String, default: '' }
  },
  { timestamps: true }
);

export default mongoose.model('Hospital', hospitalSchema);
