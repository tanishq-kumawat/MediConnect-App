import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    specialization: {
      type: String,
      required: true,
      enum: [
        'General Physician',
        'Dermatologist',
        'Physiotherapist',
        'Pediatrician',
        'Cardiologist',
        'Orthopedic',
        'Neurologist',
        'ENT Specialist'
      ]
    },
    hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
    consultationFee: { type: Number, required: true },
    consultationTypes: {
      type: [String],
      enum: ['Online', 'Offline', 'Both'],
      default: ['Both']
    },
    availabilitySlots: [
      {
        day: { type: String, required: true }, // e.g. "Monday", "Tuesday"
        times: [{ type: String }] // e.g. ["09:00 AM - 09:30 AM", "10:00 AM - 10:30 AM"]
      }
    ],
    rating: { type: Number, default: 4.8 },
    experienceYears: { type: Number, default: 10 },
    imageUrl: { type: String, required: true },
    bio: { type: String, default: '' },
    qualification: { type: String, default: 'MBBS, MD' },
    email: { type: String, default: '' }
  },
  { timestamps: true }
);

export default mongoose.model('Doctor', doctorSchema);
